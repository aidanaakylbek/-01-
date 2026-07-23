import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AIReviewPanel } from "@/components/ai-review-panel";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { diagnosticQuestions } from "@/data/diagnostic-questions";
import { nisDiagnosticQuestions } from "@/data/nis-diagnostic-questions";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard, saveDiagnosticResult } from "@/lib/api/account.functions";
import {
  DIAGNOSTIC_VERSION,
  analyzeDiagnosticAttempts,
  buildDiagnosticAttemptSnapshot,
} from "@/lib/diagnostic-analysis";

export const Route = createFileRoute("/diagnostic")({
  loader: async () => getAccountDashboard(),
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
type DiagnosticTrack = "NIS" | "BIL" | "RFMS";

const copy = {
  EN: {
    back: "Go back",
    tracksLabel: "NIS • BIL • NSPM",
    selectTrack: "Choose diagnostic type",
    trackHint: "Each test checks the skills needed for that entrance exam.",
    trackNames: {
      NIS: "NIS",
      BIL: "BIL",
      RFMS: "RFMS",
    },
    trackDescriptions: {
      NIS: "Math, logic and reading skills for NIS preparation.",
      BIL: "Reading literacy, English and reasoning for BIL.",
      RFMS: "Stronger math and logic for RFMS entrance preparation.",
    },
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
    alreadyDone: "Diagnostic is already complete",
    resultAction: "View diagnostic result",
    review: "Get full AI review",
    pricing: "View pricing plans",
    strong: "Good start. Now check the AI review to understand every mistake.",
    weakTopics: "Topics to improve",
  },
  KZ: {
    back: "Артқа оралу",
    tracksLabel: "НЗМ • БИЛ • РФММ",
    selectTrack: "Диагностика түрін таңдаңыз",
    trackHint: "Әр тест сол емтиханға керек негізгі дағдыларды тексереді.",
    trackNames: {
      NIS: "НЗМ",
      BIL: "БИЛ",
      RFMS: "РФММ",
    },
    trackDescriptions: {
      NIS: "НЗМ-ге керек математика, логика және оқу дағдылары.",
      BIL: "БИЛ үшін оқу сауаттылығы, ағылшын және ойлау қабілеті.",
      RFMS: "РФММ-ге керек тереңірек математика және логика.",
    },
    progress: "Диагностика прогресі",
    introTitle: "Алдымен деңгейіңізді анықтайық",
    introDesc: "Бұл бір реттік диагностика оқу жоспарын сіздің деңгейіңізге бейімдеу үшін қажет.",
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
    alreadyDone: "Диагностика аяқталған",
    resultAction: "Нәтижені көру",
    review: "Толық AI разбор алу",
    pricing: "Тариф таңдау",
    strong: "Жақсы бастама. Енді әр қатені түсіну үшін AI разборды қараңыз.",
    weakTopics: "Жақсартатын тақырыптар",
  },
  RU: {
    back: "Вернуться назад",
    tracksLabel: "НИШ • БИЛ • РФМШ",
    selectTrack: "Выберите тип диагностики",
    trackHint: "Каждый тест проверяет навыки, нужные именно для этого экзамена.",
    trackNames: {
      NIS: "НИШ",
      BIL: "БИЛ",
      RFMS: "РФМШ",
    },
    trackDescriptions: {
      NIS: "Математика, логика и чтение для подготовки к НИШ.",
      BIL: "Читательская грамотность, английский и логика для БИЛ.",
      RFMS: "Более сильная математика и логика для РФМШ.",
    },
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
    alreadyDone: "Диагностика уже завершена",
    resultAction: "Посмотреть результат",
    review: "Получить полный AI-разбор",
    pricing: "Выбрать тариф",
    strong: "Хорошее начало. Теперь посмотрите AI-разбор, чтобы понять каждую ошибку.",
    weakTopics: "Темы для улучшения",
  },
};

const diagnosticTracks: DiagnosticTrack[] = ["NIS", "BIL", "RFMS"];
const diagnosticQuestionImages: Record<string, string> = {
  "nis-full-math-03": "/diagnostic-images/nis-coordinate-points.svg",
  "nis-full-math-06": "/diagnostic-images/nis-ring.svg",
  "nis-full-math-07": "/diagnostic-images/nis-four-squares.svg",
  "nis-full-math-09": "/diagnostic-images/nis-tiles-square.svg",
  "nis-full-math-22": "/diagnostic-images/nis-mixture-pie.svg",
  "nis-full-math-29": "/diagnostic-images/nis-inequality-lines.svg",
  "nis-full-math-30": "/diagnostic-images/nis-opposite-numbers.svg",
  "nis-full-quant-31": "/diagnostic-images/nis-routes.svg",
  "nis-full-quant-34": "/diagnostic-images/nis-area-shapes.svg",
  "nis-full-quant-52": "/diagnostic-images/nis-solids.svg",
  "nis-full-quant-59": "/diagnostic-images/nis-class-chart.svg",
  "nis-full-science-05": "/diagnostic-images/nis-cell.svg",
  "nis-full-science-17": "/diagnostic-images/nis-water-graph.svg",
};
const questionsCountByTrack = diagnosticTracks.reduce(
  (counts, track) => ({
    ...counts,
    [track]:
      track === "NIS"
        ? nisDiagnosticQuestions.length
        : diagnosticQuestions.filter((question) => question.exam === track).length,
  }),
  {} as Record<DiagnosticTrack, number>,
);

function Diagnostic() {
  const dashboard = Route.useLoaderData();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const c = copy[language];
  const [status, setStatus] = useState<TestStatus>("intro");
  const [selectedTrack, setSelectedTrack] = useState<DiagnosticTrack>("NIS");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [startedAt, setStartedAt] = useState<string | undefined>();

  useEffect(() => {
    if (dashboard.account.diagnosticCompleted) {
      void navigate({ to: "/diagnostic-result", replace: true });
    }
  }, [dashboard.account.diagnosticCompleted, navigate]);

  const questions = useMemo(
    () =>
      selectedTrack === "NIS"
        ? nisDiagnosticQuestions
        : diagnosticQuestions.filter((question) => question.exam === selectedTrack),
    [selectedTrack],
  );
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress =
    status === "finished"
      ? 100
      : status === "active"
        ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
        : 0;

  const result = useMemo(() => {
    const attempts = questions.map((question) => {
      const userAnswer = answers[question.id] ?? "";
      return buildDiagnosticAttemptSnapshot(question, userAnswer, language);
    });
    const correctAnswers = attempts.filter((attempt) => attempt.isCorrect).length;
    const analysis = analyzeDiagnosticAttempts(attempts);

    return {
      ...analysis,
      attempts,
      correctAnswers,
      score: Math.round((correctAnswers / totalQuestions) * 100),
    };
  }, [answers, language, questions, totalQuestions]);

  const startTest = () => {
    setAnswers({});
    setCurrentIndex(0);
    setStartedAt(new Date().toISOString());
    setStatus("active");
  };

  const selectAnswer = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const finishTest = async () => {
    if (answeredCount < totalQuestions) return;
    const completedAt = new Date().toISOString();
    await saveDiagnosticResult({
      data: {
        aiRecommendation: result.aiRecommendation,
        assignedLevel: result.assignedLevel,
        attempts: result.attempts,
        completedAt,
        diagnosticVersion: DIAGNOSTIC_VERSION,
        recommendedStartingLesson: result.recommendedStartingLesson,
        score: result.score,
        startedAt,
        strongTopics: result.strongTopics,
        subjectLevels: result.subjectLevels,
        subjectScores: result.subjectScores,
        topicScores: result.topicScores,
        weakTopics: result.weakTopics,
      },
    });
    await navigate({ to: "/diagnostic-result" });
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
              <h1 className="mt-3 text-4xl font-black md:text-6xl">{c.introTitle}</h1>
              <p className="mt-5 max-w-xl text-lg font-semibold text-[#EDE9FE]">{c.introDesc}</p>
              <div className="mt-7 rounded-[28px] border-2 border-white/25 bg-white/10 p-4">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FACC15]">
                  {c.selectTrack}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#EDE9FE]">{c.trackHint}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {diagnosticTracks.map((track) => {
                    const active = selectedTrack === track;
                    return (
                      <button
                        className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                          active
                            ? "border-[#FACC15] bg-[#FACC15] text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]"
                            : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                        }`}
                        key={track}
                        onClick={() => setSelectedTrack(track)}
                        type="button"
                      >
                        <span className="block text-xl font-black">{c.trackNames[track]}</span>
                        <span className="mt-1 block text-xs font-bold opacity-85">
                          {questionsCountByTrack[track]} сұрақ
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
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
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                  {c.trackNames[selectedTrack]}
                </p>
                <p className="mt-1 font-semibold text-[#6B5E8F]">
                  {c.trackDescriptions[selectedTrack]}
                </p>
              </div>
              {questions.map((question, index) => (
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
            {diagnosticQuestionImages[currentQuestion.id] && (
              <div className="mb-6 overflow-hidden rounded-[28px] border-2 border-[#DDD6FE] bg-[#F5F3FF] p-3">
                <img
                  alt={currentQuestion.topic}
                  className="mx-auto max-h-[360px] w-full max-w-3xl rounded-3xl object-contain"
                  src={diagnosticQuestionImages[currentQuestion.id]}
                />
              </div>
            )}
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
                  onClick={() => void finishTest()}
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
                <span className="text-6xl font-black text-[#6D28D9]">{result.score}%</span>
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
                <Link
                  className="w-full rounded-2xl bg-[#6D28D9] px-6 py-3 text-center font-black text-white shadow-[0_5px_0_#4C1D95]"
                  to="/diagnostic-result"
                >
                  {c.resultAction}
                </Link>
              </div>
            </GameCard>

            <AIReviewPanel
              buttonLabel={c.review}
              payload={{
                taskTitle: c.resultTitle,
                taskType: "diagnostic",
                subject: "NIS/BIL/NSPM",
                exam: selectedTrack,
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
