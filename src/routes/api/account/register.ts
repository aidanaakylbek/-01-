import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
  duplicateEmailMessage,
  registerAccount,
} from "@/lib/account-store.server";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  grade: z.string().min(1),
  parentName: z.string().trim().min(2),
  parentPhone: z.string().trim().min(7),
  password: z.string().min(6),
});

export const Route = createFileRoute("/api/account/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
          return Response.json(
            {
              error: "INVALID_REGISTRATION_DATA",
              message: "Тіркелу мәліметтерін тексеріңіз.",
            },
            { status: 400 },
          );
        }

        try {
          const account = await registerAccount(parsed.data);
          return Response.json({ account }, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
            return Response.json(
              {
                error: "EMAIL_ALREADY_EXISTS",
                message: duplicateEmailMessage,
              },
              { status: 409 },
            );
          }

          return Response.json(
            {
              error: "REGISTRATION_FAILED",
              message: "Аккаунт ашылмады. Мәліметтерді тексеріңіз.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
