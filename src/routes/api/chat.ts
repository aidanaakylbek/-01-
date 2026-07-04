import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

function isPercentageQuestion(text: string) {
  return /%|пайыз|процент|percentage|percent/.test(text);
}

function isStudyPlanQuestion(text: string) {
  return /план|дайынд|подготов|study plan|nis|bil|nspm|ниш|бил|рфмш/.test(text);
}

function isLogicQuestion(text: string) {
  return /логик|logic|заңдылық|закономер|sequence|pattern/.test(text);
}

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

        const recentMessages = parsed.data.messages.slice(-12);
        const answerLanguage = getAnswerLanguage(parsed.data.language, recentMessages);

        if (!process.env.GOOGLE_API_KEY) {
          return Response.json({
            reply: createTutorAnswer(answerLanguage.code, lastUserMessage(recentMessages)),
          });
        }

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
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
              console.error("AI-Sana Gemini Tutor model layer failed", lastError);
            }
            return Response.json({
              reply: createTutorAnswer(answerLanguage.code, lastUserMessage(recentMessages)),
            });
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("AI-Sana Gemini Tutor error", error);
          return Response.json({
            reply: createTutorAnswer(answerLanguage.code, lastUserMessage(recentMessages)),
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

function detectTextLanguage(text: string, defaultLanguage?: "EN" | "KZ" | "RU"): "EN" | "KZ" | "RU" {
  const normalizedText = text.toLowerCase();

  if (/[әғқңөұүһі]/i.test(text)) {
    return "KZ";
  }

  if (
    /\b(пайыз|деген|қалай|калай|маған|маган|түсіндір|тусиндир|есеп|шығар|шыгар|дайындал|жауап|сұрақ|сурак|қазақ|казак|ағылшын|агылшын)\b/i.test(
      normalizedText,
    )
  ) {
    return "KZ";
  }

  if (
    /\b(привет|здравствуй|как|что|почему|объясни|реши|задача|процент|подготов|русский|английский)\b/i.test(
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

function createTutorAnswer(language: "EN" | "KZ" | "RU", question: string) {
  const lowerQuestion = question.toLowerCase();

  if (language === "KZ") {
    if (isGreeting(question)) {
      return "Сәлем! Жақсымын, рахмет. Сен қалайсың? Қай пәннен дайындаламыз: математика, логика, ағылшын, қазақ тілі немесе оқу сауаттылығы?";
    }

    if (isPercentageQuestion(lowerQuestion)) {
      return "Пайыз дегеніміз 100-дің ішіндегі үлес. Мысалы, 25% = 25/100 = 0,25. Егер 80-нің 25%-ын тапсақ: 80 × 0,25 = 20. Жауап: 20. Ереже: санның p%-ын табу үшін санды p/100-ге көбейт.";
    }

    if (isStudyPlanQuestion(lowerQuestion)) {
      return "Дайындықты 3 бөлікке бөлейік. 1) Күн сайын 25 минут математика немесе логика. 2) Күн сайын 15 минут оқу сауаттылығы немесе тіл. 3) Аптасына 1 рет пробный тест. Әр тесттен кейін 3 қатені таңдап, неге қате кеткенін жаз. Қай емтиханға дайындалып жатырсың: NIS, BIL әлде NSPM?";
    }

    if (isLogicQuestion(lowerQuestion)) {
      return "Логикалық есепте алдымен заңдылықты іздейміз, кейін сол заңдылық келесі қадамда да сақтала ма тексереміз. Мысалы: 2, 4, 8, 16, ? Мұнда әр сан 2-ге көбейеді, сондықтан келесі сан 32. Нақты есебіңді жіберсең, бірге қадам-қадаммен шығарамыз.";
    }

    return "Жақсы, бірге қарайық. Есептің немесе сұрақтың шартын толық жаз. Мен оны 3 қадаммен түсіндіремін: 1) не берілгенін табамыз, 2) қандай әдіс керек екенін таңдаймыз, 3) жауапты тексереміз.";
  }

  if (language === "RU") {
    if (isGreeting(question)) {
      return "Привет! У меня все хорошо, спасибо. Как ты? С какого предмета начнем: математика, логика, английский, русский или чтение?";
    }

    if (isPercentageQuestion(lowerQuestion)) {
      return "Процент — это часть от 100. Например, 25% = 25/100 = 0,25. Чтобы найти 25% от 80, считаем: 80 × 0,25 = 20. Ответ: 20. Правило: чтобы найти p% от числа, умножь число на p/100.";
    }

    if (isStudyPlanQuestion(lowerQuestion)) {
      return "Сделаем простой план. Каждый день: 25 минут математики или логики, 15 минут чтения или языка. Раз в неделю: один пробный тест. После теста выбери 3 ошибки и разбери: где был неверный шаг и как решить правильно. Ты готовишься к NIS, BIL или NSPM?";
    }

    if (isLogicQuestion(lowerQuestion)) {
      return "Логическую задачу решаем так: сначала ищем закономерность, потом проверяем, повторяется ли она. Например: 2, 4, 8, 16, ? Здесь каждое число умножается на 2, значит следующий ответ 32. Отправь свою задачу, и я разберу ее по шагам.";
    }

    return "Хорошо, давай разберем вместе. Пришли условие задачи полностью. Я помогу по шагам: 1) что дано, 2) какой способ выбрать, 3) как проверить ответ.";
  }

  if (isGreeting(question)) {
    return "Hi! I am doing well, thank you. How are you? Which subject should we start with: math, logic, English, reading, or an exam plan?";
  }

  if (isPercentageQuestion(lowerQuestion)) {
    return "A percent is a part out of 100. For example, 25% = 25/100 = 0.25. To find 25% of 80, calculate 80 × 0.25 = 20. Final answer: 20. Rule: to find p% of a number, multiply the number by p/100.";
  }

  if (isStudyPlanQuestion(lowerQuestion)) {
    return "Here is a simple plan: every day, do 25 minutes of math or logic and 15 minutes of reading or language practice. Once a week, take one mock test. After each test, choose 3 mistakes and write why each mistake happened. Which exam are you preparing for: NIS, BIL, or NSPM?";
  }

  if (isLogicQuestion(lowerQuestion)) {
    return "For logic questions, first look for the pattern, then test if the pattern continues. Example: 2, 4, 8, 16, ? Each number is multiplied by 2, so the next number is 32. Send me your exact question and I will solve it step by step.";
  }

  return "Good, let us work on it together. Send the full question or the part you do not understand. I will explain it in 3 steps: what is given, which method to use, and how to check the answer.";
}

function isGreeting(text: string) {
  return /^(с[әəа]лем|сәлемет|қалың қалай|калың қалай|как дела|привет|здравствуй|hello|hi)(\s|$|[.!?])/i.test(
    text.trim(),
  );
}
