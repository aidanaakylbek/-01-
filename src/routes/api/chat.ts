import { createFileRoute } from "@tanstack/react-router";
import OpenAI from "openai";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are AulBridge AI Tutor. You help talented pupils from rural areas prepare for NIS, BIL, and NSPM entrance exams. Explain clearly, simply, and step by step. Do not only give the final answer; teach the pupil how to solve the problem. If the pupil asks a math or logic question, first explain the method, then give the answer. If the pupil makes a mistake, explain the mistake kindly. Use encouraging language. Keep answers age-appropriate for pupils aged 10-14. Help with math, logic, reading comprehension, English, Kazakh, Russian, study plans, exam preparation, and motivation. If the question is dangerous, medical, legal, or very personal, answer safely and suggest asking a parent, teacher, or trusted adult.";

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

        if (!process.env.OPENAI_API_KEY) {
          return Response.json(
            {
              error:
                "AI tutor is not configured yet. Please add OPENAI_API_KEY to your server environment.",
            },
            { status: 500 },
          );
        }

        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const recentMessages = parsed.data.messages.slice(-12);
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.4,
            max_tokens: 650,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...recentMessages.map((message) => ({
                role: message.role,
                content: message.content,
              })),
            ],
          });
          const reply = completion.choices[0]?.message?.content?.trim();

          if (!reply) {
            return Response.json(
              { error: "The AI tutor could not create an answer. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({ reply });
        } catch (error) {
          console.error("AulBridge AI Tutor error", error);
          return Response.json(
            {
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
