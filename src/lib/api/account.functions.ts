import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getDashboardAccount as readDashboardAccount,
  loginAccount as loginStoredAccount,
  registerAccount as registerStoredAccount,
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
      password: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    return registerStoredAccount(data);
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
