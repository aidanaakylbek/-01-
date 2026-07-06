import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createParentWhatsAppCode,
  getDashboardAccount as readDashboardAccount,
  loginAccount as loginStoredAccount,
  registerAccount as registerStoredAccount,
  saveExamAttempt as saveStoredExamAttempt,
  saveSolutionExplanationLog as saveStoredSolutionExplanationLog,
  saveWeakTopicProgress as saveStoredWeakTopicProgress,
  updateMentorStyle as updateStoredMentorStyle,
} from "../account-store.server";
import { maskPhone, sendWhatsAppText } from "../whatsapp.server";

export const getAccountDashboard = createServerFn({ method: "GET" }).handler(async () => {
  return readDashboardAccount();
});

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      grade: z.string().min(1),
      parentWhatsApp: z.string().trim().min(7),
      parentWhatsAppVerificationCode: z.string().trim().min(6),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    return registerStoredAccount(data);
  });

export const requestParentWhatsAppVerification = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      studentName: z.string().trim().min(2),
      parentWhatsApp: z.string().trim().min(7),
    }),
  )
  .handler(async ({ data }) => {
    const code = createParentWhatsAppCode(data.parentWhatsApp);
    const result = await sendWhatsAppText({
      to: data.parentWhatsApp,
      body: [
        `AI-Sana: код подтверждения WhatsApp родителя`,
        ``,
        `Ученик: ${data.studentName}`,
        `Код: ${code}`,
        ``,
        `Введите этот код на странице регистрации. Код действует 10 минут.`,
      ].join("\n"),
    });

    if (!result.ok) {
      throw new Error(result.detail);
    }

    return {
      ok: true,
      phone: maskPhone(data.parentWhatsApp),
      expiresMinutes: 10,
    };
  });

export const loginAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const account = loginStoredAccount(data);

    if (!account) {
      throw new Error("Invalid email or password");
    }

    return account;
  });

export const updateMentorStyle = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      mentorStyle: z.enum(["soft", "strict", "friendly", "olympiad"]),
    }),
  )
  .handler(async ({ data }) => {
    return updateStoredMentorStyle(data.mentorStyle);
  });

export const saveExamAttempt = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      examTrack: z.enum(["NIS", "BIL", "NSPM", "MIXED"]),
      totalQuestions: z.number().int().positive(),
      correctAnswers: z.number().int().nonnegative(),
      percent: z.number().min(0).max(100),
      totalTimeSeconds: z.number().int().nonnegative(),
      slowQuestionIds: z.array(z.string()).default([]),
      fastQuestionIds: z.array(z.string()).default([]),
      questions: z.array(
        z.object({
          id: z.string(),
          sectionId: z.string(),
          topic: z.string(),
          question: z.string(),
          userAnswer: z.string(),
          correctAnswer: z.string(),
          isCorrect: z.boolean(),
          timeSpentSeconds: z.number().int().nonnegative(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    return saveStoredExamAttempt(data);
  });

export const saveWeakTopicProgress = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topicId: z.string().min(1),
      currentLevel: z.number().int().min(1).max(5),
      levels: z.array(
        z.object({
          level: z.number().int().min(1).max(5),
          bestPercent: z.number().min(0).max(100),
          unlocked: z.boolean(),
          completed: z.boolean(),
          lastFeedback: z.string().optional(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    return saveStoredWeakTopicProgress(data);
  });

export const saveSolutionExplanationLog = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      question: z.string().min(1).max(2000),
      correctSolution: z.string().min(1).max(2000),
      transcript: z.string().min(1).max(4000),
      feedback: z.string().min(1).max(6000),
    }),
  )
  .handler(async ({ data }) => {
    return saveStoredSolutionExplanationLog(data);
  });
