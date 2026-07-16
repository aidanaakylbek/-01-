import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createPaymentRequest as createStoredPaymentRequest,
  duplicateEmailMessage,
  getDashboardAccount as readDashboardAccount,
  getPostLoginRedirect,
  listPaymentRequests as listStoredPaymentRequests,
  loginAccount as loginStoredAccount,
  logoutAccount as logoutStoredAccount,
  pricingPlans,
  registerAccount as registerStoredAccount,
  saveDiagnosticResult as saveStoredDiagnosticResult,
  saveExamAttempt as saveStoredExamAttempt,
  saveSolutionExplanationLog as saveStoredSolutionExplanationLog,
  saveWeakTopicProgress as saveStoredWeakTopicProgress,
  updatePaymentRequest as updateStoredPaymentRequest,
  updateMentorStyle as updateStoredMentorStyle,
} from "../account-store.server";

export const getAccountDashboard = createServerFn({ method: "GET" }).handler(async () => {
  return readDashboardAccount();
});

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      grade: z.string().min(1),
      parentName: z.string().trim().min(2),
      parentPhone: z.string().trim().min(7),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    try {
      return await registerStoredAccount(data);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        throw new Error(`EMAIL_ALREADY_EXISTS:${duplicateEmailMessage}`);
      }

      throw error;
    }
  });

export const loginAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
      remember: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const account = await loginStoredAccount(data);

    if (!account) {
      throw new Error("Invalid email or password");
    }

    return {
      account,
      redirectTo: getPostLoginRedirect(account),
    };
  });

export const logoutAccount = createServerFn({ method: "POST" }).handler(async () => {
  return logoutStoredAccount();
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

export const saveDiagnosticResult = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      score: z.number().min(0).max(100),
      weakTopics: z.array(z.string().min(1)).max(10),
    }),
  )
  .handler(async ({ data }) => {
    return saveStoredDiagnosticResult(data);
  });

export const getPricingPlans = createServerFn({ method: "GET" }).handler(async () => {
  return pricingPlans;
});

export const createPaymentRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      planKey: z.enum(["monthly", "three_months", "yearly"]),
      paymentMethod: z.enum(["kaspi_pay", "kaspi_red", "kaspi_0_0_12"]),
    }),
  )
  .handler(async ({ data }) => {
    return createStoredPaymentRequest(data);
  });

export const listPaymentRequests = createServerFn({ method: "GET" }).handler(async () => {
  return listStoredPaymentRequests();
});

export const updatePaymentRequest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      action: z.enum(["invoice_sent", "approve", "reject"]),
      adminNote: z.string().optional(),
      kaspiInvoiceReference: z.string().optional(),
      kaspiPaymentLink: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    return updateStoredPaymentRequest(data);
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
