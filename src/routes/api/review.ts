import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const REVIEW_PROMPT =
  "You are Aibi AI Tutor. After a pupil finishes a task or test, give a clear, kind, and useful review. Use this structure: 1) short congratulations and score, 2) what went well, 3) mistakes and weak topics, 4) step-by-step correction method, 5) if question attempts are provided, review every provided question, including correct answers. For correct answers, explain why the answer is correct and name the method. For wrong answers, explain the mistake kindly and show the right method, 6) 2-3 similar practice questions, 7) clear next step. Keep it age-appropriate for pupils aged 10-14. Use the same language as the pupil or task when possible. Be encouraging, specific, and practical. Always finish the review with a clear next step.";

const questionAttemptSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  userAnswer: z.string().trim().min(1).max(500),
  correctAnswer: z.string().trim().min(1).max(500),
  isCorrect: z.boolean(),
  topic: z.string().trim().min(1).max(120).optional(),
  explanation: z.string().trim().min(1).max(1000).optional(),
});

const reviewRequestSchema = z.object({
  taskTitle: z.string().trim().min(1).max(200),
  taskType: z.enum(["task", "test", "diagnostic"]).default("task"),
  subject: z.string().trim().min(1).max(120),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().min(1).max(100).optional(),
  correctAnswers: z.number().int().min(0).max(100).optional(),
  weakTopics: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  attempts: z.array(questionAttemptSchema).max(20).default([]),
  language: z.enum(["KZ", "RU", "EN"]).default("EN"),
});

const languageName = {
  KZ: "Kazakh",
  RU: "Russian",
  EN: "English",
};

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const COMPLETE_ENDING_PATTERN = /[.!?。؟…)"'»\]]$/;

export const Route = createFileRoute("/api/review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;

        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = reviewRequestSchema.safeParse(body);

        if (!parsed.success) {
          return Response.json(
            { error: "Please send a valid task or test result." },
            { status: 400 },
          );
        }

        if (!process.env.GOOGLE_API_KEY) {
          return Response.json(
            {
              code: "missing_google_key",
              error: "AI review is not configured yet. Please add GOOGLE_API_KEY to .env.",
            },
            { status: 500 },
          );
        }

        const result = parsed.data;
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        const contents = [
          `Review language: ${languageName[result.language]}`,
          `Task type: ${result.taskType}`,
          `Task title: ${result.taskTitle}`,
          `Subject: ${result.subject}`,
          `Score: ${result.score}%`,
          result.totalQuestions && result.correctAnswers != null
            ? `Answers: ${result.correctAnswers}/${result.totalQuestions}`
            : undefined,
          result.weakTopics.length > 0 ? `Weak topics: ${result.weakTopics.join(", ")}` : undefined,
          result.attempts.length > 0
            ? `Question attempts:\n${result.attempts
                .map(
                  (attempt, index) =>
                    `${index + 1}. Topic: ${attempt.topic ?? "General"}\nQuestion: ${attempt.question}\nPupil answer: ${attempt.userAnswer}\nCorrect answer: ${attempt.correctAnswer}\nResult: ${attempt.isCorrect ? "Correct" : "Wrong"}${attempt.explanation ? `\nTeacher explanation: ${attempt.explanation}` : ""}`,
                )
                .join("\n\n")}`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n");

        try {
          let review = "";
          let lastError: unknown;

          for (const model of GEMINI_MODELS) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                  maxOutputTokens: 3200,
                  temperature: 0.35,
                  systemInstruction: REVIEW_PROMPT,
                },
              });
              review = response.text?.trim() ?? "";

              if (review && !COMPLETE_ENDING_PATTERN.test(review)) {
                const continuation = await ai.models.generateContent({
                  model,
                  contents: `${contents}\n\nTutor review so far:\n${review}\n\nContinue from exactly where you stopped and finish the review in 3-5 short sentences. Do not repeat previous text.`,
                  config: {
                    maxOutputTokens: 800,
                    temperature: 0.3,
                    systemInstruction: REVIEW_PROMPT,
                  },
                });
                const continuationText = continuation.text?.trim();
                if (continuationText) {
                  review = `${review} ${continuationText}`;
                }
              }

              if (review) break;
            } catch (error) {
              lastError = error;
              const status = error != null && typeof error === "object" ? "status" in error : false;
              const statusCode = status ? (error as { status?: number }).status : undefined;
              if (statusCode !== 429 && statusCode !== 503 && statusCode !== 404) {
                throw error;
              }
            }
          }

          if (!review) {
            if (lastError) {
              console.error("Aibi AI review fallback failed", lastError);
            }
            return Response.json(
              { error: "AI could not create a review. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({ review });
        } catch (error) {
          console.error("Aibi AI review error", error);
          return Response.json(
            { code: "google_ai_error", error: "AI review is temporarily unavailable." },
            { status: 502 },
          );
        }
      },
    },
  },
});
