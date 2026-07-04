import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are AI-Sana, a real AI tutor for pupils preparing for NIS, BIL, and NSPM entrance exams. Answer any normal study question naturally, like ChatGPT or Gemini, but in a warm tutor style for pupils aged 10-14. Understand short, misspelled, mixed Kazakh/Russian/English messages by context. Do not give canned template answers. Do not keep asking the pupil to rewrite the question. If the question is unclear, make the most helpful reasonable assumption, answer with an example, and ask only one focused follow-up question. For math and logic, explain the method first, then give the answer. If the pupil answers a test question, check it and give a full explanation whether it is right or wrong. Keep answers clear, compact, and useful.";

const chatRequestSchema = z.object({
  language: z.enum(["EN", "KZ", "RU"]).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const COMPLETE_ENDING_PATTERN = /[.!?。؟…)"'»\]]$/;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;

        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = chatRequestSchema.safeParse(body);

        if (!parsed.success) {
          return Response.json(
            { error: "Please send at least one valid message." },
            { status: 400 },
          );
        }

        const recentMessages = parsed.data.messages.slice(-12);
        const answerLanguage = getAnswerLanguage(parsed.data.language, recentMessages);

        if (!getGoogleApiKey()) {
          return Response.json({
            reply: getServiceMessage(answerLanguage.code),
          });
        }

        try {
          const conversation = buildConversation(recentMessages);
          let reply = "";
          let lastError: unknown;

          for (const model of GEMINI_MODELS) {
            try {
              reply = await generateTutorReply(model, conversation, answerLanguage.instruction);
              reply = await fixReplyIfNeeded(model, {
                conversation,
                language: answerLanguage.code,
                reply,
                previousReply: lastAssistantMessage(recentMessages),
                instruction: answerLanguage.instruction,
              });

              if (reply) {
                break;
              }
            } catch (error) {
              lastError = error;
              const statusCode =
                error != null && typeof error === "object" && "status" in error
                  ? (error as { status?: number }).status
                  : undefined;

              if (statusCode !== 429 && statusCode !== 503 && statusCode !== 404) {
                throw error;
              }
            }
          }

          if (!reply) {
            if (lastError) {
              console.error("AI-Sana Gemini Tutor model layer failed", lastError);
            }
            return Response.json({
              reply: getServiceMessage(answerLanguage.code),
            });
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("AI-Sana Gemini Tutor error", error);
          return Response.json({
            reply: getServiceMessage(answerLanguage.code),
          });
        }
      },
    },
  },
});

type AnswerLanguage = {
  code: "EN" | "KZ" | "RU";
  instruction: string;
};

type ReplyFixOptions = {
  conversation: string;
  instruction: string;
  language: "EN" | "KZ" | "RU";
  previousReply: string;
  reply: string;
};

function buildConversation(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return messages
    .map((message) => `${message.role === "user" ? "Pupil" : "AI-Sana"}: ${message.content}`)
    .join("\n\n");
}

async function generateTutorReply(
  model: string,
  conversation: string,
  languageInstruction: string,
) {
  const response = await generateGeminiContent({
    model,
    prompt: conversation,
    systemInstruction: `${SYSTEM_PROMPT}\n\n${languageInstruction}`,
    temperature: 0.65,
    maxOutputTokens: 3500,
  });
  let reply = response.trim();

  if (reply && !COMPLETE_ENDING_PATTERN.test(reply)) {
    const continuationText = await generateGeminiContent({
      model,
      prompt: `${conversation}\n\nAI-Sana: ${reply}\n\nPupil: Continue from exactly where you stopped and finish the answer. Do not repeat previous text.`,
      systemInstruction: `${SYSTEM_PROMPT}\n\n${languageInstruction}`,
      temperature: 0.45,
      maxOutputTokens: 1200,
    });

    if (continuationText) {
      reply = `${reply} ${continuationText.trim()}`;
    }
  }

  return reply;
}

async function fixReplyIfNeeded(
  model: string,
  options: ReplyFixOptions,
) {
  const trimmedReply = options.reply.trim();

  if (!trimmedReply) {
    return "";
  }

  const shouldRegenerate =
    trimmedReply === options.previousReply.trim() ||
    isUnhelpfulClarification(trimmedReply) ||
    detectTextLanguage(trimmedReply, options.language) !== options.language;

  if (!shouldRegenerate) {
    return trimmedReply;
  }

  const response = await generateGeminiContent({
    model,
    prompt: `${options.conversation}\n\nYour previous draft was not useful enough or was in the wrong language:\n${trimmedReply}\n\nWrite a fresh answer now. Understand the pupil's intent, answer directly, do not ask them to rewrite the question, and do not repeat your previous answer.`,
    systemInstruction: `${SYSTEM_PROMPT}\n\n${options.instruction}`,
    temperature: 0.75,
    maxOutputTokens: 2500,
  });

  return response.trim() || trimmedReply;
}

async function generateGeminiContent({
  maxOutputTokens,
  model,
  prompt,
  systemInstruction,
  temperature,
}: {
  maxOutputTokens: number;
  model: string;
  prompt: string;
  systemInstruction: string;
  temperature: number;
}) {
  const apiKey = getGoogleApiKey();

  if (!apiKey) {
    return "";
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens,
          temperature,
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      }),
    },
  );

  if (!response.ok) {
    const error = new Error(`Gemini REST request failed: ${response.status}`);
    (error as { status?: number }).status = response.status;
    throw error;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return (
    data.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function getAnswerLanguage(
  language: "EN" | "KZ" | "RU" | undefined,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): AnswerLanguage {
  const userText = lastUserMessage(messages);
  const detectedLanguage = detectTextLanguage(userText, language);

  if (detectedLanguage === "KZ") {
    return {
      code: "KZ",
      instruction:
        "Reply only in natural Kazakh Cyrillic. If the pupil writes Kazakh without special Kazakh letters, still answer in Kazakh. Do not switch to Russian or English unless the pupil explicitly asks for translation.",
    };
  }

  if (detectedLanguage === "RU") {
    return {
      code: "RU",
      instruction:
        "Reply only in natural Russian. Do not switch to Kazakh or English unless the pupil explicitly asks for translation.",
    };
  }

  return {
    code: "EN",
    instruction:
      "Reply only in English. Do not switch to Kazakh or Russian unless the pupil explicitly asks for translation.",
  };
}

function lastUserMessage(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function lastAssistantMessage(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return [...messages].reverse().find((message) => message.role === "assistant")?.content ?? "";
}

function detectTextLanguage(text: string, defaultLanguage?: "EN" | "KZ" | "RU"): "EN" | "KZ" | "RU" {
  const normalizedText = text.toLowerCase();

  if (/[әғқңөұүһі]/i.test(text)) {
    return "KZ";
  }

  if (
    /\b(пайыз|деген|қалай|калай|маған|маган|түсіндір|тусиндир|есеп|шығар|шыгар|дайындал|жауап|сұрақ|сурак|қазақ|казак|ағылшын|агылшын|маған|маган|жондеши|істе|исте|бер|керек|емес)\b/i.test(
      normalizedText,
    )
  ) {
    return "KZ";
  }

  if (
    /\b(привет|здравствуй|как|что|почему|объясни|реши|задача|процент|подготов|русский|английский|нужно|сделай|исправь)\b/i.test(
      normalizedText,
    )
  ) {
    return "RU";
  }

  if (/[а-яё]/i.test(text)) {
    return defaultLanguage === "KZ" ? "KZ" : "RU";
  }

  if (/[a-z]/i.test(text)) {
    return "EN";
  }

  return defaultLanguage ?? "EN";
}

function isUnhelpfulClarification(reply: string) {
  return /пришли условие|жазып жібер|қайта жаз|send the full question|send the question again|напиши вопрос еще раз/i.test(
    reply,
  );
}

function getServiceMessage(language: "EN" | "KZ" | "RU") {
  if (language === "KZ") {
    return "AI-Sana қазір жауапты дайындап үлгермеді. Бір секундтан кейін осы сұрақты қайта жіберсең, мен нақты түсіндіріп беремін.";
  }

  if (language === "RU") {
    return "AI-Sana сейчас не успела подготовить ответ. Отправь этот же вопрос еще раз через секунду, и я отвечу по сути.";
  }

  return "AI-Sana could not prepare the answer in time. Send the same question again in a second, and I will answer directly.";
}

function getGoogleApiKey() {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
}
