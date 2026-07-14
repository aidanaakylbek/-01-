import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AIReviewPanel } from "@/components/ai-review-panel";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { diagnosticQuestions } from "@/data/diagnostic-questions";
import { useLanguage } from "@/hooks/use-language";
import { saveDiagnosticResult } from "@/lib/api/account.functions";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Find Your Level — AI-Sana" },
      {
        name: "description",
        content:
          "Take the AI-Sana diagnostic to find your level across NIS, BIL, and NSPM subjects.",
      },
    ],
  }),
  component: Diagnostic,
});

type TestStatus = "intro" | "active" | "finished";
type AnswerMap = Record<string, string>;

const copy = {
  EN: {
    back: "Go back",
    tracksLabel: "NIS • BIL • NSPM",
    progress: "Diagnostic Progress",
    introTitle: "Find Your Level",
    introDesc:
      "Answer a few mixed questions. After the test, AI will explain your mistakes and show what to practice next.",
    start: "Start Diagnostic Test",
    time: "About 5 minutes",
    question: "Question",
    of: "of",
    previous: "Previous",
    next: "Next",
    finish: "Finish test",
    choose: "Choose one answer",
    resultTitle: "Diagnostic result",
    correct: "correct",
    retry: "Try again",
    home: "Go to dashboard",
    review: "Get full AI review",
    pricing: "View pricing plans",
    strong: "Good start. Now check the AI review to understand every mistake.",
    weakTopics: "Topics to improve",
  },
  KZ: {
    back: "Артқа оралу",
    tracksLabel: "НЗМ • БИЛ • РФММ",
    progress: "Диагностика прогресі",
    introTitle: "Өз деңгейіңізді анықтаңыз",
    introDesc:
      "Бірнеше аралас сұраққа жауап беріңіз. Тесттен кейін AI қателеріңізді түсіндіріп, келесі не оқу керегін көрсетеді.",
    start: "Диагностикалық тестті бастау",
    time: "Шамамен 5 минут",
    question: "Сұрақ",
    of: "/",
    previous: "Алдыңғы",
    next: "Келесі",
    finish: "Тестті аяқтау",
    choose: "Бір жауап таңдаңыз",
    resultTitle: "Диагностика нәтижесі",
    correct: "дұрыс",
    retry: "Қайта өту",
    home: "Дашбордқа өту",
    review: "Толық AI разбор алу",
    pricing: "Тариф таңдау",
    strong: "Жақсы бастама. Енді әр қатені түсіну үшін AI разборды қараңыз.",
    weakTopics: "Жақсартатын тақырыптар",
  },
  RU: {
    back: "Вернуться назад",
    tracksLabel: "НИШ • БИЛ • РФМШ",
    progress: "Прогресс диагностики",
    introTitle: "Определите свой уровень",
    introDesc:
      "Ответьте на несколько смешанных вопросов. После теста AI объяснит ошибки и покажет, что повторить дальше.",
    start: "Начать диагностический тест",
    time: "Около 5 минут",
    question: "Вопрос",
    of: "из",
    previous: "Назад",
    next: "Далее",
    finish: "Завершить тест",
    choose: "Выберите один ответ",
    resultTitle: "Результат диагностики",
    correct: "правильно",
    retry: "Пройти снова",
    home: "Перейти в дашборд",
    review: "Получить полный AI-разбор",
    pricing: "Выбрать тариф",
    strong: "Хорошее начало. Теперь посмотрите AI-разбор, чтобы понять каждую ошибку.",
    weakTopics: "Темы для улучшения",
  },
};

function Diagnostic() {
  const { language } = useLanguage();
  const c = copy[language];
  const [status, setStatus] = useState<TestStatus>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const currentQuestion = diagnosticQuestions[currentIndex];
  const totalQuestions = diagnosticQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress =
    status === "finished"
      ? 100
      : status === "active"
        ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
        : 0;

  const result = useMemo(() => {
    const attempts = diagnosticQuestions.map((question) => {
      const userAnswer = answers[question.id] ?? "";
      const correctAnswer = question.correctAnswer[language];

      return {
        question: question.question[language],
        userAnswer: userAnswer || "-",
        correctAnswer,
        isCorrect: userAnswer === correctAnswer,
        topic: question.topic,
        explanation: question.explanation[language],
      };
    });
    const correctAnswers = attempts.filter((attempt) => attempt.isCorrect).length;
    const weakTopics = Array.from(
      new Set(
        attempts
          .filter((attempt) => !attempt.isCorrect)
          .map((attempt) => attempt.topic)
          .filter(Boolean),
      ),
    );

    return {
      attempts,
      correctAnswers,
      score: Math.round((correctAnswers / totalQuestions) * 100),
      weakTopics,
    };
  }, [answers, language, totalQuestions]);

  const startTest = () => {
    setAnswers({});
    setCurrentIndex(0);
    setStatus("active");
  };

  const selectAnswer = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const finishTest = () => {
    if (answeredCount < totalQuestions) return;
    void saveDiagnosticResult({
      data: {
        score: result.score,
        weakTopics: result.weakTopics,
      },
    });
    setStatus("finished");
  };

  return (
    <GameLayout>
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-[#6D28D9] shadow-[0_5px_0_rgba(109,40,217,0.12)] transition hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {c.back}
          </Link>
        </div>

        <GameCard className="bg-white/95">
          <div className="flex items-end justify-between">
            <span className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
              {c.progress}
            </span>
            <span className="font-black text-[#6D28D9]">{progress}%</span>
          </div>
          <ProgressBar value={Math.max(progress, status === "intro" ? 5 : progress)} />
        </GameCard>

        {status === "intro" && (
          <section className="grid items-stretch gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <GameCard className="flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                {c.tracksLabel}
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                {c.introTitle}
              </h1>
              <p className="mt-5 max-w-xl text-lg font-semibold text-[#EDE9FE]">
                {c.introDesc}
              </p>
              <button
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FACC15] px-8 py-4 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] transition hover:-translate-y-0.5 sm:w-auto"
                onClick={startTest}
                type="button"
              >
                {c.start}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <p className="mt-4 text-sm font-bold text-[#EDE9FE]">{c.time}</p>
            </GameCard>

            <GameCard className="flex flex-col gap-4">
              {diagnosticQuestions.map((question, index) => (
                <div
                  className="flex items-center gap-4 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4"
                  key={question.id}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6D28D9] font-black text-white shadow-[0_4px_0_#4C1D95]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                      {question.exam}
                    </p>
                    <p className="font-black text-[#1E1B4B]">{question.topic}</p>
                  </div>
                </div>
              ))}
            </GameCard>
          </section>
        )}

        {status === "active" && currentQuestion && (
          <GameCard className="bg-white/95">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                  {currentQuestion.exam} • {currentQuestion.topic}
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

            <p className="mb-6 text-2xl font-black text-[#1E1B4B]">
              {currentQuestion.question[language]}
            </p>
            <p className="mb-3 font-bold text-[#6B5E8F]">{c.choose}</p>

            <div className="grid gap-3">
              {currentQuestion.options[language].map((option) => {
                const selected = answers[currentQuestion.id] === option;
                return (
                  <button
                    className={`rounded-2xl border-2 px-5 py-4 text-left font-black transition ${
                      selected
                        ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-[0_5px_0_#4C1D95]"
                        : "border-[#DDD6FE] bg-white hover:border-[#8B5CF6] hover:bg-[#F5F3FF]"
                    }`}
                    key={option}
                    onClick={() => selectAnswer(option)}
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
                  disabled={!answers[currentQuestion.id]}
                  onClick={() =>
                    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1))
                  }
                  type="button"
                >
                  {c.next}
                </button>
              ) : (
                <button
                  className="rounded-2xl bg-[#FACC15] px-6 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_#CA8A04] transition hover:-translate-y-0.5 disabled:opacity-40"
                  disabled={answeredCount < totalQuestions}
                  onClick={finishTest}
                  type="button"
                >
                  {c.finish}
                </button>
              )}
            </div>
          </GameCard>
        )}

        {status === "finished" && (
          <section className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <GameCard className="bg-gradient-to-br from-white to-[#F5F3FF]">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                {c.resultTitle}
              </p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-[#6D28D9]">
                  {result.score}%
                </span>
                <span className="pb-3 text-lg font-black text-[#6B5E8F]">
                  {result.correctAnswers}/{totalQuestions} {c.correct}
                </span>
              </div>
              <p className="mt-5 font-semibold text-[#6B5E8F]">{c.strong}</p>

              {result.weakTopics.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                    {c.weakTopics}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.weakTopics.map((topic) => (
                      <span
                        className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-3 py-2 font-black text-[#1E1B4B]"
                        key={topic}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3">
                <button
                  className="w-full rounded-2xl border-2 border-[#DDD6FE] px-6 py-3 font-black text-[#6D28D9] transition hover:bg-[#F5F3FF]"
                  onClick={startTest}
                  type="button"
                >
                  {c.retry}
                </button>
                <Link
                  className="w-full rounded-2xl bg-[#6D28D9] px-6 py-3 text-center font-black text-white shadow-[0_5px_0_#4C1D95]"
                  to="/pricing"
                >
                  {c.pricing}
                </Link>
              </div>
            </GameCard>

            <AIReviewPanel
              buttonLabel={c.review}
              payload={{
                taskTitle: c.resultTitle,
                taskType: "diagnostic",
                subject: "NIS/BIL/NSPM",
                score: result.score,
                totalQuestions,
                correctAnswers: result.correctAnswers,
                weakTopics: result.weakTopics,
                attempts: result.attempts,
                language,
              }}
            />
          </section>
        )}
      </div>
    </GameLayout>
  );
}


