import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createParentWhatsAppCode,
  getDashboardAccount as readDashboardAccount,
  loginAccount as loginStoredAccount,
  registerAccount as registerStoredAccount,
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
