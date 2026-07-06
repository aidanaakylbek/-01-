import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { examQuestions, examSections } from "@/data/exam-simulator";
import { useLanguage } from "@/hooks/use-language";
import { saveExamAttempt } from "@/lib/api/account.functions";

export const Route = createFileRoute("/exam")({
  head: () => ({
    meta: [
      { title: "Exam Simulator — AI-Sana" },
      { name: "description", content: "Timed NIS, BIL and NSPM exam simulator." },
    ],
  }),
  component: ExamSimulator,
});

type Status = "intro" | "active" | "finished";

const LIMIT_SECONDS = 15 * 60;
const FAST_SECONDS = 5;
const SLOW_SECONDS = 75;

function ExamSimulator() {
  const { language } = useLanguage();
  const c = copy[language];
  const [status, setStatus] = useState<Status>("intro");
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(LIMIT_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeByQuestion, setTimeByQuestion] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const openedAtRef = useRef(Date.now());
  const current = examQuestions[index];

  const result = useMemo(() => {
    const questions = examQuestions.map((question) => {
      const selected = answers[question.id];
      return {
        id: question.id,
        sectionId: question.sectionId,
        topic: question.topic[language],
        question: question.question[language],
        userAnswer:
          selected == null ? "-" : (question.options[language][selected] ?? "-"),
        correctAnswer: question.options[language][question.answerIndex],
        isCorrect: selected === question.answerIndex,
        timeSpentSeconds: timeByQuestion[question.id] ?? 0,
      };
    });
    const correctAnswers = questions.filter((question) => question.isCorrect).length;
    const percent = Math.round((correctAnswers / examQuestions.length) * 100);
    return {
      questions,
      correctAnswers,
      percent,
      totalTimeSeconds: LIMIT_SECONDS - secondsLeft,
      slowQuestionIds: questions
        .filter((question) => question.timeSpentSeconds >= SLOW_SECONDS)
        .map((question) => question.id),
      fastQuestionIds: questions
        .filter((question) => question.timeSpentSeconds > 0 && question.timeSpentSeconds <= FAST_SECONDS)
        .map((question) => question.id),
    };
  }, [answers, language, secondsLeft, timeByQuestion]);

  useEffect(() => {
    if (status !== "active") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          finish();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const recordTime = () => {
    if (!current) return;
    const spent = Math.max(1, Math.round((Date.now() - openedAtRef.current) / 1000));
    setTimeByQuestion((prev) => ({
      ...prev,
      [current.id]: (prev[current.id] ?? 0) + spent,
    }));
  };

  const goTo = (nextIndex: number) => {
    recordTime();
    setIndex(nextIndex);
    openedAtRef.current = Date.now();
  };

  const start = () => {
    setStatus("active");
    setIndex(0);
    setSecondsLeft(LIMIT_SECONDS);
    setAnswers({});
    setTimeByQuestion({});
    setSaved(false);
    openedAtRef.current = Date.now();
  };

  const finish = async () => {
    recordTime();
    setStatus("finished");
  };

  useEffect(() => {
    if (status !== "finished" || saved) return;
    setSaved(true);
    void saveExamAttempt({
      data: {
        examTrack: "MIXED",
        totalQuestions: examQuestions.length,
        correctAnswers: result.correctAnswers,
        percent: result.percent,
        totalTimeSeconds: result.totalTimeSeconds,
        slowQuestionIds: result.slowQuestionIds,
        fastQuestionIds: result.fastQuestionIds,
        questions: result.questions,
      },
    }).catch(() => {
      setSaved(false);
    });
  }, [result, saved, status]);

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-container-padding-mobile py-stack-lg md:px-container-padding-desktop">
        <Link className="text-on-surface-variant hover:text-primary" to="/home">
          ← {c.back}
        </Link>

        {status === "intro" ? (
          <section className="mt-stack-md grid gap-gutter lg:grid-cols-[1fr_420px]">
            <div className="border border-outline-variant bg-surface-container-lowest p-8 shadow-[12px_12px_0_var(--secondary-container)]">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                NIS · BIL · NSPM
              </p>
              <h1 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
                {c.title}
              </h1>
              <p className="mt-4 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
                {c.desc}
              </p>
              <button
                className="mt-8 bg-secondary px-7 py-4 font-label-caps text-label-caps uppercase tracking-widest text-on-secondary hover:bg-primary"
                onClick={start}
                type="button"
              >
                {c.start}
              </button>
            </div>
            <div className="grid gap-3">
              {examSections.map((section) => (
                <div className="border border-outline-variant bg-surface p-5" key={section.id}>
                  <span className="material-symbols-outlined text-secondary">{section.icon}</span>
                  <h2 className="mt-2 font-title-lg text-title-lg text-primary">
                    {section.title[language]}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {section.questions.length} {c.questions}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {status === "active" && current ? (
          <section className="mt-stack-md grid gap-gutter lg:grid-cols-[280px_1fr]">
            <aside className="border border-outline-variant bg-surface p-5">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {c.timer}
              </p>
              <p className="mt-2 font-headline-md text-headline-md text-primary">
                {formatTime(secondsLeft)}
              </p>
              <div className="mt-6 grid grid-cols-5 gap-2">
                {examQuestions.map((question, questionIndex) => (
                  <button
                    className={`h-10 border font-label-md ${
                      questionIndex === index
                        ? "border-secondary bg-secondary text-on-secondary"
                        : answers[question.id] != null
                          ? "border-primary bg-primary-container text-on-primary-container"
                          : "border-outline-variant"
                    }`}
                    key={question.id}
                    onClick={() => goTo(questionIndex)}
                    type="button"
                  >
                    {questionIndex + 1}
                  </button>
                ))}
              </div>
            </aside>

            <article className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {examSections.find((section) => section.id === current.sectionId)?.title[language]} ·{" "}
                {current.topic[language]}
              </p>
              <h1 className="mt-3 font-headline-sm text-headline-sm text-primary">
                {index + 1}. {current.question[language]}
              </h1>
              <div className="mt-6 grid gap-3">
                {current.options[language].map((option, optionIndex) => (
                  <button
                    className={`border p-4 text-left font-body-md text-body-md ${
                      answers[current.id] === optionIndex
                        ? "border-secondary bg-secondary-container"
                        : "border-outline-variant bg-surface hover:border-secondary"
                    }`}
                    key={option}
                    onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))}
                    type="button"
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  className="border border-outline-variant px-5 py-3 disabled:opacity-40"
                  disabled={index === 0}
                  onClick={() => goTo(index - 1)}
                  type="button"
                >
                  {c.prev}
                </button>
                {index < examQuestions.length - 1 ? (
                  <button
                    className="bg-secondary px-5 py-3 text-on-secondary"
                    onClick={() => goTo(index + 1)}
                    type="button"
                  >
                    {c.next}
                  </button>
                ) : (
                  <button className="bg-primary px-5 py-3 text-on-primary" onClick={finish} type="button">
                    {c.finish}
                  </button>
                )}
              </div>
            </article>
          </section>
        ) : null}

        {status === "finished" ? (
          <section className="mt-stack-md grid gap-gutter lg:grid-cols-[360px_1fr]">
            <div className="border border-secondary bg-secondary-container p-6">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {c.result}
              </p>
              <p className="mt-4 font-display-lg text-display-lg text-primary">{result.percent}%</p>
              <p className="font-title-md text-title-md">
                {result.correctAnswers}/{examQuestions.length} {c.correct}
              </p>
              <p className="mt-3 text-on-surface-variant">
                {c.totalTime}: {formatTime(result.totalTimeSeconds)}
              </p>
              <button className="mt-6 border border-primary px-5 py-3" onClick={start} type="button">
                {c.retry}
              </button>
            </div>
            <div className="space-y-4">
              {result.questions.map((question) => (
                <div className="border border-outline-variant bg-surface p-5" key={question.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-title-md text-title-md text-primary">{question.question}</h2>
                    <span className={question.isCorrect ? "text-green-700" : "text-red-700"}>
                      {question.isCorrect ? c.right : c.wrong}
                    </span>
                  </div>
                  <p className="mt-2 text-on-surface-variant">
                    {c.yourAnswer}: {question.userAnswer} · {c.correctAnswer}: {question.correctAnswer}
                  </p>
                  <p className="mt-1 text-on-surface-variant">
                    {c.timeSpent}: {question.timeSpentSeconds}s{" "}
                    {result.slowQuestionIds.includes(question.id) ? `· ${c.tooSlow}` : ""}
                    {result.fastQuestionIds.includes(question.id) ? `· ${c.tooFast}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

const copy = {
  EN: {
    back: "Back",
    title: "Exam simulator",
    desc: "A timed mixed test with sections, per-question timing, and a full result breakdown.",
    start: "Start exam",
    questions: "questions",
    timer: "Timer",
    prev: "Previous",
    next: "Next",
    finish: "Finish",
    result: "Result",
    correct: "correct",
    totalTime: "Total time",
    retry: "Try again",
    right: "Correct",
    wrong: "Wrong",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    timeSpent: "Time spent",
    tooSlow: "too long",
    tooFast: "maybe guessed",
  },
  KZ: {
    back: "Артқа",
    title: "Емтихан симуляторы",
    desc: "Уақытпен өтетін аралас тест: секциялар, әр сұраққа кеткен уақыт және толық нәтиже.",
    start: "Емтиханды бастау",
    questions: "сұрақ",
    timer: "Таймер",
    prev: "Алдыңғы",
    next: "Келесі",
    finish: "Аяқтау",
    result: "Нәтиже",
    correct: "дұрыс",
    totalTime: "Жалпы уақыт",
    retry: "Қайта өту",
    right: "Дұрыс",
    wrong: "Қате",
    yourAnswer: "Сенің жауабың",
    correctAnswer: "Дұрыс жауап",
    timeSpent: "Кеткен уақыт",
    tooSlow: "тым ұзақ",
    tooFast: "болжау болуы мүмкін",
  },
  RU: {
    back: "Назад",
    title: "Симулятор экзамена",
    desc: "Тест по времени с секциями, временем на каждый вопрос и полным разбором результата.",
    start: "Начать экзамен",
    questions: "вопросов",
    timer: "Таймер",
    prev: "Назад",
    next: "Далее",
    finish: "Завершить",
    result: "Результат",
    correct: "правильно",
    totalTime: "Общее время",
    retry: "Пройти снова",
    right: "Правильно",
    wrong: "Ошибка",
    yourAnswer: "Ваш ответ",
    correctAnswer: "Правильный ответ",
    timeSpent: "Время",
    tooSlow: "слишком долго",
    tooFast: "похоже на угадывание",
  },
};
