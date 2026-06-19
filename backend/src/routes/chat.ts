import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        error: "AI tutor is not configured yet. Please add GOOGLE_API_KEY to your server environment.",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Convert messages to Google's format
    const history = body.messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const userMessage = body.messages[body.messages.length - 1];

    const response = await chat.sendMessage([
      {
        text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage.content}`,
      },
    ]);

    const assistantMessage = response.response.text();

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
