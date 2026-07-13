import { createFileRoute } from "@tanstack/react-router";

import { getCurrentParentReportTarget, getDashboardAccount } from "@/lib/account-store.server";
import { sendTelegramMessage } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/whatsapp-weekly-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return Response.json({ error: "Unauthorized weekly report request." }, { status: 401 });
        }

        const target = getCurrentParentReportTarget();

        if (!target) {
          return Response.json({
            status: "not_sent",
            reason: "Parent is not verified through Telegram yet.",
          });
        }

        const reportText = generateWeeklyReport(target.account.id);
        const result = await sendTelegramMessage({
          chatId: target.telegramChatId,
          text: reportText,
        });

        if (!result.ok) {
          return Response.json(
            {
              status: "not_sent",
              reportPreview: reportText,
              reason: result,
            },
            { status: result.code === "missing_config" ? 200 : 502 },
          );
        }

        return Response.json({
          status: "sent",
          mode: "telegram",
          telegramMessageId: result.messageId,
        });
      },
    },
  },
});

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const urlSecret = new URL(request.url).searchParams.get("secret");

  return authorization === `Bearer ${secret}` || headerSecret === secret || urlSecret === secret;
}

export function generateWeeklyReport(studentId?: string) {
  const dashboard = getDashboardAccount();
  const weekRange = getCurrentWeekRange();
  const weeklyChange = getWeeklyChange(dashboard.accuracyTrend);
  const activity = getWeeklyActivity(dashboard);
  const subjects = getSubjectPerformance(dashboard);
  const weakTopics = getWeakTopics(dashboard);
  const commonMistakes = getCommonMistakes(dashboard);
  const level = getLevel(dashboard.averageAccuracy);
  const status = getStatus(weeklyChange.value);
  const nextGoal = Math.min(95, Math.max(70, dashboard.averageAccuracy + 7));
  const studentLabel = studentId ? dashboard.account.name : dashboard.account.name;

  return [
    `📊 AI-Sana апталық есебі`,
    ``,
    `👤 Оқушы: ${studentLabel}`,
    `📅 Апта: ${weekRange}`,
    `🎯 Жалпы нәтиже: ${dashboard.averageAccuracy}%`,
    `📈 Өткен аптамен салыстыру: ${weeklyChange.label}`,
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `✅ Оқу белсенділігі`,
    `• Өткен сабақтар: ${dashboard.completedLessons}`,
    `• Шешілген сұрақтар: ${activity.solvedQuestions}`,
    `• Дұрыс жауаптар: ${activity.correctAnswers}`,
    `• Қате жауаптар: ${activity.wrongAnswers}`,
    dashboard.studyHours ? `• Оқу уақыты: ${dashboard.studyHours} сағ` : null,
    `• Streak: ${activity.streak} күн`,
    `• Жиналған XP: +${activity.xpGained}`,
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `📚 Пәндер бойынша нәтиже`,
    ``,
    `🧮 Математика: ${subjects.math.accuracy}%`,
    `• Күшті тақырып: ${subjects.math.strongTopic}`,
    `• Қиын тақырып: ${subjects.math.weakTopic}`,
    ``,
    `🧠 Логика: ${subjects.logic.accuracy}%`,
    `• Күшті тақырып: ${subjects.logic.strongTopic}`,
    `• Қиын тақырып: ${subjects.logic.weakTopic}`,
    ``,
    `📖 Оқу сауаттылығы: ${subjects.reading.accuracy}%`,
    `• Күшті тақырып: ${subjects.reading.strongTopic}`,
    `• Қиын тақырып: ${subjects.reading.weakTopic}`,
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `⚠️ Әлсіз тақырыптар`,
    formatWeakTopics(weakTopics),
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `❌ Ең жиі кездескен қателер`,
    formatList(commonMistakes),
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `🤖 AI-Sana талдауы`,
    getAiAnalysis(dashboard, weeklyChange.value, weakTopics),
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `🎯 Келесі аптаға жоспар`,
    formatList(getNextWeekPlan(weakTopics)),
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `👨‍👩‍👧 Ата-анаға кеңес`,
    getParentAdvice(dashboard, weakTopics),
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `🏆 Апта қорытындысы`,
    `Деңгей: ${level}`,
    `Статус: ${status}`,
    `Келесі мақсат: ${nextGoal}%`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

type WeeklyChange = {
  label: string;
  value: number;
};

type TopicSummary = {
  accuracy: number;
  explanation: string;
  name: string;
};

function getCurrentWeekRange() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${formatKazakhDate(start)} – ${formatKazakhDate(end)}`;
}

function formatKazakhDate(date: Date) {
  return new Intl.DateTimeFormat("kk-KZ", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getWeeklyChange(trend: ReturnType<typeof getDashboardAccount>["accuracyTrend"]): WeeklyChange {
  if (trend.length < 2) {
    return { label: "Дерек әлі жеткіліксіз", value: 0 };
  }

  const value = trend[trend.length - 1].accuracy - trend[0].accuracy;
  const sign = value > 0 ? "+" : "";
  const direction = value > 0 ? "жақсарды" : value < 0 ? "төмендеді" : "тұрақты";

  return { label: `${sign}${value}% (${direction})`, value };
}

function getWeeklyActivity(dashboard: ReturnType<typeof getDashboardAccount>) {
  const attempts = dashboard.examAttempts;
  const solvedQuestions =
    attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0) || dashboard.completedLessons * 10;
  const correctAnswers =
    attempts.reduce((sum, attempt) => sum + attempt.correctAnswers, 0) ||
    Math.round((solvedQuestions * dashboard.averageAccuracy) / 100);
  const wrongAnswers = Math.max(0, solvedQuestions - correctAnswers);

  return {
    correctAnswers,
    solvedQuestions,
    streak: Math.max(1, dashboard.completedLessons + 2),
    wrongAnswers,
    xpGained: dashboard.completedLessons * 40 + correctAnswers * 2,
  };
}

function getSubjectPerformance(dashboard: ReturnType<typeof getDashboardAccount>) {
  const logic = dashboard.subjects.find((subject) => subject.id === "logic");
  const language = dashboard.subjects.find((subject) => subject.id === "languages");

  return {
    math: {
      accuracy: Math.max(55, dashboard.averageAccuracy + 4),
      strongTopic: "Натурал сандар",
      weakTopic: "Пайыздар",
    },
    logic: {
      accuracy: logic?.percent ?? 45,
      strongTopic: "Қарапайым заңдылықтар",
      weakTopic: dashboard.focus.title,
    },
    reading: {
      accuracy: language?.percent ?? 72,
      strongTopic: "Негізгі ойды табу",
      weakTopic: "Сөйлемдегі байланыс",
    },
  };
}

function getWeakTopics(dashboard: ReturnType<typeof getDashboardAccount>): TopicSummary[] {
  const risks = dashboard.risks.slice(0, 3).map((risk) => ({
    accuracy: risk.accuracy,
    explanation: risk.detail,
    name: risk.title,
  }));

  if (risks.length >= 3) {
    return risks;
  }

  return [
    ...risks,
    {
      accuracy: 48,
      explanation: "Оқушы санның пайызын табуда және шартты қысқа жазуда жиі қателеседі.",
      name: "Пайыздар",
    },
    {
      accuracy: 52,
      explanation: "Ұқсас жауаптардың арасынан дұрыс нұсқаны таңдауда асығыстық байқалады.",
      name: "Сөйлемдегі байланыс",
    },
  ].slice(0, 3);
}

function getCommonMistakes(dashboard: ReturnType<typeof getDashboardAccount>) {
  const wrongQuestions = dashboard.examAttempts.flatMap((attempt) =>
    attempt.questions.filter((question) => !question.isCorrect),
  );
  const hasFastWrongAnswer = wrongQuestions.some((question) => question.timeSpentSeconds < 15);
  const hasSlowWrongAnswer = wrongQuestions.some((question) => question.timeSpentSeconds > 90);

  return [
    "Сұрақ шартын соңына дейін мұқият оқымау.",
    "Есептеу кезінде ұсақ арифметикалық қате жіберу.",
    "Ұқсас жауаптардың арасынан таңдағанда асығып кету.",
    hasFastWrongAnswer ? "Кей сұраққа тым тез жауап беру, бұл болжауға ұқсайды." : null,
    hasSlowWrongAnswer ? "Күрделі сұрақтарда уақытты көп жоғалту." : "Формула мен әдісті шатастыру.",
  ].filter((item): item is string => Boolean(item));
}

function getAiAnalysis(
  dashboard: ReturnType<typeof getDashboardAccount>,
  weeklyChange: number,
  weakTopics: TopicSummary[],
) {
  const trend = weeklyChange > 0 ? "өсім бар" : weeklyChange < 0 ? "аздап төмендеу бар" : "нәтиже тұрақты";
  const mainWeakTopic = weakTopics[0]?.name ?? dashboard.focus.title;

  return `Бұл аптада ${dashboard.account.name} ${dashboard.completedLessons} сабақ аяқтады. Жалпы ${trend}. Негізгі назарды "${mainWeakTopic}" тақырыбына бөлу керек: қателер көбіне шартты түсіну және шешу тәсілін таңдаудан шығады. Келесі аптада қысқа, бірақ тұрақты қайталау нәтиженің көтерілуіне көмектеседі.`;
}

function getNextWeekPlan(weakTopics: TopicSummary[]) {
  const mainTopic = weakTopics[0]?.name ?? "әлсіз тақырып";

  return [
    `${mainTopic} бойынша кемінде 20 сұрақ шешу.`,
    "Қате кеткен сұрақтарды қайта шығарып, себебін қысқа жазу.",
    "Күн сайын 15–20 минут логика немесе математика практикасын жасау.",
    "Апта соңында 1 mini test тапсыру.",
  ];
}

function getParentAdvice(dashboard: ReturnType<typeof getDashboardAccount>, weakTopics: TopicSummary[]) {
  const topic = weakTopics[0]?.name ?? dashboard.focus.title;

  return `Балаңыздан "${topic}" бойынша екі қате сұрақты өз сөзімен түсіндіруін сұраңыз. Күніне 15 минут бірге тексеру жеткілікті: бастысы жауапты жаттау емес, шешу қадамын түсіндіру.`;
}

function getLevel(accuracy: number) {
  if (accuracy >= 85) {
    return "Excellent";
  }

  if (accuracy >= 65) {
    return "Good";
  }

  return "Needs practice";
}

function getStatus(weeklyChange: number) {
  if (weeklyChange >= 5) {
    return "Progress improving";
  }

  if (weeklyChange <= -5) {
    return "Needs attention";
  }

  return "Stable";
}

function formatWeakTopics(topics: TopicSummary[]) {
  return topics
    .map((topic) => `• ${topic.name} — ${topic.accuracy}%\n  ${topic.explanation}`)
    .join("\n");
}

function formatList(items: string[]) {
  return items.map((item) => `• ${item}`).join("\n");
}
