import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildMentorSystemPrompt } from "@/lib/ai-mentor";
import { getAccessError, getDashboardAccount, saveSolutionExplanationLog } from "@/lib/account-store.server";

const requestSchema = z.object({
  language: z.enum(["EN", "KZ", "RU"]).default("EN"),
  question: z.string().trim().min(1).max(2000),
  correctSolution: z.string().trim().min(1).max(2000),
  transcript: z.string().trim().min(1).max(4000),
});

export const Route = createFileRoute("/api/explain-solution")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Please send question, solution, and explanation." }, { status: 400 });
        }

        const accessError = await getAccessError("ai_tutor");

        if (accessError) {
          return Response.json(accessError, { status: 403 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
        }

        const data = parsed.data;
        const languageInstruction = {
          EN: "Reply in English.",
          KZ: "Reply in natural Kazakh Cyrillic.",
          RU: "Reply in Russian.",
        }[data.language];

        const prompt = [
          `Question: ${data.question}`,
          `Correct solution: ${data.correctSolution}`,
          `Pupil explanation transcript: ${data.transcript}`,
          "",
          "Analyze the pupil's thinking. Show: 1) which step was correct, 2) where the mistake happened, 3) which concept was misunderstood, 4) how to solve correctly. If there is no mistake, explain why the method is sound and suggest one improvement.",
        ].join("\n");

        try {
          const dashboard = await getDashboardAccount();
          const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-5.4-mini",
              instructions: `${buildMentorSystemPrompt(dashboard.account.mentorStyle)}\n\n${languageInstruction}`,
              input: prompt,
              max_output_tokens: 1800,
              temperature: 0.35,
            }),
          });

          if (!response.ok) {
            return Response.json({ error: "AI could not analyze the explanation." }, { status: 502 });
          }

          const json = (await response.json()) as { output_text?: string };
          const feedback = json.output_text?.trim() || "";
          if (!feedback) {
            return Response.json({ error: "AI returned an empty analysis." }, { status: 502 });
          }

          await saveSolutionExplanationLog({
            question: data.question,
            correctSolution: data.correctSolution,
            transcript: data.transcript,
            feedback,
          });

          return Response.json({ feedback });
        } catch (error) {
          console.error("AI-Sana solution explanation error", error);
          return Response.json({ error: "AI explanation is temporarily unavailable." }, { status: 502 });
        }
      },
    },
  },
});
