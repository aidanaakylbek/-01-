import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameCard, GameLayout, ProgressBar, RightWidgets } from "@/components/gamified-platform";
import aiSanaPoster from "@/assets/ai-sana-hero.jpg";
import aiSanaAnimated from "@/assets/ai-sana-animated.mp4";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { DashboardAccount } from "@/lib/account-store.server";
import {
  generateAdaptiveLearningPath,
  type AdaptiveLearningPathStep,
} from "@/lib/adaptive-learning-path";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI-Sana — Gamified Exam Preparation" },
      {
        name: "description",
        content: "AI-Sana is a purple AI-powered learning game for NIS, BIL and RFMS exams.",
      },
    ],
  }),
  component: Dashboard,
});

export function Dashboard() {
  const { language } = useLanguage();
  const [dashboard, setDashboard] = useState<DashboardAccount | null>(null);

  useEffect(() => {
    let mounted = true;

    void getAccountDashboard()
      .then((data) => {
        if (mounted) {
          setDashboard(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setDashboard(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const completedLessons = dashboard?.completedLessons ?? 0;
  const xpToday = completedLessons > 0 ? completedLessons * 40 : 0;
  const adaptivePath = dashboard
    ? generateAdaptiveLearningPath(dashboard.account, dashboard.examAttempts)
    : null;
  const learningSteps = adaptivePath?.steps ?? [];
  const currentLessonHref =
    adaptivePath?.nextHref ?? (completedLessons > 0 ? "/plan" : "/diagnostic");
  const c =
    language === "RU"
      ? {
          titleLines: ["Платформа подготовки", "к НИШ, БИЛ и РФМШ"],
          subtitle: "AI Tutor, личный план и ежедневные задания помогают двигаться к цели.",
          coach: "Сегодня пройди 3 урока. Еще 2 вопроса осталось!",
          start: "Начать текущий урок",
          ready: "Ты готов к следующему уровню!",
          pathEyebrow: "AI-Sana path",
          pathTitle: "Личный учебный путь",
          pathFallback: "Завершите диагностику, и AI-Sana построит ваш персональный план.",
          pathReady: "AI-план готов",
          diagnosticFirst: "Сначала диагностика",
          stepLabel: "Шаг",
          lockedLabel: "Закрыто",
          completedLabel: "✓ Завершено",
          currentLabel: "Сейчас",
          practiceLabel: "Практика",
          testLabel: "Тест",
          lessonsLabel: "урок",
        }
      : language === "EN"
        ? {
            titleLines: ["NIS, BIL and RFMS", "preparation platform"],
            subtitle: "AI Tutor, a personal plan and daily tasks help you move toward your goal.",
            coach: "Complete 3 lessons today. Only 2 questions left!",
            start: "Start current lesson",
            ready: "You are ready for the next level!",
            pathEyebrow: "AI-Sana path",
            pathTitle: "Personal learning path",
            pathFallback: "Finish the diagnostic test and AI-Sana will build your personal plan.",
            pathReady: "AI plan ready",
            diagnosticFirst: "Diagnostic first",
            stepLabel: "Step",
            lockedLabel: "Locked",
            completedLabel: "✓ Completed",
            currentLabel: "Current",
            practiceLabel: "Practice",
            testLabel: "Topic Test",
            lessonsLabel: "lesson",
          }
        : {
            titleLines: ["НЗМ, БИЛ және РФММ-ға", "дайындық платформасы"],
            subtitle:
              "AI Tutor, жеке оқу жоспары және күнделікті тапсырмалар арқылы мақсатыңа жақында.",
            coach: "Бүгін 3 сабақ өт! Тағы 2 сұрақ қалды!",
            start: "Қазіргі сабақты бастау",
            ready: "Келесі деңгейге дайынсың!",
            pathEyebrow: "AI-Sana path",
            pathTitle: "Жеке оқу жолың",
            pathFallback: "Диагностиканы аяқтағаннан кейін AI-Sana жеке оқу жолын құрады.",
            pathReady: "AI жоспар дайын",
            diagnosticFirst: "Алдымен диагностика",
            stepLabel: "Қадам",
            lockedLabel: "Жабық",
            completedLabel: "✓ Аяқталды",
            currentLabel: "Қазір",
            practiceLabel: "Жаттығу",
            testLabel: "Тақырып тесті",
            lessonsLabel: "сабақ",
          };

  return (
    <GameLayout right={<RightWidgets />}>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#8B5CF6] p-5 text-white shadow-[0_12px_0_rgba(30,27,75,0.25)] md:p-8">
          <div className="absolute right-[-60px] top-[-70px] h-48 w-48 rounded-full bg-[#C084FC]/25 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_300px] lg:items-center xl:grid-cols-[minmax(0,1.35fr)_340px]">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                AI-Sana Quest
              </p>
              <h1 className="mt-3 max-w-4xl text-[2rem] font-black leading-[1.08] tracking-tight sm:text-[2.25rem] md:text-[2.85rem] lg:text-[3.35rem] xl:text-[3.5rem]">
                <span className="block">{c.titleLines[0]}</span>
                <span className="block">{c.titleLines[1]}</span>
              </h1>
              <p className="mt-6 max-w-3xl text-base font-semibold leading-relaxed text-[#EDE9FE] md:text-lg">
                {c.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={currentLessonHref as never}
                  className="inline-flex justify-center rounded-2xl bg-[#FACC15] px-6 py-4 text-center font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] transition hover:-translate-y-0.5"
                >
                  {c.start}
                </Link>
              </div>
            </div>
            <div className="relative min-h-[250px] overflow-visible sm:min-h-[290px] lg:self-center">
              <div className="absolute right-2 top-8 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
              <div className="relative mx-auto flex h-full max-w-[330px] items-center justify-center">
                {xpToday > 0 ? (
                  <div className="absolute right-3 top-2 rounded-[22px] border-2 border-white/30 bg-white/20 px-4 py-3 font-black text-white shadow-[0_8px_0_rgba(30,27,75,0.18)] backdrop-blur-md animate-[sana-bubble_3.2s_ease-in-out_infinite]">
                    ⭐ +{xpToday} XP
                  </div>
                ) : null}
                {completedLessons > 0 ? (
                  <div className="absolute left-0 top-16 rounded-[22px] bg-[#FACC15] px-4 py-3 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] animate-[sana-spark_2.8s_ease-in-out_infinite]">
                    🔥 Quest Complete
                  </div>
                ) : null}
                <div className="relative rounded-full bg-white/15 p-4 ring-2 ring-white/30 shadow-[0_20px_60px_rgba(30,27,75,0.28)] animate-[sana-live_5.5s_ease-in-out_infinite]">
                  <div className="absolute inset-2 rounded-full border-2 border-white/20" />
                  <div className="absolute -left-3 top-9 z-10 rounded-2xl border-2 border-white/50 bg-white px-4 py-2 text-sm font-black text-[#6D28D9] shadow-[0_6px_0_rgba(30,27,75,0.16)] animate-[sana-bubble_2.8s_ease-in-out_infinite]">
                    Сәлем!
                  </div>
                  <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_16px_0_rgba(30,27,75,0.18)] md:h-64 md:w-64">
                    <video
                      aria-label="Animated AI-Sana tutor"
                      autoPlay
                      className="h-full w-full scale-[1.42] object-cover object-[center_62%]"
                      height={288}
                      loop
                      muted
                      playsInline
                      poster={aiSanaPoster}
                      preload="auto"
                      src={aiSanaAnimated}
                      style={{
                        display: "block",
                        height: "100%",
                        maxHeight: 288,
                        maxWidth: 288,
                        objectFit: "cover",
                        width: "100%",
                      }}
                      width={288}
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/70 to-transparent" />
                    <span className="sana-wave-line sana-wave-line-1" />
                    <span className="sana-wave-line sana-wave-line-2" />
                    <span className="sana-wave-line sana-wave-line-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <GameCard className="relative overflow-hidden">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                  {c.pathEyebrow}
                </p>
                <h2 className="mt-2 text-3xl font-black">{c.pathTitle}</h2>
                <p className="mt-2 max-w-2xl font-bold text-[#6B5E8F]">
                  {adaptivePath?.updateMessage ?? c.pathFallback}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F5F3FF] px-4 py-3 font-black text-[#6D28D9]">
                {dashboard?.account.diagnosticCompleted ? c.pathReady : c.diagnosticFirst}
              </div>
            </div>
            <div className="relative mx-auto max-w-3xl py-4">
              <div className="absolute left-10 top-12 h-[calc(100%-6rem)] w-4 rounded-full bg-[#DDD6FE] md:left-1/2 md:-translate-x-1/2" />
              <div className="relative space-y-8">
                {learningSteps.map((node, index) => (
                  <LessonNode key={node.id} copy={c} node={node} index={index} />
                ))}
              </div>
            </div>
          </GameCard>

          <div className="space-y-5">
            <GameCard className="bg-[#FFF7CC]">
              <div className="text-5xl">🎁</div>
              <h3 className="mt-3 text-2xl font-black">{c.ready}</h3>
              <p className="mt-2 font-semibold text-[#6B5E8F]">
                Алғашқы сабақтан кейін прогресс басталады.
              </p>
              <ProgressBar value={0} />
            </GameCard>
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

function LessonNode({
  copy,
  node,
  index,
}: {
  copy: {
    completedLabel: string;
    currentLabel: string;
    lockedLabel: string;
    lessonsLabel: string;
    practiceLabel: string;
    stepLabel: string;
    testLabel: string;
  };
  node: AdaptiveLearningPathStep;
  index: number;
}) {
  const side = index % 2 === 0 ? "md:mr-auto" : "md:ml-auto";
  const stateClass =
    node.state === "completed"
      ? "bg-[#22C55E] text-white shadow-[0_8px_0_#15803D]"
      : node.state === "current"
        ? "bg-[#8B5CF6] text-white shadow-[0_8px_0_#5B21B6] animate-[reward-pop_0.8s_ease_both]"
        : node.state === "review"
          ? "bg-[#FACC15] text-[#1E1B4B] shadow-[0_8px_0_#CA8A04]"
          : "bg-[#EDE9FE] text-[#8B5CF6] shadow-[0_8px_0_#DDD6FE]";
  const icon =
    node.state === "locked"
      ? "lock"
      : node.state === "completed"
        ? "check"
        : node.kind === "test" || node.kind === "weekly" || node.kind === "monthly"
          ? "quiz"
          : node.kind === "practice" || node.kind === "revision"
            ? "psychology"
            : "play_arrow";
  const content = (
    <>
      <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-full ${stateClass}`}>
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
            {copy.stepLabel} {index + 1}
          </p>
          <span className="rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-black text-[#6D28D9]">
            {node.state === "locked"
              ? copy.lockedLabel
              : node.state === "completed"
                ? copy.completedLabel
                : copy.currentLabel}
          </span>
          <span className="ml-auto rounded-full bg-[#EDE9FE] px-3 py-1 text-xs font-black text-[#6D28D9]">
            {node.progress}%
          </span>
        </div>
        <h3 className="mt-2 text-xl font-black text-[#1E1B4B]">{node.title}</h3>
        <p className="mt-1 text-sm font-bold text-[#6B5E8F]">{node.aiMessage}</p>
        <ProgressBar value={node.progress} />
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[#4C1D95]">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            {node.lessons} {copy.lessonsLabel}
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            {copy.practiceLabel}: {node.practiceStatus}
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            {copy.testLabel}: {node.testStatus}
          </span>
        </div>
      </div>
    </>
  );

  if (node.state === "locked") {
    return (
      <div
        className={`relative z-10 flex w-full items-center gap-4 rounded-[28px] border-2 border-[#DDD6FE] bg-white/70 p-4 opacity-70 md:w-[82%] ${side}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={node.href as never}
      className={`relative z-10 flex w-full items-center gap-4 rounded-[28px] border-2 border-[#DDD6FE] bg-white p-4 transition hover:-translate-y-1 md:w-[82%] ${side}`}
    >
      {content}
    </Link>
  );
}
