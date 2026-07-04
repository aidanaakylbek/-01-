import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are AI-Sana AI Tutor. You help pupils prepare for NIS, BIL, and NSPM entrance exams. Explain clearly, simply, and step by step. Do not only give the final answer; teach the pupil how to solve the problem. If the pupil asks a math or logic question, first explain the method, then give the answer. If the pupil makes a mistake, explain the mistake kindly. Use encouraging language. Keep answers age-appropriate for pupils aged 10-14. Help with math, logic, reading comprehension, English, Kazakh, Russian, study plans, exam preparation, and motivation. If the question is dangerous, medical, legal, or very personal, answer safely and suggest asking a parent, teacher, or trusted adult. Keep answers complete but compact: usually 4-8 short paragraphs or bullet points. Always finish with a clear final answer or next step.";

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

        if (!process.env.GOOGLE_API_KEY) {
          return Response.json(
            {
              code: "missing_google_key",
              error:
                "AI tutor is not configured yet. Please add GOOGLE_API_KEY to your server environment.",
            },
            { status: 500 },
          );
        }

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
          const recentMessages = parsed.data.messages.slice(-12);
          const answerLanguage = getAnswerLanguage(parsed.data.language, recentMessages);
          const conversation = recentMessages
            .map((message) => `${message.role === "user" ? "Pupil" : "Tutor"}: ${message.content}`)
            .join("\n\n");
          let reply = "";
          let lastError: unknown;

          for (const model of GEMINI_MODELS) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: conversation,
                config: {
                  maxOutputTokens: 3000,
                  temperature: 0.4,
                  systemInstruction: `${SYSTEM_PROMPT}\n\n${answerLanguage.instruction}`,
                },
              });
              reply = response.text?.trim() ?? "";
              if (reply && !COMPLETE_ENDING_PATTERN.test(reply)) {
                const continuation = await ai.models.generateContent({
                  model,
                  contents: `${conversation}\n\nTutor: ${reply}\n\nPupil: Continue from exactly where you stopped and finish the answer in 3-5 short sentences. Do not repeat the previous text.`,
                  config: {
                    maxOutputTokens: 900,
                    temperature: 0.3,
                    systemInstruction: `${SYSTEM_PROMPT}\n\n${answerLanguage.instruction}`,
                  },
                });
                const continuationText = continuation.text?.trim();
                if (continuationText) {
                  reply = `${reply} ${continuationText}`;
                }
              }
              if (reply) break;
            } catch (error) {
              lastError = error;
              const status = error != null && typeof error === "object" ? "status" in error : false;
              const statusCode = status ? (error as { status?: number }).status : undefined;
              if (statusCode !== 429 && statusCode !== 503 && statusCode !== 404) {
                throw error;
              }
            }
          }

          if (!reply) {
            if (lastError) {
              console.error("AI-Sana Gemini Tutor fallback failed", lastError);
            }
            return Response.json({
              reply: createLocalTutorFallback(answerLanguage.code, lastUserMessage(recentMessages)),
            });
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("AI-Sana Gemini Tutor error", error);
          const recentMessages = parsed.data.messages.slice(-12);
          const answerLanguage = getAnswerLanguage(parsed.data.language, recentMessages);
          return Response.json({
            reply: createLocalTutorFallback(answerLanguage.code, lastUserMessage(recentMessages)),
          });
        }
      },
    },
  },
});

function getAnswerLanguage(
  language: "EN" | "KZ" | "RU" | undefined,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const userText = lastUserMessage(messages);
  const detectedLanguage = detectTextLanguage(userText, language);

  if (detectedLanguage === "KZ") {
    return {
      code: "KZ" as const,
      instruction:
        "IMPORTANT: Reply only in Kazakh. If the pupil writes Kazakh in Cyrillic, answer in natural Kazakh Cyrillic. Do not switch to English or Russian unless the pupil explicitly asks for translation or language comparison.",
    };
  }

  if (detectedLanguage === "RU") {
    return {
      code: "RU" as const,
      instruction:
        "IMPORTANT: Reply only in Russian. Do not switch to English or Kazakh unless the pupil explicitly asks for translation or language comparison.",
    };
  }

  return {
    code: "EN" as const,
    instruction:
      "IMPORTANT: Reply only in English. Do not switch to Kazakh or Russian unless the pupil explicitly asks for translation or language comparison.",
  };
}

function lastUserMessage(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function detectTextLanguage(text: string, fallbackLanguage?: "EN" | "KZ" | "RU"): "EN" | "KZ" | "RU" {
  if (/[әғқңөұүһі]/i.test(text)) {
    return "KZ";
  }

  if (/[а-яё]/i.test(text)) {
    return "RU";
  }

  if (/[a-z]/i.test(text)) {
    return "EN";
  }

  return fallbackLanguage ?? "EN";
}

function createLocalTutorFallback(language: "EN" | "KZ" | "RU", question: string) {
  if (language === "KZ") {
    if (isGreeting(question)) {
      return "Сәлем! Жақсымын, рахмет. Сен қалайсың? Қай пәннен дайындаламыз: математика, логика, ағылшын, қазақ тілі немесе оқу сауаттылығы?";
    }

    return "Қазір AI-Sana толық жауапты құра алмай тұр, бірақ мен сені тастап кетпеймін. Сұрағыңды бір сөйлеммен қайта жазып жібер: қандай пән, қандай тақырып және қай жері түсініксіз? Мен соны қадам-қадаммен түсіндіремін.";
  }

  if (language === "RU") {
    if (isGreeting(question)) {
      return "Привет! У меня все хорошо, спасибо. Как ты? С какого предмета начнем: математика, логика, английский, русский или чтение?";
    }

    return "Сейчас AI-Sana не смогла собрать полный ответ, но мы все равно продолжим. Напиши вопрос еще раз коротко: предмет, тема и какое место непонятно. Я разберу это по шагам.";
  }

  if (isGreeting(question)) {
    return "Hi! I am doing well, thank you. How are you? Which subject should we start with: math, logic, English, reading, or an exam plan?";
  }

  return "AI-Sana could not create a full answer right now, but we can keep going. Please send the question again with the subject, topic, and the part that feels confusing. I will explain it step by step.";
}

function isGreeting(text: string) {
  return /^(с[әəа]лем|сәлемет|қалың қалай|калың қалай|как дела|привет|здравствуй|hello|hi)\b/i.test(
    text.trim(),
  );
}
