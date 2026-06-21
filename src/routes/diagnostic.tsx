import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AIReviewPanel } from "@/components/ai-review-panel";
import { Navbar } from "@/components/navbar";
import { diagnosticQuestions } from "@/data/diagnostic-questions";
import { useLanguage } from "@/hooks/use-language";

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
    strong: "Good start. Now check the AI review to understand every mistake.",
    weakTopics: "Topics to improve",
  },
  KZ: {
    back: "Артқа оралу",
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
    strong: "Жақсы бастама. Енді әр қатені түсіну үшін AI разборды қараңыз.",
    weakTopics: "Жақсартатын тақырыптар",
  },
  RU: {
    back: "Вернуться назад",
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
    setStatus("finished");
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md text-body-md">
      <Navbar />

      <main className="w-full max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <div className="w-full flex justify-start mb-4">
          <Link
            to="/"
            className="text-on-surface-variant flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-variant transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {c.back}
          </Link>
        </div>

        <div className="w-full mb-stack-lg">
          <div className="flex justify-between items-end mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              {c.progress}
            </span>
            <span className="font-label-md text-label-md text-primary font-bold">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progress, status === "intro" ? 5 : progress)}%` }}
            />
          </div>
        </div>

        {status === "intro" && (
          <section className="grid gap-gutter lg:grid-cols-[1.1fr_0.9fr] items-stretch">
            <div className="bg-surface-container-highest border border-outline-variant rounded-tr-[48px] rounded-bl-[48px] p-8 md:p-10 flex flex-col justify-center">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary mb-4">
                NIS • BIL • NSPM
              </p>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary">
                {c.introTitle}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-5 max-w-xl">
                {c.introDesc}
              </p>
              <button
                className="mt-8 w-full sm:w-auto bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary btn-squish transition-colors flex items-center justify-center gap-2"
                onClick={startTest}
                type="button"
              >
                {c.start}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-4">{c.time}</p>
            </div>

            <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 flex flex-col gap-4">
              {diagnosticQuestions.map((question, index) => (
                <div
                  className="flex items-center gap-4 border border-outline-variant bg-surface p-4"
                  key={question.id}
                >
                  <span className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center font-label-md">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      {question.exam}
                    </p>
                    <p className="font-title-md text-title-md text-primary">{question.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {status === "active" && currentQuestion && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-tr-[48px] rounded-bl-[48px] p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
              <div>
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                  {currentQuestion.exam} • {currentQuestion.topic}
                </p>
                <h1 className="font-headline-md text-headline-md text-primary mt-3">
                  {c.question} {currentIndex + 1} {c.of} {totalQuestions}
                </h1>
              </div>
              <div className="border border-outline-variant bg-surface px-4 py-3 text-center">
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  {answeredCount}/{totalQuestions}
                </p>
              </div>
            </div>

            <p className="font-headline-sm text-headline-sm text-on-background mb-6">
              {currentQuestion.question[language]}
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant mb-3">{c.choose}</p>

            <div className="grid gap-3">
              {currentQuestion.options[language].map((option) => {
                const selected = answers[currentQuestion.id] === option;
                return (
                  <button
                    className={`text-left border px-5 py-4 font-title-md text-title-md transition-colors ${
                      selected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-surface hover:border-primary hover:bg-primary-container hover:text-on-primary-container"
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

            <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8">
              <button
                className="px-6 py-3 border border-outline-variant text-primary font-label-caps text-label-caps uppercase tracking-widest disabled:opacity-40 hover:border-primary transition-colors"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                type="button"
              >
                {c.previous}
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  className="px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-widest disabled:opacity-40 hover:bg-secondary transition-colors"
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
                  className="px-6 py-3 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest disabled:opacity-40 hover:bg-primary transition-colors"
                  disabled={answeredCount < totalQuestions}
                  onClick={finishTest}
                  type="button"
                >
                  {c.finish}
                </button>
              )}
            </div>
          </section>
        )}

        {status === "finished" && (
          <section className="grid gap-gutter lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div className="bg-surface-container-highest border border-outline-variant rounded-tr-[48px] rounded-bl-[48px] p-8">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary mb-3">
                {c.resultTitle}
              </p>
              <div className="flex items-end gap-3">
                <span className="font-headline-lg text-headline-lg text-primary">
                  {result.score}%
                </span>
                <span className="font-title-md text-title-md text-on-surface-variant pb-3">
                  {result.correctAnswers}/{totalQuestions} {c.correct}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-5">{c.strong}</p>

              {result.weakTopics.length > 0 && (
                <div className="mt-6">
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary mb-3">
                    {c.weakTopics}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.weakTopics.map((topic) => (
                      <span
                        className="border border-outline-variant bg-surface px-3 py-2 font-label-md text-label-md"
                        key={topic}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-8">
                <button
                  className="w-full border border-primary text-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-container transition-colors"
                  onClick={startTest}
                  type="button"
                >
                  {c.retry}
                </button>
                <Link
                  className="w-full bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-center hover:bg-secondary transition-colors"
                  to="/home"
                >
                  {c.home}
                </Link>
              </div>
            </div>

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
      </main>
    </div>
  );
}
