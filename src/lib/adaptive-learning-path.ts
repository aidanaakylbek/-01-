import type { Account, ExamAttempt } from "@/lib/account-store.server";

export type LearningPathStepState = "completed" | "current" | "locked" | "review";
export type LearningPathStepKind =
  | "topic"
  | "practice"
  | "test"
  | "revision"
  | "weekly"
  | "monthly";

export type AdaptiveLearningPathStep = {
  id: string;
  topic: string;
  kind: LearningPathStepKind;
  title: string;
  progress: number;
  lessons: number;
  practiceStatus: "Қажет" | "Дайын" | "Аяқталды";
  testStatus: "Жабық" | "Ашық" | "Қайта тапсыру" | "Аяқталды";
  state: LearningPathStepState;
  href: string;
  aiMessage: string;
};

const defaultTopicOrder = [
  "Арифметика",
  "Пайыздар",
  "Логика",
  "Геометрия",
  "Теңдеулер",
  "Оқу сауаттылығы",
  "Қазақ тілі",
  "Ағылшын тілі",
];

const topicAliases: Record<string, string> = {
  arithmetic: "Арифметика",
  math: "Арифметика",
  mathematics: "Арифметика",
  percentages: "Пайыздар",
  percentage: "Пайыздар",
  logic: "Логика",
  geometry: "Геометрия",
  equations: "Теңдеулер",
  reading: "Оқу сауаттылығы",
  literacy: "Оқу сауаттылығы",
  kazakh: "Қазақ тілі",
  english: "Ағылшын тілі",
};

export function generateAdaptiveLearningPath(
  account: Account,
  examAttempts: ExamAttempt[],
): {
  steps: AdaptiveLearningPathStep[];
  updateMessage: string;
  nextHref: string;
} {
  if (!account.diagnosticCompleted) {
    return {
      nextHref: "/diagnostic",
      updateMessage:
        "Алдымен диагностикалық тестті аяқтаңыз. AI-Sana оқу жолын содан кейін құрады.",
      steps: [
        {
          aiMessage: "Диагностика сіздің бастапқы деңгейіңізді анықтайды.",
          href: "/diagnostic",
          id: "diagnostic",
          kind: "test",
          lessons: 0,
          practiceStatus: "Қажет",
          progress: 0,
          state: "current",
          testStatus: "Ашық",
          title: "Диагностика",
          topic: "Бастапқы деңгей",
        },
      ],
    };
  }

  const topicScores = normalizeTopicScores(account.diagnosticTopicScores);
  const recentScores = getRecentExamTopicScores(examAttempts);
  const mergedScores = mergeScores(topicScores, recentScores);
  const orderedTopics = orderTopics(
    mergedScores,
    account.diagnosticWeakTopics,
    account.diagnosticStrongTopics,
  );
  const steps: AdaptiveLearningPathStep[] = [];

  for (const topic of orderedTopics) {
    const score = mergedScores[topic] ?? 0;
    const needsRevision = score < 70;
    const isStrong = score >= 85;

    steps.push({
      aiMessage: needsRevision
        ? `${topic} нәтижесі ${score}%. Келесі тақырыпқа өтпей тұрып, осы жерді бекіту керек.`
        : isStrong
          ? `${topic} жақсы деңгейде. Қысқа review жеткілікті.`
          : `${topic} бойынша негізгі сабақ пен practice аяқталғаннан кейін topic test ашылады.`,
      href: "/plan",
      id: `${slugify(topic)}-lesson`,
      kind: needsRevision ? "revision" : "topic",
      lessons: needsRevision ? 2 : isStrong ? 1 : 3,
      practiceStatus: needsRevision ? "Қажет" : "Дайын",
      progress: needsRevision ? Math.max(10, Math.min(60, score)) : Math.min(90, score),
      state: "locked",
      testStatus: needsRevision ? "Қайта тапсыру" : "Жабық",
      title: needsRevision ? `${topic} Revision` : isStrong ? `${topic} Review` : topic,
      topic,
    });

    if (needsRevision) {
      steps.push({
        aiMessage:
          "AI-Sana қосымша сұрақтар мен mini quiz қосады. 70% жинағанда келесі тақырып ашылады.",
        href: "/plan",
        id: `${slugify(topic)}-practice`,
        kind: "practice",
        lessons: 0,
        practiceStatus: "Қажет",
        progress: 0,
        state: "locked",
        testStatus: "Жабық",
        title: `${topic} Extra Practice`,
        topic,
      });
    }
  }

  const weeklyUnlocked = steps.length >= 3;
  steps.splice(Math.min(3, steps.length), 0, {
    aiMessage: "Бірнеше тақырып аяқталғаннан кейін апталық тест оқу жолын қайта реттейді.",
    href: "/progress",
    id: "weekly-test",
    kind: "weekly",
    lessons: 0,
    practiceStatus: "Дайын",
    progress: 0,
    state: weeklyUnlocked ? "locked" : "locked",
    testStatus: weeklyUnlocked ? "Жабық" : "Жабық",
    title: "Апталық тест",
    topic: "Жалпы тексеріс",
  });

  steps.push({
    aiMessage: "Ай соңында AI-Sana жылдамдық, дәлдік және әлсіз тақырыптарды қайта бағалайды.",
    href: "/exam",
    id: "monthly-test",
    kind: "monthly",
    lessons: 0,
    practiceStatus: "Дайын",
    progress: 0,
    state: "locked",
    testStatus: "Жабық",
    title: "Айлық қорытынды тест",
    topic: "Жалпы деңгей",
  });

  const unlockedSteps = [
    {
      aiMessage: "Диагностика аяқталды. AI-Sana сіздің күшті және әлсіз тақырыптарыңызды есептеді.",
      href: "/diagnostic",
      id: "diagnostic-completed",
      kind: "test" as const,
      lessons: 0,
      practiceStatus: "Аяқталды" as const,
      progress: 100,
      state: "completed" as const,
      testStatus: "Аяқталды" as const,
      title: "Диагностика",
      topic: "Бастапқы деңгей",
    },
    ...applyProgression(steps),
  ];
  const currentStep = unlockedSteps.find((step) => step.state === "current") ?? unlockedSteps[0];

  return {
    nextHref: currentStep?.href ?? "/plan",
    steps: unlockedSteps,
    updateMessage: buildUpdateMessage(account, recentScores, currentStep),
  };
}

function normalizeTopicScores(scores?: Record<string, number>) {
  const normalized: Record<string, number> = {};

  for (const [rawTopic, score] of Object.entries(scores ?? {})) {
    const topic = normalizeTopicName(rawTopic);
    normalized[topic] = Math.round(score);
  }

  if (!Object.keys(normalized).length) {
    for (const topic of defaultTopicOrder.slice(0, 4)) {
      normalized[topic] = 0;
    }
  }

  return normalized;
}

function normalizeTopicName(topic: string) {
  const key = topic.trim().toLowerCase();
  return topicAliases[key] ?? topic.trim();
}

function getRecentExamTopicScores(examAttempts: ExamAttempt[]) {
  const recent = examAttempts.slice(-3);
  const grouped = new Map<string, { correct: number; total: number }>();

  for (const attempt of recent) {
    for (const question of attempt.questions) {
      const topic = normalizeTopicName(question.topic || "Аралас тақырып");
      const current = grouped.get(topic) ?? { correct: 0, total: 0 };
      grouped.set(topic, {
        correct: current.correct + (question.isCorrect ? 1 : 0),
        total: current.total + 1,
      });
    }
  }

  return Object.fromEntries(
    Array.from(grouped.entries()).map(([topic, value]) => [
      topic,
      value.total ? Math.round((value.correct / value.total) * 100) : 0,
    ]),
  );
}

function mergeScores(baseScores: Record<string, number>, recentScores: Record<string, number>) {
  const allTopics = new Set([...Object.keys(baseScores), ...Object.keys(recentScores)]);
  const merged: Record<string, number> = {};

  for (const topic of allTopics) {
    const base = baseScores[topic] ?? 0;
    const recent = recentScores[topic];
    merged[topic] = recent === undefined ? base : Math.round(base * 0.55 + recent * 0.45);
  }

  return merged;
}

function orderTopics(
  scores: Record<string, number>,
  weakTopics: string[] = [],
  strongTopics: string[] = [],
) {
  const normalizedWeak = weakTopics.map(normalizeTopicName);
  const normalizedStrong = strongTopics.map(normalizeTopicName);
  const topics = Array.from(
    new Set([...normalizedWeak, ...Object.keys(scores), ...defaultTopicOrder]),
  );

  return topics
    .map((topic) => ({ topic, score: scores[topic] ?? 100 }))
    .sort((a, b) => {
      const aWeakBoost = normalizedWeak.includes(a.topic) ? -20 : 0;
      const bWeakBoost = normalizedWeak.includes(b.topic) ? -20 : 0;
      const aStrongDelay = normalizedStrong.includes(a.topic) ? 15 : 0;
      const bStrongDelay = normalizedStrong.includes(b.topic) ? 15 : 0;
      return a.score + aWeakBoost + aStrongDelay - (b.score + bWeakBoost + bStrongDelay);
    })
    .slice(0, 6)
    .map(({ topic }) => topic);
}

function applyProgression(steps: AdaptiveLearningPathStep[]) {
  let currentAssigned = false;

  return steps.map((step, index) => {
    if (index === 0) {
      currentAssigned = true;
      return { ...step, state: "current" as const, testStatus: "Ашық" as const };
    }

    if (!currentAssigned && step.progress < 100) {
      currentAssigned = true;
      return { ...step, state: "current" as const };
    }

    return { ...step, state: "locked" as const };
  });
}

function buildUpdateMessage(
  account: Account,
  recentScores: Record<string, number>,
  currentStep?: AdaptiveLearningPathStep,
) {
  const movedTopic = Object.entries(recentScores)
    .sort((a, b) => a[1] - b[1])
    .find(([, score]) => score < 70)?.[0];

  if (movedTopic) {
    return `${movedTopic} жоғары жылжытылды, себебі соңғы тесттер қосымша practice керек екенін көрсетті.`;
  }

  if (account.diagnosticStrongTopics?.length) {
    return `Жақсы нәтиже! ${account.diagnosticStrongTopics[0]} бойынша review қысқартылды, негізгі назар ${currentStep?.topic ?? "әлсіз тақырыптарға"} беріледі.`;
  }

  return "Соңғы нәтижелерге қарап, AI-Sana сіздің жеке оқу жоспарыңызды жаңартты.";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-яәіңғүұқөһ0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}
