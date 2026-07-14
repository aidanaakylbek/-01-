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

type StoredAccount = Account & {
  examAttempts?: ExamAttempt[];
  password: string;
  solutionExplanationLogs?: SolutionExplanationLog[];
  weakTopicProgress?: WeakTopicProgress[];
};

type ParentWhatsAppVerification = {
  code: string;
  expiresAt: number;
};

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
let activeEmail = demoAccount.email;

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

function getActiveStoredAccount() {
  return accounts.get(activeEmail) ?? demoAccount;
}

export function getDashboardAccount(): DashboardAccount {
  const account = accounts.get(activeEmail) ?? demoAccount;

  return {
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

export function registerAccount(input: {
  name: string;
  email: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  password: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (accounts.has(normalizedEmail)) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const parentPhone = input.parentPhone.trim();
  const inviteCode = createUniqueParentInviteCode();

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
  activeEmail = account.email;

  return toPublicAccount(account);
}

export function createOrReturnParentInvite() {
  const account = accounts.get(activeEmail) ?? demoAccount;

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

export function verifyParentTelegramInvite(inviteCode: string, telegramChatId: string) {
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

export function getVerifiedParentReportTargets() {
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

export function getCurrentParentReportTarget() {
  const account = accounts.get(activeEmail) ?? demoAccount;

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

export function wasWeeklyReportSent(studentId: string, weekKey: string) {
  return sentWeeklyReportKeys.has(`${studentId}:${weekKey}`);
}

export function markWeeklyReportSent(studentId: string, weekKey: string) {
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

export function updateMentorStyle(style: MentorStyle) {
  const account = accounts.get(activeEmail) ?? demoAccount;
  account.mentorStyle = style;
  accounts.set(account.email, account);
  return toPublicAccount(account);
}

export function saveExamAttempt(attempt: Omit<ExamAttempt, "id" | "createdAt">) {
  const account = accounts.get(activeEmail) ?? demoAccount;
  const saved: ExamAttempt = {
    ...attempt,
    id: `exam-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  account.examAttempts = [saved, ...(account.examAttempts ?? [])].slice(0, 20);
  accounts.set(account.email, account);
  return saved;
}

export function saveWeakTopicProgress(progress: WeakTopicProgress) {
  const account = accounts.get(activeEmail) ?? demoAccount;
  const previous = account.weakTopicProgress ?? [];
  account.weakTopicProgress = [
    progress,
    ...previous.filter((item) => item.topicId !== progress.topicId),
  ];
  accounts.set(account.email, account);
  return progress;
}

export function saveSolutionExplanationLog(log: Omit<SolutionExplanationLog, "id" | "createdAt">) {
  const account = accounts.get(activeEmail) ?? demoAccount;
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

export function loginAccount(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const account = accounts.get(email);

  if (!account || account.password !== input.password) {
    return null;
  }

  activeEmail = account.email;
  return toPublicAccount(account);
}

export function logoutAccount() {
  activeEmail = demoAccount.email;
  return { ok: true };
}

export function getCurrentAccount() {
  return toPublicAccount(getActiveStoredAccount());
}

export function canEnterPlatform(account: Account | StoredAccount = getActiveStoredAccount()) {
  return Boolean(
    account.telegramParentVerified ||
      (account.parentTelegramConnected && account.parentPhoneVerified),
  );
}

export function hasActiveSubscription(account: Account | StoredAccount = getActiveStoredAccount()) {
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
  account: Account | StoredAccount = getActiveStoredAccount(),
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

export function getAccessError(contentType: ContentType) {
  const account = getActiveStoredAccount();

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

export function saveDiagnosticResult(input: { score: number; weakTopics: string[] }) {
  const account = getActiveStoredAccount();
  account.diagnosticCompleted = true;
  account.diagnosticScore = input.score;
  account.diagnosticWeakTopics = input.weakTopics;
  accounts.set(account.email, account);
  return toPublicAccount(account);
}

export function createPaymentRequest(input: { planKey: PlanKey; paymentMethod: PaymentMethod }) {
  const account = getActiveStoredAccount();
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

  paymentRequests.set(request.id, request);
  return request;
}

export function listPaymentRequests() {
  return [...paymentRequests.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function updatePaymentRequest(input: {
  id: string;
  action: "invoice_sent" | "approve" | "reject";
  adminNote?: string;
  kaspiInvoiceReference?: string;
  kaspiPaymentLink?: string;
}) {
  const request = paymentRequests.get(input.id);

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
    const account = [...accounts.values()].find((item) => item.id === request.userId);
    const plan = pricingPlans.find((item) => item.key === request.planKey);

    if (!account || !plan) {
      throw new Error("PAYMENT_APPROVAL_TARGET_NOT_FOUND");
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);

    request.status = "approved";
    request.confirmedAt = now.toISOString();
    account.subscriptionStatus = "active";
    account.subscriptionPlan = plan.key;
    account.subscriptionStartedAt = now.toISOString();
    account.subscriptionExpiresAt = expiresAt.toISOString();
    accounts.set(account.email, account);
  }

  paymentRequests.set(request.id, request);
  return request;
}
