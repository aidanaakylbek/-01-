import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

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
  diagnostic_completed_at: string | null;
  diagnostic_version: string | null;
  diagnostic_score: number | null;
  diagnostic_assigned_level: string | null;
  diagnostic_attempts: unknown[] | null;
  diagnostic_ai_recommendation: string | null;
  diagnostic_recommended_starting_lesson: string | null;
  diagnostic_started_at: string | null;
  diagnostic_strong_topics: string[] | null;
  diagnostic_subject_levels: Record<string, string> | null;
  diagnostic_subject_scores: Record<string, number> | null;
  diagnostic_topic_scores: Record<string, number> | null;
  diagnostic_weak_topics: string[] | null;
  mentor_style: MentorStyle | null;
  telegram_user_id?: string | null;
  telegram_chat_id?: string | null;
  phone_e164?: string | null;
  telegram_verified_at?: string | null;
  lesson_completions?: SupabaseLessonCompletion[] | null;
};

export type SupabaseLessonCompletion = {
  lessonId: string;
  subjectId: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
};

type SupabaseParentRow = {
  id: string;
  student_id: string;
  name: string;
  phone: string;
  phone_normalized: string;
  phone_verified: boolean | null;
  telegram_chat_id: string | null;
  telegram_connected: boolean | null;
  telegram_verified_at: string | null;
  invite_code: string;
  last_report_sent_at: string | null;
  telegram_user_id?: string | null;
  phone_e164?: string | null;
  parent_report_enabled?: boolean | null;
  parent_consent_at?: string | null;
};

type SupabaseTelegramVerificationTokenRow = {
  id: string;
  user_id: string;
  purpose: "student_verification" | "parent_link";
  token_hash: string;
  code: string | null;
  telegram_chat_id: string | null;
  telegram_user_id: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
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

// Passwords are hashed with scrypt (Node's built-in, salted, deliberately
// slow KDF) so a leaked users table can't be cracked with a rainbow table.
// Format: "scrypt:<saltHex>:<hashHex>". Older accounts may still have a
// plain sha256 hex digest (the previous, weaker scheme) — verifyPassword
// below understands both, and callers should rehash on successful legacy
// login so accounts migrate to the new format over time.
const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("scrypt:")) {
    const [, salt, hash] = stored.split(":");

    if (!salt || !hash) {
      return false;
    }

    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  // Legacy unsalted sha256 digest from before this scheme existed.
  const legacyExpected = Buffer.from(stored, "hex");
  const legacyActual = Buffer.from(createHash("sha256").update(password).digest("hex"), "hex");
  return (
    legacyExpected.length === legacyActual.length && timingSafeEqual(legacyExpected, legacyActual)
  );
}

export function needsPasswordRehash(stored: string) {
  return !stored.startsWith("scrypt:");
}

export async function findAccountByEmail(email: string) {
  const user = await selectOne<SupabaseUserRow>("users", `email=eq.${encodeURIComponent(email)}`);
  if (!user) return null;

  const parent = await findParentByStudentId(user.id);
  return userToAccount(user, parent);
}

export async function findAccountByInviteCode(inviteCode: string) {
  const parent = await selectOne<SupabaseParentRow>(
    "parents",
    `invite_code=eq.${encodeURIComponent(inviteCode)}`,
  );

  if (!parent) return null;

  const user = await selectOne<SupabaseUserRow>(
    "users",
    `id=eq.${encodeURIComponent(parent.student_id)}`,
  );
  return user ? userToAccount(user, parent) : null;
}

export async function findParentByNormalizedPhone(phoneNormalized: string) {
  return selectOne<SupabaseParentRow>(
    "parents",
    `phone_normalized=eq.${encodeURIComponent(phoneNormalized)}`,
  );
}

async function findParentByStudentId(studentId: string) {
  return selectOne<SupabaseParentRow>("parents", `student_id=eq.${encodeURIComponent(studentId)}`);
}

async function findParentByTelegramChatId(telegramChatId: string) {
  return selectOne<SupabaseParentRow>(
    "parents",
    `telegram_chat_id=eq.${encodeURIComponent(telegramChatId)}`,
  );
}

async function findUserByTelegramUserId(telegramUserId: string) {
  return selectOne<SupabaseUserRow>(
    "users",
    `telegram_user_id=eq.${encodeURIComponent(telegramUserId)}`,
  );
}

export async function createAccountWithParent(input: {
  name: string;
  email: string;
  grade: string;
  initials: string;
  parentName: string;
  parentPhone: string;
  parentPhoneNormalized: string;
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

  try {
    const [parent] = await insertRows<SupabaseParentRow>("parents", [
      {
        student_id: user.id,
        name: input.parentName,
        phone: input.parentPhone,
        phone_normalized: input.parentPhoneNormalized,
        phone_verified: false,
        telegram_connected: false,
        invite_code: input.inviteCode,
      },
    ]);

    return userToAccount(user, parent);
  } catch (error) {
    await deleteRows("users", `id=eq.${encodeURIComponent(user.id)}`).catch(() => undefined);
    throw error;
  }
}

export async function verifyParentTelegram(inviteCode: string, telegramChatId: string) {
  const parent = await selectOne<SupabaseParentRow>(
    "parents",
    `invite_code=eq.${encodeURIComponent(inviteCode)}`,
  );

  if (!parent) return { status: "invalid" as const };

  const existingParent = await findParentByTelegramChatId(telegramChatId);

  if (existingParent && existingParent.id !== parent.id) {
    return { status: "telegram_already_connected" as const };
  }

  if (existingParent?.id === parent.id && parent.telegram_connected && parent.phone_verified) {
    const user = await selectOne<SupabaseUserRow>(
      "users",
      `id=eq.${encodeURIComponent(parent.student_id)}`,
    );
    return user
      ? { status: "already_verified" as const, account: userToAccount(user, parent) }
      : { status: "invalid" as const };
  }

  const now = new Date().toISOString();

  const [updatedParent] = await updateRows<SupabaseParentRow>(
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
    `id=eq.${encodeURIComponent(parent.student_id)}`,
    {
      telegram_parent_verified: true,
    },
  );

  return { status: "verified" as const, account: userToAccount(user, updatedParent) };
}

export async function createTelegramVerificationToken(input: {
  userId: string;
  purpose: "student_verification" | "parent_link";
  tokenHash: string;
  code: string;
  expiresAt: string;
}) {
  const [row] = await insertRows<SupabaseTelegramVerificationTokenRow>(
    "telegram_verification_tokens",
    [
      {
        user_id: input.userId,
        purpose: input.purpose,
        token_hash: input.tokenHash,
        code: input.code,
        expires_at: input.expiresAt,
      },
    ],
  );

  return row;
}

export async function beginTelegramVerificationToken(input: {
  chatId: string;
  telegramUserId: string;
  tokenHash: string;
}) {
  const token = await selectOne<SupabaseTelegramVerificationTokenRow>(
    "telegram_verification_tokens",
    `token_hash=eq.${encodeURIComponent(input.tokenHash)}&used_at=is.null`,
  );

  if (!token || new Date(token.expires_at).getTime() <= Date.now() || !token.code) {
    return { status: "invalid" as const };
  }

  await updateRows<SupabaseTelegramVerificationTokenRow>(
    "telegram_verification_tokens",
    `id=eq.${encodeURIComponent(token.id)}`,
    {
      telegram_chat_id: input.chatId,
      telegram_user_id: input.telegramUserId,
    },
  );

  return { status: "code_sent" as const, code: token.code };
}

export async function completeTelegramCodeVerification(input: { userId: string; code: string }) {
  const tokens = await selectMany<SupabaseTelegramVerificationTokenRow>(
    "telegram_verification_tokens",
    [
      "select=*",
      `user_id=eq.${encodeURIComponent(input.userId)}`,
      `code=eq.${encodeURIComponent(input.code)}`,
      "used_at=is.null",
      `expires_at=gt.${encodeURIComponent(new Date().toISOString())}`,
      "order=created_at.desc",
      "limit=1",
    ].join("&"),
  );
  const token = tokens[0];

  if (!token || !token.telegram_chat_id || !token.telegram_user_id) {
    return { status: "invalid" as const };
  }

  const existingTelegramUser = await findUserByTelegramUserId(token.telegram_user_id);
  if (existingTelegramUser && existingTelegramUser.id !== token.user_id) {
    return { status: "telegram_already_connected" as const };
  }

  const now = new Date().toISOString();

  const [user] = await updateRows<SupabaseUserRow>(
    "users",
    `id=eq.${encodeURIComponent(token.user_id)}`,
    {
      telegram_chat_id: token.telegram_chat_id,
      telegram_parent_verified: true,
      telegram_user_id: token.telegram_user_id,
      telegram_verified_at: now,
    },
  );

  const [parent] = await updateRows<SupabaseParentRow>(
    "parents",
    `student_id=eq.${encodeURIComponent(token.user_id)}`,
    {
      phone_verified: true,
      telegram_chat_id: token.telegram_chat_id,
      telegram_connected: true,
      telegram_user_id: token.telegram_user_id,
      telegram_verified_at: now,
    },
  ).catch(() => [null as unknown as SupabaseParentRow]);

  await updateRows<SupabaseTelegramVerificationTokenRow>(
    "telegram_verification_tokens",
    `id=eq.${encodeURIComponent(token.id)}`,
    { used_at: now },
  );

  return { status: "verified" as const, account: userToAccount(user, parent) };
}

export async function updateDiagnosticResult(
  userId: string,
  input: import("./account-store.server").DiagnosticResultInput,
) {
  const payload = {
    diagnostic_completed: true,
    diagnostic_completed_at: input.completedAt ?? new Date().toISOString(),
    diagnostic_version: input.diagnosticVersion,
    diagnostic_score: input.score,
    diagnostic_assigned_level: input.assignedLevel,
    diagnostic_attempts: input.attempts,
    diagnostic_ai_recommendation: input.aiRecommendation,
    diagnostic_recommended_starting_lesson: input.recommendedStartingLesson,
    diagnostic_started_at: input.startedAt,
    diagnostic_strong_topics: input.strongTopics,
    diagnostic_subject_levels: input.subjectLevels,
    diagnostic_subject_scores: input.subjectScores,
    diagnostic_topic_scores: input.topicScores,
    diagnostic_weak_topics: input.weakTopics,
  };

  const [user] = await updateRows<SupabaseUserRow>(
    "users",
    `id=eq.${encodeURIComponent(userId)}`,
    payload,
  ).catch(async (error) => {
    console.error("Diagnostic extended save failed, falling back to legacy fields", error);
    return updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
      diagnostic_completed: true,
      diagnostic_score: input.score,
      diagnostic_weak_topics: input.weakTopics,
    });
  });
  return userToAccount(user);
}

export async function updateMentor(userId: string, mentorStyle: MentorStyle) {
  const [user] = await updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
    mentor_style: mentorStyle,
  });
  return userToAccount(user);
}

export async function updateUserPasswordHash(userId: string, passwordHash: string) {
  await updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
    password_hash: passwordHash,
  });
}

export async function updateLessonCompletions(
  userId: string,
  lessonCompletions: SupabaseLessonCompletion[],
) {
  await updateRows<SupabaseUserRow>("users", `id=eq.${encodeURIComponent(userId)}`, {
    lesson_completions: lessonCompletions,
  });
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
    [
      "select=*",
      "telegram_connected=eq.true",
      "phone_verified=eq.true",
      "telegram_chat_id=not.is.null",
      "parent_report_enabled=eq.true",
      "parent_consent_at=not.is.null",
    ].join("&"),
  );
  const targets = [];

  for (const parent of parents) {
    const user = await selectOne<SupabaseUserRow>(
      "users",
      `id=eq.${encodeURIComponent(parent.student_id)}`,
    );
    if (!user) continue;

    const account = userToAccount(user, parent);
    if (
      account.subscriptionStatus === "active" &&
      (!account.subscriptionExpiresAt ||
        new Date(account.subscriptionExpiresAt).getTime() > Date.now())
    ) {
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
    telegramUserId: user.telegram_user_id ?? undefined,
    telegramChatId: user.telegram_chat_id ?? undefined,
    phoneE164: user.phone_e164 ?? undefined,
    telegramVerifiedAt: user.telegram_verified_at ?? undefined,
    subscriptionStatus: user.subscription_status ?? "inactive",
    subscriptionPlan: user.subscription_plan ?? undefined,
    subscriptionStartedAt: user.subscription_started_at ?? undefined,
    subscriptionExpiresAt: user.subscription_expires_at ?? undefined,
    diagnosticCompleted: Boolean(user.diagnostic_completed),
    diagnosticCompletedAt: user.diagnostic_completed_at ?? undefined,
    diagnosticVersion: user.diagnostic_version ?? undefined,
    diagnosticScore: user.diagnostic_score ?? undefined,
    diagnosticAssignedLevel:
      user.diagnostic_assigned_level as StoredAccount["diagnosticAssignedLevel"],
    diagnosticAttempts: user.diagnostic_attempts as StoredAccount["diagnosticAttempts"],
    diagnosticAiRecommendation: user.diagnostic_ai_recommendation ?? undefined,
    diagnosticRecommendedStartingLesson: user.diagnostic_recommended_starting_lesson ?? undefined,
    diagnosticStartedAt: user.diagnostic_started_at ?? undefined,
    diagnosticStrongTopics: user.diagnostic_strong_topics ?? undefined,
    diagnosticSubjectLevels:
      user.diagnostic_subject_levels as StoredAccount["diagnosticSubjectLevels"],
    diagnosticSubjectScores: user.diagnostic_subject_scores ?? undefined,
    diagnosticTopicScores: user.diagnostic_topic_scores ?? undefined,
    diagnosticWeakTopics: user.diagnostic_weak_topics ?? undefined,
    mentorStyle: user.mentor_style ?? "friendly",
    lessonCompletions: user.lesson_completions ?? [],
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

async function deleteRows(table: string, query: string) {
  await supabaseFetch(`${table}?${query}`, {
    method: "DELETE",
  });
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
