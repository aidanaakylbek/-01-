export type Account = {
  id: string;
  name: string;
  email: string;
  grade: string;
  initials: string;
  parentWhatsApp: string;
  parentWhatsAppVerified: boolean;
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
};

type StoredAccount = Account & {
  password: string;
};

type ParentWhatsAppVerification = {
  code: string;
  expiresAt: number;
};

const demoAccount: StoredAccount = {
  id: "demo-aidana",
  name: "Aidana Akylbek",
  email: "aidana@aibi.kz",
  grade: "7",
  initials: "AA",
  parentWhatsApp: "+77001234567",
  parentWhatsAppVerified: true,
  password: "demo123",
};

const accounts = new Map<string, StoredAccount>([[demoAccount.email, demoAccount]]);
const parentWhatsAppVerifications = new Map<string, ParentWhatsAppVerification>();
let activeEmail = demoAccount.email;

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
  };
}

export function registerAccount(input: {
  name: string;
  email: string;
  grade: string;
  parentWhatsApp: string;
  parentWhatsAppVerificationCode: string;
  password: string;
}) {
  const parentWhatsApp = input.parentWhatsApp.trim();

  if (!verifyParentWhatsAppCode(parentWhatsApp, input.parentWhatsAppVerificationCode)) {
    throw new Error("Parent WhatsApp verification code is incorrect or expired.");
  }

  const account: StoredAccount = {
    id: `account-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    grade: input.grade,
    initials: getInitials(input.name),
    parentWhatsApp,
    parentWhatsAppVerified: true,
    password: input.password,
  };

  accounts.set(account.email, account);
  activeEmail = account.email;

  return toPublicAccount(account);
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
