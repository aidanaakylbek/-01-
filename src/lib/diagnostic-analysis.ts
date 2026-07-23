import type { DiagnosticQuestion } from "@/data/diagnostic-questions";

export const DIAGNOSTIC_VERSION = "2026.07.onboarding-v1";

export type DiagnosticLevel = "Бастапқы" | "Негізгі" | "Орта" | "Жоғары";

export type DiagnosticAttemptSnapshot = {
  questionId: string;
  subject: string;
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

export type DiagnosticAnalysis = {
  assignedLevel: DiagnosticLevel;
  aiRecommendation: string;
  recommendedStartingLesson: string;
  strongTopics: string[];
  subjectLevels: Record<string, DiagnosticLevel>;
  subjectScores: Record<string, number>;
  topicScores: Record<string, number>;
  weakTopics: string[];
};

export const diagnosticLevelThresholds: Array<{ level: DiagnosticLevel; minScore: number }> = [
  { level: "Жоғары", minScore: 85 },
  { level: "Орта", minScore: 65 },
  { level: "Негізгі", minScore: 40 },
  { level: "Бастапқы", minScore: 0 },
];

export function assignDiagnosticLevel(score: number): DiagnosticLevel {
  const boundedScore = Math.max(0, Math.min(100, score));
  return (
    diagnosticLevelThresholds.find((threshold) => boundedScore >= threshold.minScore)?.level ??
    "Бастапқы"
  );
}

export function buildDiagnosticAttemptSnapshot(
  question: DiagnosticQuestion,
  userAnswer: string,
  language: keyof DiagnosticQuestion["question"],
): DiagnosticAttemptSnapshot {
  const correctAnswer = question.correctAnswer[language];

  return {
    questionId: question.id,
    subject: question.subject,
    topic: question.topic,
    question: question.question[language],
    userAnswer: userAnswer || "-",
    correctAnswer,
    isCorrect: userAnswer === correctAnswer,
    explanation: question.explanation[language],
  };
}

export function analyzeDiagnosticAttempts(
  attempts: DiagnosticAttemptSnapshot[],
): DiagnosticAnalysis {
  const subjectScores = calculateScores(attempts, "subject");
  const topicScores = calculateScores(attempts, "topic");
  const overallScore = attempts.length
    ? Math.round((attempts.filter((attempt) => attempt.isCorrect).length / attempts.length) * 100)
    : 0;

  const weakTopics = Object.entries(topicScores)
    .filter(([, score]) => score < 70)
    .sort((a, b) => a[1] - b[1])
    .map(([topic]) => topic)
    .slice(0, 5);
  const strongTopics = Object.entries(topicScores)
    .filter(([, score]) => score >= 80)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)
    .slice(0, 5);
  const subjectLevels = Object.fromEntries(
    Object.entries(subjectScores).map(([subject, score]) => [
      subject,
      assignDiagnosticLevel(score),
    ]),
  );
  const assignedLevel = assignDiagnosticLevel(overallScore);
  const recommendedStartingLesson = weakTopics[0] ?? "Негізгі математика және логика";

  return {
    assignedLevel,
    aiRecommendation: buildAiRecommendation(assignedLevel, weakTopics, strongTopics),
    recommendedStartingLesson,
    strongTopics,
    subjectLevels,
    subjectScores,
    topicScores,
    weakTopics,
  };
}

function calculateScores(
  attempts: DiagnosticAttemptSnapshot[],
  key: "subject" | "topic",
): Record<string, number> {
  const grouped = new Map<string, { correct: number; total: number }>();

  for (const attempt of attempts) {
    const groupKey = attempt[key] || "General";
    const current = grouped.get(groupKey) ?? { correct: 0, total: 0 };
    grouped.set(groupKey, {
      correct: current.correct + (attempt.isCorrect ? 1 : 0),
      total: current.total + 1,
    });
  }

  return Object.fromEntries(
    Array.from(grouped.entries()).map(([groupKey, value]) => [
      groupKey,
      value.total ? Math.round((value.correct / value.total) * 100) : 0,
    ]),
  );
}

function buildAiRecommendation(
  level: DiagnosticLevel,
  weakTopics: string[],
  strongTopics: string[],
) {
  const weakText = weakTopics.length ? weakTopics.slice(0, 2).join(", ") : "негізгі тақырыптар";
  const strongText = strongTopics.length ? strongTopics[0] : "тұрақты дайындық";

  if (level === "Жоғары") {
    return `Деңгейіңіз жақсы. ${strongText} бағытын сақтап, ${weakText} тақырыптарын қысқа қайталау жеткілікті.`;
  }

  if (level === "Орта") {
    return `Негіз бар. Енді ${weakText} тақырыптарын ретімен бекітіп, әр қате сұрақты түсіндірмесімен қайта шешіңіз.`;
  }

  if (level === "Негізгі") {
    return `Алдымен ${weakText} тақырыптарын қарапайым мысалдардан бастаңыз. Бірден қиын тестке өтпей, күн сайын аз тапсырма орындаңыз.`;
  }

  return `Дайындықты ең жеңіл сабақтардан бастаған дұрыс. ${weakText} бойынша қысқа түсіндірме, кейін 5-7 жеңіл сұрақ орындаңыз.`;
}
