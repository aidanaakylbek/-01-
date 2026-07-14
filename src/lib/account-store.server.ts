import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/start-server-core/request-response";
import {
  activateSubscription,
  createAccountWithParent,
  createPaymentRequestRow,
  findAccountByEmail,
  getVerifiedReportTargets,
  hashPassword,
  isSupabaseConfigured,
  listPaymentRequestRows,
  markReportSent,
  updateDiagnosticResult,
  updateMentor,
  updatePaymentRequestRow,
  verifyParentTelegram,
  wasReportSent,
} from "./supabase-db.server";

export type Account = {
  id: string;
  name: string;
  email: string;
  grade: string;
  initials: string;
  role: "student" | "admin";
  parentName: string;
  parentPhone: string;
  parentPhoneVerified: boolean;
  parentTelegramChatId?: string;
  parentTelegramConnected: boolean;
  parentTelegramVerifiedAt?: string;
  parentInviteCode: string;
  parentLastReportSentAt?: string;
  parentWhatsApp: string;
  parentWhatsAppVerified: boolean;
  telegramParentVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: PlanKey;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  diagnosticCompleted: boolean;
  diagnosticScore?: number;
  diagnosticWeakTopics?: string[];
  mentorStyle: MentorStyle;
};

export type MentorStyle = "soft" | "strict" | "friendly" | "olympiad";
export type SubscriptionStatus = "inactive" | "active" | "expired" | "cancelled";
export type PlanKey = "monthly" | "three_months" | "yearly";
export type PaymentMethod = "kaspi_pay" | "kaspi_red" | "kaspi_0_0_12";
export type PaymentRequestStatus = "pending" | "invoice_sent" | "approved" | "rejected" | "expired";
export const duplicateEmailMessage =
  "Бұл email бұрын тіркелген. Басқа email қолданыңыз немесе аккаунтқа кіріңіз.";

export type PricingPlan = {
  badge?: string;
  description: string;
  durationLabel: string;
  durationMonths: number;
  key: PlanKey;
  name: string;
  price: number;
};

export type PaymentRequest = {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  parentPhone: string;
  planKey: PlanKey;
  planName: string;
  amount: number;
  currency: "KZT";
  paymentMethod: PaymentMethod;
  status: PaymentRequestStatus;
  kaspiInvoiceReference?: string;
  kaspiPaymentLink?: string;
  adminNote?: string;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
};

export type ExamAttemptQuestion = {
  id: string;
  sectionId: string;
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
};

export type ExamAttempt = {
  id: string;
  createdAt: string;
  examTrack: "NIS" | "BIL" | "NSPM" | "MIXED";
  totalQuestions: number;
  correctAnswers: number;
  percent: number;
  totalTimeSeconds: number;
  slowQuestionIds: string[];
  fastQuestionIds: string[];
  questions: ExamAttemptQuestion[];
};

export type WeakTopicLevelProgress = {
  level: number;
  bestPercent: number;
  unlocked: boolean;
  completed: boolean;
  lastFeedback?: string;
};

export type WeakTopicProgress = {
  topicId: string;
  currentLevel: number;
  levels: WeakTopicLevelProgress[];
};

export type SolutionExplanationLog = {
  id: string;
  createdAt: string;
  question: string;
  correctSolution: string;
  transcript: string;
  feedback: string;
};

export type DashboardTask = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  status: "done" | "active" | "todo";
};

export type SubjectProgress = {
  id: string;
  icon: string;
  name: string;
  percent: number;
  status: "strong" | "improving" | "needs-practice";
};

export type RiskArea = {
  title: string;
  detail: string;
  level: "High" | "Medium";
  accuracy: number;
};

export type DashboardAccount = {
  authenticated: boolean;
  account: Account;
  readiness: number;
  completedLessons: number;
  weeklyGoal: number;
  studyHours: number;
  averageAccuracy: number;
  nextExam: {
    day: string;
    time: string;
    description: string;
  };
  focus: {
    title: string;
    description: string;
    percent: number;
  };
  tasks: DashboardTask[];
  subjects: SubjectProgress[];
  accuracyTrend: Array<{ day: string; accuracy: number }>;
  risks: RiskArea[];
  parentRecommendation: string;
  recommendations: string[];
  examAttempts: ExamAttempt[];
  weakTopicProgress: WeakTopicProgress[];
  solutionExplanationLogs: SolutionExplanationLog[];
};

export type StoredAccount = Account & {
  examAttempts?: ExamAttempt[];
  password: string;
  solutionExplanationLogs?: SolutionExplanationLog[];
  weakTopicProgress?: WeakTopicProgress[];
};

type ParentWhatsAppVerification = {
  code: string;
  expiresAt: number;
};

const SESSION_COOKIE = "ai_sana_email";
const sentWeeklyReportKeys = new Set<string>();

const demoAccount: StoredAccount = {
  id: "demo-aidana",
  name: "Aidana Akylbek",
  email: "aidana@aibi.kz",
  grade: "7",
  initials: "AA",
  role: "student",
  parentName: "Айдананың ата-анасы",
  parentPhone: "+77001234567",
  parentPhoneVerified: false,
  parentTelegramChatId: undefined,
  parentTelegramConnected: false,
  parentTelegramVerifiedAt: undefined,
  parentInviteCode: "demo-parent",
  parentLastReportSentAt: undefined,
  parentWhatsApp: "+77001234567",
  parentWhatsAppVerified: false,
  telegramParentVerified: false,
  subscriptionStatus: "inactive",
  subscriptionPlan: undefined,
  subscriptionStartedAt: undefined,
  subscriptionExpiresAt: undefined,
  diagnosticCompleted: false,
  diagnosticScore: undefined,
  diagnosticWeakTopics: undefined,
  mentorStyle: "friendly",
  password: "demo123",
};

const accounts = new Map<string, StoredAccount>([[demoAccount.email, demoAccount]]);
const paymentRequests = new Map<string, PaymentRequest>();
const parentWhatsAppVerifications = new Map<string, ParentWhatsAppVerification>();
let activeEmail: string | null = null;

const guestAccount: StoredAccount = {
  ...demoAccount,
  id: "guest",
  name: "Қонақ",
  email: "",
  initials: "AI",
  parentName: "",
  parentPhone: "",
  parentInviteCode: "",
  password: "",
};

export const pricingPlans: PricingPlan[] = [
  {
    key: "monthly",
    name: "Sana Start",
    durationLabel: "1 ай",
    durationMonths: 1,
    price: 9990,
    description: "Бір айлық дайындықты бастау",
  },
  {
    key: "three_months",
    name: "Sana Plus",
    durationLabel: "3 ай",
    durationMonths: 3,
    price: 24000,
    badge: "Тиімді",
    description: "Тұрақты дайындық үшін тиімді жоспар",
  },
  {
    key: "yearly",
    name: "Sana Pro",
    durationLabel: "12 ай",
    durationMonths: 12,
    price: 89990,
    badge: "Ең тиімді",
    description: "Толық жылдық дайындық",
  },
];

function getInitials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "AB";
}

function toPublicAccount(account: StoredAccount): Account {
  const { password: _password, ...publicAccount } = account;
  return publicAccount;
}

async function getActiveStoredAccount() {
  const email = getSessionEmail();

  if (!email) {
    return null;
  }

  if (isSupabaseConfigured()) {
    return findAccountByEmail(email);
  }

  return accounts.get(email) ?? null;
}

function getSessionEmail() {
  try {
    const cookieEmail = getCookie(SESSION_COOKIE);

    if (cookieEmail) {
      return normalizeEmail(cookieEmail);
    }
  } catch {
    // Cookie helpers are only available during server requests. The in-memory
    // fallback keeps local non-request calls working during development.
  }

  return activeEmail;
}

function setSessionEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  activeEmail = normalizedEmail;

  try {
    setCookie(SESSION_COOKIE, normalizedEmail, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    // See getSessionEmail fallback note.
  }
}

function clearSessionEmail() {
  activeEmail = null;

  try {
    deleteCookie(SESSION_COOKIE, {
      path: "/",
    });
  } catch {
    // See getSessionEmail fallback note.
  }
}

export async function getDashboardAccount(): Promise<DashboardAccount> {
  const activeAccount = await getActiveStoredAccount();
  const account = activeAccount ?? guestAccount;

  return {
    authenticated: Boolean(activeAccount),
    account: toPublicAccount(account),
    readiness: 68,
    completedLessons: 4,
    weeklyGoal: 5,
    studyHours: 2.5,
    averageAccuracy: 68,
    nextExam: {
      day: "Суббота",
      time: "10:00",
      description: "Полноформатный тренировочный тест по НИШ/БИЛ/РФМШ.",
    },
    focus: {
      title: "Логические задачи",
      description: "Точность в последних тестах ниже 50%.",
      percent: 45,
    },
    tasks: [
      {
        id: "quantitative",
        icon: "calculate",
        title: "НИШ: Количественные характеристики",
        subtitle: "Математический и логический анализ",
        status: "done",
      },
      {
        id: "reading",
        icon: "menu_book",
        title: "БИЛ: Читательская грамотность",
        subtitle: "Понимание казахского и русского текста",
        status: "active",
      },
      {
        id: "functions",
        icon: "functions",
        title: "РФМШ: Функции и графики",
        subtitle: "Практика задач повышенной сложности",
        status: "todo",
      },
    ],
    subjects: [
      {
        id: "natural-science",
        icon: "science",
        name: "Естествознание",
        percent: 75,
        status: "improving",
      },
      {
        id: "languages",
        icon: "language",
        name: "Английский и казахский",
        percent: 85,
        status: "strong",
      },
      {
        id: "logic",
        icon: "extension",
        name: "Логические задачи",
        percent: 40,
        status: "needs-practice",
      },
    ],
    accuracyTrend: [
      { day: "Mon", accuracy: 42 },
      { day: "Tue", accuracy: 51 },
      { day: "Wed", accuracy: 48 },
      { day: "Thu", accuracy: 63 },
      { day: "Fri", accuracy: 82 },
    ],
    risks: [
      {
        title: "Логические задачи",
        detail: "Точность снизилась до 45%. Нужна короткая ежедневная практика.",
        level: "High",
        accuracy: 45,
      },
      {
        title: "Количественные сравнения",
        detail: "Показатель нестабилен: 52%. Повторить стратегии сравнения.",
        level: "Medium",
        accuracy: 52,
      },
      {
        title: "Выносливость на пробном экзамене",
        detail: "На этой неделе нужен один полный тест по времени.",
        level: "Medium",
        accuracy: 61,
      },
    ],
    parentRecommendation:
      "Попросите ученика показать две самые сложные задачи недели и объяснить, как он исправил ошибки.",
    recommendations: [
      "Выделить 25 минут на логику в понедельник, среду и пятницу.",
      "После каждой практики разобрать две ошибки вслух.",
      "Оставить субботнее утро свободным для полного пробного экзамена.",
    ],
    examAttempts: account.examAttempts ?? [],
    weakTopicProgress: account.weakTopicProgress ?? [],
    solutionExplanationLogs: account.solutionExplanationLogs ?? [],
  };
}

export async function registerAccount(input: {
  name: string;
  email: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);

  if (isSupabaseConfigured() && (await findAccountByEmail(normalizedEmail))) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  if (!isSupabaseConfigured() && accounts.has(normalizedEmail)) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const parentPhone = input.parentPhone.trim();
  const inviteCode = createUniqueParentInviteCode();

  if (isSupabaseConfigured()) {
    const account = await createAccountWithParent({
      name: input.name.trim(),
      email: normalizedEmail,
      grade: input.grade,
      initials: getInitials(input.name),
      parentName: input.parentName.trim(),
      parentPhone,
      password: input.password,
      inviteCode,
    });
    setSessionEmail(account.email);
    return toPublicAccount(account);
  }

  const account: StoredAccount = {
    id: `account-${Date.now()}`,
    name: input.name.trim(),
    email: normalizedEmail,
    grade: input.grade,
    initials: getInitials(input.name),
    role: "student",
    parentName: input.parentName.trim(),
    parentPhone,
    parentPhoneVerified: false,
    parentTelegramChatId: undefined,
    parentTelegramConnected: false,
    parentTelegramVerifiedAt: undefined,
    parentInviteCode: inviteCode,
    parentLastReportSentAt: undefined,
    parentWhatsApp: parentPhone,
    parentWhatsAppVerified: false,
    telegramParentVerified: false,
    subscriptionStatus: "inactive",
    subscriptionPlan: undefined,
    subscriptionStartedAt: undefined,
    subscriptionExpiresAt: undefined,
    diagnosticCompleted: false,
    diagnosticScore: undefined,
    diagnosticWeakTopics: undefined,
    mentorStyle: "friendly",
    password: input.password,
  };

  accounts.set(account.email, account);
  setSessionEmail(account.email);

  return toPublicAccount(account);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailExists(email: string) {
  return accounts.has(normalizeEmail(email));
}

export async function createOrReturnParentInvite() {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!account.parentInviteCode) {
    account.parentInviteCode = createUniqueParentInviteCode();
    accounts.set(account.email, account);
  }

  return {
    inviteCode: account.parentInviteCode,
    parentName: account.parentName,
    verified: account.parentTelegramConnected && account.parentPhoneVerified,
  };
}

export async function verifyParentTelegramInvite(inviteCode: string, telegramChatId: string) {
  if (isSupabaseConfigured()) {
    const account = await verifyParentTelegram(inviteCode, telegramChatId);
    return account ? toPublicAccount(account) : null;
  }

  const account = [...accounts.values()].find((item) => item.parentInviteCode === inviteCode);

  if (!account) {
    return null;
  }

  const now = new Date().toISOString();
  account.parentTelegramChatId = telegramChatId;
  account.parentTelegramConnected = true;
  account.parentPhoneVerified = true;
  account.telegramParentVerified = true;
  account.parentWhatsAppVerified = false;
  account.parentTelegramVerifiedAt = now;
  accounts.set(account.email, account);

  return toPublicAccount(account);
}

export async function getVerifiedParentReportTargets() {
  if (isSupabaseConfigured()) {
    const targets = await getVerifiedReportTargets();
    return targets.map((target) => ({
      account: toPublicAccount(target.account),
      telegramChatId: target.telegramChatId,
    }));
  }

  return [...accounts.values()]
    .filter(
      (account) =>
        Boolean(account.parentTelegramChatId) &&
        account.parentTelegramConnected &&
        account.parentPhoneVerified &&
        hasActiveSubscription(account),
    )
    .map((account) => ({
      account: toPublicAccount(account),
      telegramChatId: account.parentTelegramChatId as string,
    }));
}

export async function getCurrentParentReportTarget() {
  const account = await getActiveStoredAccount();

  if (!account) {
    return null;
  }

  if (
    !account.parentTelegramChatId ||
    !account.parentTelegramConnected ||
    !account.parentPhoneVerified ||
    !hasActiveSubscription(account)
  ) {
    return null;
  }

  return {
    account: toPublicAccount(account),
    telegramChatId: account.parentTelegramChatId,
  };
}

export async function wasWeeklyReportSent(studentId: string, weekKey: string) {
  if (isSupabaseConfigured()) {
    return wasReportSent(studentId, weekKey);
  }

  return sentWeeklyReportKeys.has(`${studentId}:${weekKey}`);
}

export async function markWeeklyReportSent(studentId: string, weekKey: string) {
  if (isSupabaseConfigured()) {
    await markReportSent(studentId, weekKey);
    return;
  }

  sentWeeklyReportKeys.add(`${studentId}:${weekKey}`);
  const account = [...accounts.values()].find((item) => item.id === studentId);

  if (account) {
    account.parentLastReportSentAt = new Date().toISOString();
    accounts.set(account.email, account);
  }
}

function createUniqueParentInviteCode() {
  let inviteCode = "";
  const existingCodes = new Set([...accounts.values()].map((account) => account.parentInviteCode));

  do {
    inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (existingCodes.has(inviteCode));

  return inviteCode;
}

export async function updateMentorStyle(style: MentorStyle) {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  if (isSupabaseConfigured()) {
    const updated = await updateMentor(account.id, style);
    return toPublicAccount(updated);
  }

  account.mentorStyle = style;
  accounts.set(account.email, account);
  return toPublicAccount(account);
}

export async function saveExamAttempt(attempt: Omit<ExamAttempt, "id" | "createdAt">) {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  const saved: ExamAttempt = {
    ...attempt,
    id: `exam-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  account.examAttempts = [saved, ...(account.examAttempts ?? [])].slice(0, 20);
  accounts.set(account.email, account);
  return saved;
}

export async function saveWeakTopicProgress(progress: WeakTopicProgress) {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  const previous = account.weakTopicProgress ?? [];
  account.weakTopicProgress = [
    progress,
    ...previous.filter((item) => item.topicId !== progress.topicId),
  ];
  accounts.set(account.email, account);
  return progress;
}

export async function saveSolutionExplanationLog(log: Omit<SolutionExplanationLog, "id" | "createdAt">) {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  const saved: SolutionExplanationLog = {
    ...log,
    id: `solution-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  account.solutionExplanationLogs = [saved, ...(account.solutionExplanationLogs ?? [])].slice(0, 30);
  accounts.set(account.email, account);
  return saved;
}

export function createParentWhatsAppCode(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    throw new Error("Parent WhatsApp number is required.");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  parentWhatsAppVerifications.set(normalizedPhone, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return code;
}

function verifyParentWhatsAppCode(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);
  const verification = parentWhatsAppVerifications.get(normalizedPhone);

  if (!verification || verification.expiresAt < Date.now()) {
    parentWhatsAppVerifications.delete(normalizedPhone);
    return false;
  }

  if (verification.code !== code.trim()) {
    return false;
  }

  parentWhatsAppVerifications.delete(normalizedPhone);
  return true;
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export async function loginAccount(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const account = await findAccountByEmail(email);

    if (!account || account.password !== hashPassword(input.password)) {
      return null;
    }

    setSessionEmail(account.email);
    return toPublicAccount(account);
  }

  const account = accounts.get(email);

  if (!account || account.password !== input.password) {
    return null;
  }

  setSessionEmail(account.email);
  return toPublicAccount(account);
}

export function logoutAccount() {
  clearSessionEmail();
  return { ok: true };
}

export async function getCurrentAccount() {
  const account = await getActiveStoredAccount();
  return account ? toPublicAccount(account) : null;
}

export function canEnterPlatform(account: Account | StoredAccount | null) {
  if (!account) {
    return false;
  }

  return Boolean(
    account.telegramParentVerified ||
      (account.parentTelegramConnected && account.parentPhoneVerified),
  );
}

export function hasActiveSubscription(account: Account | StoredAccount | null) {
  if (!account) {
    return false;
  }

  if (account.subscriptionStatus !== "active") {
    return false;
  }

  if (!account.subscriptionExpiresAt) {
    return true;
  }

  return new Date(account.subscriptionExpiresAt).getTime() > Date.now();
}

export type ContentType =
  | "diagnostic_test"
  | "diagnostic_result"
  | "pricing_page"
  | "payment_page"
  | "paid_lesson"
  | "practice"
  | "ai_tutor"
  | "progress_full"
  | "parent_report"
  | "weekly_challenge"
  | "monthly_test"
  | "shop";

export function canAccessContent(
  contentType: ContentType,
  account: Account | StoredAccount | null,
) {
  if (!canEnterPlatform(account)) {
    return false;
  }

  if (
    contentType === "diagnostic_test" ||
    contentType === "diagnostic_result" ||
    contentType === "pricing_page" ||
    contentType === "payment_page"
  ) {
    return true;
  }

  return hasActiveSubscription(account);
}

export async function getAccessError(contentType: ContentType) {
  const account = await getActiveStoredAccount();

  if (!account) {
    return {
      error: "AUTH_REQUIRED",
      message: "Алдымен аккаунтқа кіріңіз.",
    };
  }

  if (!canEnterPlatform(account)) {
    return {
      error: "TELEGRAM_VERIFICATION_REQUIRED",
      message: "Платформаға кіру үшін ата-ана Telegram арқылы расталуы керек.",
    };
  }

  if (!canAccessContent(contentType, account)) {
    return {
      error: "SUBSCRIPTION_REQUIRED",
      message: "Бұл бөлімді қолдану үшін жазылым қажет.",
    };
  }

  return null;
}

export async function saveDiagnosticResult(input: { score: number; weakTopics: string[] }) {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  if (isSupabaseConfigured()) {
    const updated = await updateDiagnosticResult(account.id, input);
    return toPublicAccount(updated);
  }

  account.diagnosticCompleted = true;
  account.diagnosticScore = input.score;
  account.diagnosticWeakTopics = input.weakTopics;
  accounts.set(account.email, account);
  return toPublicAccount(account);
}

export async function createPaymentRequest(input: { planKey: PlanKey; paymentMethod: PaymentMethod }) {
  const account = await getActiveStoredAccount();

  if (!account) {
    throw new Error("AUTH_REQUIRED");
  }

  const plan = pricingPlans.find((item) => item.key === input.planKey);

  if (!plan) {
    throw new Error("INVALID_PLAN");
  }

  if (!canAccessContent("payment_page", account)) {
    throw new Error("TELEGRAM_VERIFICATION_REQUIRED");
  }

  const request: PaymentRequest = {
    id: `pay-${Date.now()}`,
    userId: account.id,
    studentName: account.name,
    studentEmail: account.email,
    parentPhone: account.parentPhone,
    planKey: plan.key,
    planName: plan.name,
    amount: plan.price,
    currency: "KZT",
    paymentMethod: input.paymentMethod,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    return createPaymentRequestRow(request);
  }

  paymentRequests.set(request.id, request);
  return request;
}

export async function listPaymentRequests() {
  if (isSupabaseConfigured()) {
    return listPaymentRequestRows();
  }

  return [...paymentRequests.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function updatePaymentRequest(input: {
  id: string;
  action: "invoice_sent" | "approve" | "reject";
  adminNote?: string;
  kaspiInvoiceReference?: string;
  kaspiPaymentLink?: string;
}) {
  const request = isSupabaseConfigured()
    ? (await listPaymentRequestRows()).find((item) => item.id === input.id)
    : paymentRequests.get(input.id);

  if (!request) {
    throw new Error("PAYMENT_REQUEST_NOT_FOUND");
  }

  request.adminNote = input.adminNote?.trim() || request.adminNote;
  request.kaspiInvoiceReference = input.kaspiInvoiceReference?.trim() || request.kaspiInvoiceReference;
  request.kaspiPaymentLink = input.kaspiPaymentLink?.trim() || request.kaspiPaymentLink;

  if (input.action === "invoice_sent") {
    request.status = "invoice_sent";
  }

  if (input.action === "reject") {
    request.status = "rejected";
    request.rejectedAt = new Date().toISOString();
  }

  if (input.action === "approve") {
    const plan = pricingPlans.find((item) => item.key === request.planKey);

    if (!plan) {
      throw new Error("PAYMENT_APPROVAL_TARGET_NOT_FOUND");
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);

    request.status = "approved";
    request.confirmedAt = now.toISOString();

    if (isSupabaseConfigured()) {
      await activateSubscription(request.userId, plan.key, plan.durationMonths);
    } else {
      const account = [...accounts.values()].find((item) => item.id === request.userId);

      if (!account) {
        throw new Error("PAYMENT_APPROVAL_TARGET_NOT_FOUND");
      }

      account.subscriptionStatus = "active";
      account.subscriptionPlan = plan.key;
      account.subscriptionStartedAt = now.toISOString();
      account.subscriptionExpiresAt = expiresAt.toISOString();
      accounts.set(account.email, account);
    }
  }

  if (isSupabaseConfigured()) {
    return updatePaymentRequestRow(request.id, {
      admin_note: request.adminNote ?? null,
      kaspi_invoice_reference: request.kaspiInvoiceReference ?? null,
      kaspi_payment_link: request.kaspiPaymentLink ?? null,
      status: request.status,
      confirmed_at: request.confirmedAt ?? null,
      rejected_at: request.rejectedAt ?? null,
    });
  }

  paymentRequests.set(request.id, request);
  return request;
}

export function getPostLoginRedirect(account: Account | StoredAccount) {
  if (!canEnterPlatform(account)) {
    return "/verify-parent-telegram";
  }

  if (!account.diagnosticCompleted) {
    return "/diagnostic";
  }

  if (!hasActiveSubscription(account)) {
    return "/pricing";
  }

  return "/home";
}
