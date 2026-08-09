import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GameCard,
  GameLayout,
  ProgressBar,
  XpRewardBanner,
  notifyXpUpdated,
} from "@/components/gamified-platform";
import { examQuestions } from "@/data/exam-simulator";
import { useLanguage } from "@/hooks/use-language";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { saveExamAttempt } from "@/lib/api/account.functions";

export const Route = createFileRoute("/exam")({
  head: () => ({ meta: [{ title: "Айлық қорытынды тест — AI-Sana" }] }),
  component: MonthlyTestPage,
});

type Status = "intro" | "active" | "finished";

function MonthlyTestPage() {
  const { language } = useLanguage();
  const [status, setStatus] = useState<Status>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [xpResult, setXpResult] = useState<
    Awaited<ReturnType<typeof saveExamAttempt>>["xpResult"]
  >();

  const c =
    language === "RU"
      ? {
          title: "Итоговый тест",
          subtitle: "Проверь прогресс по основным предметам за месяц.",
          start: "Начать тест",
          reward: "Итог после прохождения",
          sections: ["Математика", "Логика", "Чтение", "Английский"],
          question: "Вопрос",
          of: "из",
          choose: "Выберите один ответ",
          previous: "Назад",
          next: "Далее",
          finish: "Завершить тест",
          result: "Результат",
          correct: "правильно",
          backToProgress: "К прогрессу",
        }
      : language === "EN"
        ? {
            title: "Monthly Test",
            subtitle: "Check your progress across the main subjects.",
            start: "Start test",
            reward: "Result after completion",
            sections: ["Math", "Logic", "Reading", "English"],
            question: "Question",
            of: "of",
            choose: "Choose one answer",
            previous: "Previous",
            next: "Next",
            finish: "Finish test",
            result: "Result",
            correct: "correct",
            backToProgress: "Back to progress",
          }
        : {
            title: "Айлық қорытынды тест",
            subtitle: "Негізгі пәндер бойынша айлық прогресті тексер.",
            start: "Тестті бастау",
            reward: "Аяқтағаннан кейінгі нәтиже",
            sections: ["Математика", "Логика", "Оқу", "Ағылшын"],
            question: "Сұрақ",
            of: "/",
            choose: "Бір жауап таңдаңыз",
            previous: "Алдыңғы",
            next: "Келесі",
            finish: "Тестті аяқтау",
            result: "Нәтиже",
            correct: "дұрыс",
            backToProgress: "Прогресске оралу",
          };

  useDocumentTitle(`${c.title} — AI-Sana`);

  const totalQuestions = examQuestions.length;
  const currentQuestion = examQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const result = useMemo(() => {
    const questions = examQuestions.map((question) => {
      const selectedIndex = answers[question.id];
      const userAnswer = selectedIndex !== undefined ? question.options[language][selectedIndex] : "";
      const correctAnswer = question.options[language][question.answerIndex];
      return {
        id: question.id,
        sectionId: question.sectionId,
        topic: question.topic[language],
        question: question.question[language],
        userAnswer: userAnswer || "-",
        correctAnswer,
        isCorrect: selectedIndex === question.answerIndex,
        timeSpentSeconds: 0,
      };
    });
    const correctAnswers = questions.filter((question) => question.isCorrect).length;

    return {
      questions,
      correctAnswers,
      percent: totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    };
  }, [answers, language, totalQuestions]);

  const startTest = () => {
    setAnswers({});
    setCurrentIndex(0);
    setStartedAt(Date.now());
    setStatus("active");
  };

  const selectAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const finishTest = async () => {
    if (answeredCount < totalQuestions) return;
    setSaving(true);
    try {
      const totalTimeSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
      const saved = await saveExamAttempt({
        data: {
          kind: "monthly",
          examTrack: "MIXED",
          totalQuestions,
          correctAnswers: result.correctAnswers,
          percent: result.percent,
          totalTimeSeconds,
          slowQuestionIds: [],
          fastQuestionIds: [],
          questions: result.questions,
        },
      });
      setXpResult(saved.xpResult);
      notifyXpUpdated();
    } finally {
      setSaving(false);
      setStatus("finished");
    }
  };

  return (
    <GameLayout>
      {status === "intro" ? (
        <>
          <section className="overflow-hidden rounded-[36px] border-2 border-[#FACC15] bg-[#1E1B4B] p-6 text-white shadow-[0_14px_0_#0F0B2E] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FACC15]">
                  Final Challenge
                </p>
                <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">{c.title}</h1>
                <p className="mt-4 text-xl font-bold text-[#DDD6FE]">{c.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={startTest}
                    className="rounded-2xl bg-[#FACC15] px-7 py-4 font-black text-[#1E1B4B] shadow-[0_7px_0_#CA8A04]"
                  >
                    {c.start}
                  </button>
                  <Link
                    to="/progress"
                    className="rounded-2xl border-2 border-white/50 px-7 py-4 font-black text-white"
                  >
                    Progress
                  </Link>
                </div>
              </div>
              <div className="rounded-[32px] border-2 border-[#FACC15]/70 bg-white/10 p-6 text-center">
                <div className="text-8xl reward-pop">🏆</div>
                <h2 className="mt-4 text-2xl font-black">{c.reward}</h2>
                <p className="mt-2 text-[#FACC15] font-black">⭐ +100 XP</p>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-4">
            {c.sections.map((section, index) => (
              <GameCard key={section}>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#8B5CF6] text-2xl font-black text-white shadow-[0_5px_0_#5B21B6]">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-xl font-black">{section}</h3>
              </GameCard>
            ))}
          </section>
        </>
      ) : null}

      {status === "active" && currentQuestion ? (
        <GameCard className="bg-white/95">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                {currentQuestion.topic[language]}
              </p>
              <h1 className="mt-3 text-3xl font-black text-[#1E1B4B]">
                {c.question} {currentIndex + 1} {c.of} {totalQuestions}
              </h1>
            </div>
            <div className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[#6D28D9]">
                {answeredCount}/{totalQuestions}
              </p>
            </div>
          </div>

          <ProgressBar value={Math.round(((currentIndex + 1) / totalQuestions) * 100)} />

          <p className="mb-3 mt-6 text-2xl font-black text-[#1E1B4B]">
            {currentQuestion.question[language]}
          </p>
          <p className="mb-3 font-bold text-[#6B5E8F]">{c.choose}</p>

          <div className="grid gap-3">
            {currentQuestion.options[language].map((option, optionIndex) => {
              const selected = answers[currentQuestion.id] === optionIndex;
              return (
                <button
                  className={`rounded-2xl border-2 px-5 py-4 text-left font-black transition ${
                    selected
                      ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-[0_5px_0_#4C1D95]"
                      : "border-[#DDD6FE] bg-white hover:border-[#8B5CF6] hover:bg-[#F5F3FF]"
                  }`}
                  key={option}
                  onClick={() => selectAnswer(optionIndex)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row">
            <button
              className="rounded-2xl border-2 border-[#DDD6FE] px-6 py-3 font-black text-[#6D28D9] transition hover:bg-[#F5F3FF] disabled:opacity-40"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              type="button"
            >
              {c.previous}
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                className="rounded-2xl bg-[#6D28D9] px-6 py-3 font-black text-white shadow-[0_5px_0_#4C1D95] transition hover:-translate-y-0.5 disabled:opacity-40"
                disabled={answers[currentQuestion.id] === undefined}
                onClick={() => setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1))}
                type="button"
              >
                {c.next}
              </button>
            ) : (
              <button
                className="rounded-2xl bg-[#FACC15] px-6 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_#CA8A04] transition hover:-translate-y-0.5 disabled:opacity-40"
                disabled={saving || answeredCount < totalQuestions}
                onClick={() => void finishTest()}
                type="button"
              >
                {saving ? "..." : c.finish}
              </button>
            )}
          </div>
        </GameCard>
      ) : null}

      {status === "finished" ? (
        <GameCard className="bg-gradient-to-br from-white to-[#F5F3FF]">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
            {c.result}
          </p>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-black text-[#6D28D9]">{result.percent}%</span>
            <span className="pb-3 text-lg font-black text-[#6B5E8F]">
              {result.correctAnswers}/{totalQuestions} {c.correct}
            </span>
          </div>
          <XpRewardBanner xpResult={xpResult} />
          <Link
            className="mt-8 inline-flex w-full justify-center rounded-2xl bg-[#6D28D9] px-6 py-3 text-center font-black text-white shadow-[0_5px_0_#4C1D95] sm:w-auto"
            to="/progress"
          >
            {c.backToProgress}
          </Link>
        </GameCard>
      ) : null}
    </GameLayout>
  );
}
