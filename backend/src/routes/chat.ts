import express from "express";
import OpenAI from "openai";
import { z } from "zod";

const router = express.Router();

const SYSTEM_PROMPT = `You are AulBridge AI Tutor. You help talented pupils from rural areas prepare for NIS, BIL, and NSPM entrance exams. Explain clearly, simply, and step by step. Do not only give the final answer; teach the pupil how to solve the problem. If the pupil asks a math or logic question, first explain the method, then give the answer. If the pupil makes a mistake, explain the mistake kindly. Use encouraging language. Keep answers age-appropriate for pupils aged 10-14. Help with math, logic, reading comprehension, English, Kazakh, Russian, study plans, exam preparation, and motivation. If the question is dangerous, medical, legal, or very personal, answer safely and suggest asking a parent, teacher, or trusted adult.`;

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .min(1)
    .max(20),
});

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const body = chatRequestSchema.parse(req.body);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "AI tutor is not configured yet. Please add OPENAI_API_KEY to your server environment.",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...body.messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices[0].message.content;

    if (!assistantMessage) {
      return res.status(500).json({ error: "No response from AI model" });
    }

    res.json({
      role: "assistant",
      content: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request format",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to process chat request",
    });
  }
});

export default router;
