import { createHash } from "node:crypto";

import type {
  MentorStyle,
  PaymentMethod,
  PaymentRequest,
  PaymentRequestStatus,
  PlanKey,
  StoredAccount,
  SubscriptionStatus,
} from "./account-store.server";

type SupabaseUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  grade: string | null;
  initials: string | null;
  role: "student" | "admin" | null;
  telegram_parent_verified: boolean | null;
  subscription_status: SubscriptionStatus | null;
  subscription_plan: PlanKey | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  diagnostic_completed: boolean | null;
  diagnostic_score: number | null;
  diagnostic_weak_topics: string[] | null;
  mentor_style: MentorStyle | null;
};

type SupabaseParentRow = {
  id: string;
  student_id: string;
  name: string;
  phone: string;
  phone_verified: boolean | null;
  telegram_chat_id: string | null;
  telegram_connected: boolean | null;
  telegram_verified_at: string | null;
  invite_code: string;
  last_report_sent_at: string | null;
};

type SupabasePaymentRequestRow = {
  id: string;
  user_id: string;
  student_name: string | null;
  student_email: string | null;
  parent_phone: string | null;
  plan_key: PlanKey;
  plan_name: string;
  amount: number;
  currency: "KZT";
  payment_method: PaymentMethod;
  status: PaymentRequestStatus;
  kaspi_invoice_reference: string | null;
  kaspi_payment_link: string | null;
  admin_note: string | null;
  created_at: string;
  confirmed_at: string | null;
  rejected_at: string | null;
};

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function findAccountByEmail(email: string) {
  const user = await selectOne<SupabaseUserRow>("users", `email=eq.${encodeURIComponent(email)}`);
  return user ? userToAccount(user) : null;
}

export async function findAccountByInviteCode(inviteCode: string) {
  const parent = await selectOne<SupabaseParentRow>(
    "parents",
    `invite_code=eq.${encodeURIComponent(inviteCode)}`,
  );

  if (!parent) return null;

  const user = await selectOne<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(parent.student_id)}`);
  return user ? userToAccount(user, parent) : null;
}

export async function createAccountWithParent(input: {
  name: string;
  email: string;
  grade: string;
  initials: string;
  parentName: string;
  parentPhone: string;
  password: string;
  inviteCode: string;
}) {
  const [user] = await insertRows<SupabaseUserRow>("users", [
    {
      name: input.name,
      email: input.email,
      grade: input.grade,
      initials: input.initials,
      password_hash: hashPassword(input.password),
      role: "student",
      telegram_parent_verified: false,
      subscription_status: "inactive",
      diagnostic_completed: false,
      mentor_style: "friendly",
    },
  ]);

  const [parent] = await insertRows<SupabaseParentRow>("parents", [
    {
      student_id: user.id,
      name: input.parentName,
      phone: input.parentPhone,
      phone_verified: false,
      telegram_connected: false,
      invite_code: input.inviteCode,
    },
  ]);

  return userToAccount(user, parent);
}

export async function verifyParentTelegram(inviteCode: string, telegramChatId: string) {
  const account = await findAccountByInviteCode(inviteCode);
  if (!account) return null;

  const now = new Date().toISOString();

  const [parent] = await updateRows<SupabaseParentRow>(
    "parents",
    `invite_code=eq.${encodeURIComponent(inviteCode)}`,
    {
      telegram_chat_id: telegramChatId,
      telegram_connected: true,
      phone_verified: true,
      telegram_verified_at: now,
    },
  );

  const [user] = await updateRows<SupabaseUserRow>(
    "users",
    `id=eq.${encodeURIComponent(account.id)}`,
    {
      telegram_parent_verified: true,
    },
  );

  return userToAccount(user, parent);
}

export async function updateDiagnosticResult(
  userId: string,
  input: { score: number; weakTopics: string[] },
) {
  const [user] = await updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
    diagnostic_completed: true,
    diagnostic_score: input.score,
    diagnostic_weak_topics: input.weakTopics,
  });
  return userToAccount(user);
}

export async function updateMentor(userId: string, mentorStyle: MentorStyle) {
  const [user] = await updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
    mentor_style: mentorStyle,
  });
  return userToAccount(user);
}

export async function createPaymentRequestRow(request: PaymentRequest) {
  const [row] = await insertRows<SupabasePaymentRequestRow>("payment_requests", [
    {
      id: request.id,
      user_id: request.userId,
      student_name: request.studentName,
      student_email: request.studentEmail,
      parent_phone: request.parentPhone,
      plan_key: request.planKey,
      plan_name: request.planName,
      amount: request.amount,
      currency: request.currency,
      payment_method: request.paymentMethod,
      status: request.status,
    },
  ]);

  return paymentRowToRequest(row);
}

export async function listPaymentRequestRows() {
  const rows = await selectMany<SupabasePaymentRequestRow>(
    "payment_requests",
    "select=*&order=created_at.desc",
  );
  return rows.map(paymentRowToRequest);
}

export async function updatePaymentRequestRow(
  id: string,
  patch: Partial<SupabasePaymentRequestRow>,
) {
  const [row] = await updateRows<SupabasePaymentRequestRow>(
    "payment_requests",
    `id=eq.${encodeURIComponent(id)}`,
    patch,
  );
  return paymentRowToRequest(row);
}

export async function activateSubscription(
  userId: string,
  planKey: PlanKey,
  durationMonths: number,
) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const [user] = await updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
    subscription_status: "active",
    subscription_plan: planKey,
    subscription_started_at: now.toISOString(),
    subscription_expires_at: expiresAt.toISOString(),
  });

  return userToAccount(user);
}

export async function getVerifiedReportTargets() {
  const parents = await selectMany<SupabaseParentRow>(
    "parents",
    "select=*&telegram_connected=eq.true&phone_verified=eq.true&telegram_chat_id=not.is.null",
  );
  const targets = [];

  for (const parent of parents) {
    const user = await selectOne<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(parent.student_id)}`);
    if (!user) continue;

    const account = userToAccount(user, parent);
    if (account.subscriptionStatus === "active" && (!account.subscriptionExpiresAt || new Date(account.subscriptionExpiresAt).getTime() > Date.now())) {
      targets.push({ account, telegramChatId: parent.telegram_chat_id as string });
    }
  }

  return targets;
}

export async function wasReportSent(studentId: string, weekKey: string) {
  const row = await selectOne<{ id: string }>(
    "weekly_report_deliveries",
    `student_id=eq.${encodeURIComponent(studentId)}&week_key=eq.${encodeURIComponent(weekKey)}`,
  );
  return Boolean(row);
}

export async function markReportSent(studentId: string, weekKey: string) {
  await insertRows("weekly_report_deliveries", [
    {
      student_id: studentId,
      week_key: weekKey,
      sent_at: new Date().toISOString(),
    },
  ]);

  await updateRows("parents", `student_id=eq.${encodeURIComponent(studentId)}`, {
    last_report_sent_at: new Date().toISOString(),
  });
}

function userToAccount(user: SupabaseUserRow, parent?: SupabaseParentRow | null): StoredAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    grade: user.grade ?? "7",
    initials: user.initials ?? user.name.slice(0, 2).toUpperCase(),
    role: user.role ?? "student",
    parentName: parent?.name ?? "",
    parentPhone: parent?.phone ?? "",
    parentPhoneVerified: Boolean(parent?.phone_verified),
    parentTelegramChatId: parent?.telegram_chat_id ?? undefined,
    parentTelegramConnected: Boolean(parent?.telegram_connected),
    parentTelegramVerifiedAt: parent?.telegram_verified_at ?? undefined,
    parentInviteCode: parent?.invite_code ?? "",
    parentLastReportSentAt: parent?.last_report_sent_at ?? undefined,
    parentWhatsApp: parent?.phone ?? "",
    parentWhatsAppVerified: false,
    telegramParentVerified: Boolean(user.telegram_parent_verified),
    subscriptionStatus: user.subscription_status ?? "inactive",
    subscriptionPlan: user.subscription_plan ?? undefined,
    subscriptionStartedAt: user.subscription_started_at ?? undefined,
    subscriptionExpiresAt: user.subscription_expires_at ?? undefined,
    diagnosticCompleted: Boolean(user.diagnostic_completed),
    diagnosticScore: user.diagnostic_score ?? undefined,
    diagnosticWeakTopics: user.diagnostic_weak_topics ?? undefined,
    mentorStyle: user.mentor_style ?? "friendly",
    password: user.password_hash,
  };
}

function paymentRowToRequest(row: SupabasePaymentRequestRow): PaymentRequest {
  return {
    id: row.id,
    userId: row.user_id,
    studentName: row.student_name ?? "",
    studentEmail: row.student_email ?? "",
    parentPhone: row.parent_phone ?? "",
    planKey: row.plan_key,
    planName: row.plan_name,
    amount: row.amount,
    currency: row.currency,
    paymentMethod: row.payment_method,
    status: row.status,
    kaspiInvoiceReference: row.kaspi_invoice_reference ?? undefined,
    kaspiPaymentLink: row.kaspi_payment_link ?? undefined,
    adminNote: row.admin_note ?? undefined,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
  };
}

async function selectOne<T>(table: string, query: string) {
  const rows = await selectMany<T>(table, `select=*&${query}&limit=1`);
  return rows[0] ?? null;
}

async function selectMany<T>(table: string, query: string) {
  const response = await supabaseFetch(`${table}?${query}`, { method: "GET" });
  return (await response.json()) as T[];
}

async function insertRows<T>(table: string, rows: unknown[]) {
  const response = await supabaseFetch(table, {
    method: "POST",
    body: JSON.stringify(rows),
    headers: { Prefer: "return=representation" },
  });
  return (await response.json()) as T[];
}

async function updateRows<T>(table: string, query: string, patch: unknown) {
  const response = await supabaseFetch(`${table}?${query}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: { Prefer: "return=representation" },
  });
  return (await response.json()) as T[];
}

async function supabaseFetch(path: string, init: RequestInit) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`SUPABASE_ERROR:${response.status}:${detail}`);
  }

  return response;
}
