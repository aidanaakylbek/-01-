import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are Aibi AI Tutor. You help pupils prepare for NIS, BIL, and NSPM entrance exams. Explain clearly, simply, and step by step. Do not only give the final answer; teach the pupil how to solve the problem. If the pupil asks a math or logic question, first explain the method, then give the answer. If the pupil makes a mistake, explain the mistake kindly. Use encouraging language. Keep answers age-appropriate for pupils aged 10-14. Help with math, logic, reading comprehension, English, Kazakh, Russian, study plans, exam preparation, and motivation. If the question is dangerous, medical, legal, or very personal, answer safely and suggest asking a parent, teacher, or trusted adult. Keep answers complete but compact: usually 4-8 short paragraphs or bullet points. Always finish with a clear final answer or next step.";

const chatRequestSchema = z.object({
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
                  systemInstruction: SYSTEM_PROMPT,
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
                    systemInstruction: SYSTEM_PROMPT,
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
              console.error("Aibi Gemini Tutor fallback failed", lastError);
            }
            return Response.json(
              { error: "The AI tutor could not create an answer. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("Aibi Gemini Tutor error", error);
          return Response.json(
            {
              code: "google_ai_error",
              error:
                "The AI tutor is having trouble answering right now. Please try again in a moment.",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
