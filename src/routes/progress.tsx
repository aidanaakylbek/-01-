import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AibiMark } from "@/components/aibi-mark";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { DashboardAccount, RiskArea } from "@/lib/account-store.server";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — AI-Sana" }] }),
  component: ProgressPage,
});

type ProgressCopy = ReturnType<typeof getCopy>;

function ProgressPage() {
  const { language } = useLanguage();
  const c = getCopy(language);
  const [dashboard, setDashboard] = useState<DashboardAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    setIsLoading(true);
    setHasError(false);
    void getAccountDashboard()
      .then((data) => {
        if (mounted) {
          setDashboard(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <GameLayout right={<ProgressRightSkeleton />}>
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-72" />
        </div>
      </GameLayout>
    );
  }

  if (hasError || !dashboard) {
    return (
      <GameLayout right={<CompactParentReport c={c} dashboard={null} />}>
        <GameCard>
          <p className="text-xl font-black">{c.errorTitle}</p>
          <p className="mt-2 font-semibold text-[#6B5E8F]">{c.errorText}</p>
        </GameCard>
      </GameLayout>
    );
  }

  const hasDiagnostic = dashboard.account.diagnosticCompleted;
  const hasActivity = hasDiagnostic || dashboard.examAttempts.length > 0;
  const weeklyData = buildWeeklyData(dashboard);
  const achievements = buildAchievements(dashboard, c);

  return (
    <GameLayout right={<ProgressRightRail c={c} dashboard={dashboard} />}>
      <div className="space-y-4 md:space-y-5">
        <CompactAdvice c={c} dashboard={dashboard} />
        <StatsRow c={c} dashboard={dashboard} />
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <WeeklyProgress c={c} data={weeklyData} hasActivity={hasActivity} />
            <WeakTopics c={c} hasDiagnostic={hasDiagnostic} topics={dashboard.risks} />
            <Achievements c={c} achievements={achievements} />
            <StreakCard c={c} data={weeklyData} hasActivity={hasActivity} />
          </div>
          <div className="space-y-4 xl:hidden">
            <ProgressRightRail c={c} dashboard={dashboard} />
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

function CompactAdvice({ c, dashboard }: { c: ProgressCopy; dashboard: DashboardAccount }) {
  const hasProgress = dashboard.completedLessons > 0 || dashboard.examAttempts.length > 0;
  const recommendation = hasProgress ? dashboard.recommendations[0] : c.neutralAdvice;

  return (
    <div className="flex min-h-20 items-center gap-3 rounded-[24px] border-2 border-[#DDD6FE] bg-white px-4 py-3 shadow-[0_7px_0_rgba(109,40,217,0.10)] sm:px-5">
      <AibiMark size="md" shape="circle" className="bg-[#F5F3FF]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
          {c.adviceLabel}
        </p>
        <p className="line-clamp-2 text-sm font-black leading-snug text-[#1E1B4B] sm:text-base">
          {recommendation}
        </p>
      </div>
      <Link
        to={hasProgress ? "/plan" : "/diagnostic"}
        className="hidden rounded-2xl bg-[#6D28D9] px-4 py-2 text-sm font-black text-white shadow-[0_4px_0_#4C1D95] sm:inline-flex"
      >
        {hasProgress ? c.review : c.startDiagnostic}
      </Link>
    </div>
  );
}

function StatsRow({ c, dashboard }: { c: ProgressCopy; dashboard: DashboardAccount }) {
  const attemptsPassed = dashboard.examAttempts.filter((attempt) => attempt.percent >= 70).length;
  const stats = [
    { icon: "🎯", label: c.accuracy, value: `${dashboard.averageAccuracy}%` },
    { icon: "📚", label: c.lessons, value: String(dashboard.completedLessons) },
    { icon: "⏱", label: c.studyTime, value: `${dashboard.studyHours} ${c.hoursShort}` },
    { icon: "✅", label: c.testsPassed, value: String(attemptsPassed) },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-[22px] border-2 border-[#DDD6FE] bg-white px-4 py-3 shadow-[0_6px_0_rgba(109,40,217,0.10)]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F5F3FF] text-xl">
            {stat.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-wider text-[#6B5E8F]">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-[#6D28D9]">{stat.value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function WeeklyProgress({
  c,
  data,
  hasActivity,
}: {
  c: ProgressCopy;
  data: WeeklyPoint[];
  hasActivity: boolean;
}) {
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <GameCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
            {c.weeklyLabel}
          </p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">{c.weeklyTitle}</h1>
        </div>
        <div className="rounded-2xl bg-[#F5F3FF] px-3 py-2 text-sm font-black text-[#6D28D9]">
          {c.metricSolvedQuestions}
        </div>
      </div>
      {hasActivity ? (
        <div
          aria-label={c.weeklyTitle}
          className="mt-5 flex h-44 items-end gap-2 sm:h-52 sm:gap-3"
          role="img"
        >
          {data.map((item) => {
            const height = Math.max(item.value > 0 ? 12 : 5, Math.round((item.value / maxValue) * 100));
            return (
              <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-2xl transition ${
                    item.isToday
                      ? "bg-gradient-to-t from-[#6D28D9] to-[#FACC15]"
                      : "bg-gradient-to-t from-[#6D28D9] to-[#C084FC]"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${item.value}`}
                />
                <span
                  className={`text-xs font-black ${item.isToday ? "text-[#6D28D9]" : "text-[#6B5E8F]"}`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <CompactEmpty
          actionLabel={c.startLesson}
          icon="monitoring"
          text={c.noWeeklyActivity}
          to="/diagnostic"
        />
      )}
    </GameCard>
  );
}

function WeakTopics({
  c,
  hasDiagnostic,
  topics,
}: {
  c: ProgressCopy;
  hasDiagnostic: boolean;
  topics: RiskArea[];
}) {
  return (
    <GameCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
            {c.focusLabel}
          </p>
          <h2 className="mt-1 text-2xl font-black">{c.weakTitle}</h2>
        </div>
      </div>
      {hasDiagnostic && topics.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-[22px] border-2 border-[#DDD6FE] bg-[#FBFAFF] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black">{topic.title}</p>
                  <p className="mt-1 text-sm font-bold text-[#6B5E8F]">{c.subjectMixed}</p>
                  <p className="mt-2 text-sm font-semibold text-[#6B5E8F]">{topic.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#EF4444]">{topic.accuracy}%</p>
                  <Link
                    to="/plan"
                    className="mt-2 inline-flex rounded-2xl bg-[#6D28D9] px-4 py-2 text-sm font-black text-white shadow-[0_4px_0_#4C1D95]"
                  >
                    {c.repeat}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CompactEmpty
          actionLabel={c.startDiagnostic}
          icon="psychology_alt"
          text={c.noWeakTopics}
          to="/diagnostic"
        />
      )}
    </GameCard>
  );
}

function Achievements({ c, achievements }: { c: ProgressCopy; achievements: string[] }) {
  if (!achievements.length) {
    return null;
  }

  return (
    <GameCard>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{c.recentAchievements}</h2>
        <Link to="/profile" className="text-sm font-black text-[#6D28D9]">
          {c.viewAll}
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {achievements.slice(0, 3).map((achievement) => (
          <div
            key={achievement}
            className="rounded-[20px] border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 font-black"
          >
            🏆 {achievement}
          </div>
        ))}
      </div>
    </GameCard>
  );
}

function StreakCard({
  c,
  data,
  hasActivity,
}: {
  c: ProgressCopy;
  data: WeeklyPoint[];
  hasActivity: boolean;
}) {
  return (
    <GameCard>
      <h2 className="text-2xl font-black">{c.streakTitle}</h2>
      {hasActivity ? (
        <div className="mt-4 grid grid-cols-7 gap-2">
          {data.map((item) => (
            <div
              key={item.key}
              className={`grid h-11 place-items-center rounded-2xl text-xs font-black ${
                item.value > 0
                  ? "bg-[#6D28D9] text-white shadow-[0_4px_0_#4C1D95]"
                  : item.isToday
                    ? "border-2 border-[#FACC15] bg-[#FFFBEB] text-[#1E1B4B]"
                    : "bg-[#EDE9FE] text-[#6B5E8F]"
              }`}
              title={`${item.dateText}: ${item.value}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      ) : (
        <CompactEmpty actionLabel={c.startLesson} icon="local_fire_department" text={c.noStreak} to="/diagnostic" />
      )}
    </GameCard>
  );
}

function ProgressRightRail({ c, dashboard }: { c: ProgressCopy; dashboard: DashboardAccount }) {
  return (
    <>
      <TodayGoal c={c} dashboard={dashboard} />
      <CompactParentReport c={c} dashboard={dashboard} />
    </>
  );
}

function TodayGoal({ c, dashboard }: { c: ProgressCopy; dashboard: DashboardAccount }) {
  const completed = dashboard.completedLessons;
  const target = Math.max(1, dashboard.weeklyGoal || 3);
  const progress = Math.min(100, Math.round((completed / target) * 100));
  const remaining = Math.max(0, target - completed);
  const completedGoal = remaining === 0;

  return (
    <GameCard className="bg-white/95">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-[#8B5CF6]">
            {c.todayGoal}
          </p>
          <h3 className="mt-1 text-2xl font-black">
            {completed} / {target} {c.lessonUnit}
          </h3>
        </div>
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-[0_5px_0_rgba(120,53,15,0.35)] ${
            completedGoal ? "bg-[#FACC15]" : "bg-[#EDE9FE] opacity-70"
          }`}
          title={completedGoal ? c.rewardUnlocked : c.rewardLocked}
        >
          🎁
        </div>
      </div>
      <ProgressBar value={progress} />
      <p className="mt-3 text-sm font-bold text-[#6B5E8F]">
        {completedGoal ? c.rewardUnlocked : c.remainingLessons(remaining)}
      </p>
    </GameCard>
  );
}

function CompactParentReport({
  c,
  dashboard,
}: {
  c: ProgressCopy;
  dashboard: DashboardAccount | null;
}) {
  const hasProgress = Boolean(dashboard && (dashboard.completedLessons > 0 || dashboard.examAttempts.length > 0));

  return (
    <GameCard className="bg-white/95">
      <h3 className="text-lg font-black">{c.parentReport}</h3>
      <p className="mt-2 text-sm font-semibold text-[#6B5E8F]">
        {hasProgress ? dashboard?.parentRecommendation : c.parentEmpty}
      </p>
    </GameCard>
  );
}

function CompactEmpty({
  actionLabel,
  icon,
  text,
  to,
}: {
  actionLabel: string;
  icon: string;
  text: string;
  to: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[22px] border-2 border-dashed border-[#DDD6FE] bg-[#FBFAFF] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined grid h-10 w-10 place-items-center rounded-2xl bg-[#EDE9FE] text-[#6D28D9]">
          {icon}
        </span>
        <p className="font-bold text-[#6B5E8F]">{text}</p>
      </div>
      <Link
        to={to as never}
        className="inline-flex justify-center rounded-2xl bg-[#6D28D9] px-4 py-2 text-sm font-black text-white shadow-[0_4px_0_#4C1D95]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function ProgressRightSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-32" />
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[28px] border-2 border-[#DDD6FE] bg-white shadow-[0_9px_0_rgba(109,40,217,0.10)] ${className}`}
    />
  );
}

type WeeklyPoint = {
  dateText: string;
  isToday: boolean;
  key: string;
  label: string;
  value: number;
};

function buildWeeklyData(dashboard: DashboardAccount): WeeklyPoint[] {
  const now = new Date();
  const attemptsByDate = new Map<string, number>();

  dashboard.examAttempts.forEach((attempt) => {
    const key = new Date(attempt.createdAt).toISOString().slice(0, 10);
    attemptsByDate.set(key, (attemptsByDate.get(key) ?? 0) + attempt.totalQuestions);
  });

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const fallbackAccuracy = dashboard.accuracyTrend[index]?.accuracy ?? 0;
    const value = attemptsByDate.get(key) ?? (fallbackAccuracy > 0 ? dashboard.completedLessons : 0);

    return {
      dateText: date.toLocaleDateString("kk-KZ"),
      isToday: key === now.toISOString().slice(0, 10),
      key,
      label: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"][date.getDay() === 0 ? 6 : date.getDay() - 1],
      value,
    };
  });
}

function buildAchievements(dashboard: DashboardAccount, c: ProgressCopy) {
  const achievements: string[] = [];

  if (dashboard.completedLessons > 0) achievements.push(c.firstLesson);
  if (dashboard.examAttempts.length > 0) achievements.push(c.firstTest);
  if (dashboard.averageAccuracy >= 80) achievements.push(c.highAccuracy);

  return achievements;
}

function getCopy(language: "EN" | "KZ" | "RU") {
  if (language === "RU") {
    return {
      accuracy: "Точность",
      adviceLabel: "Совет AI-Sana",
      errorText: "Попробуйте обновить страницу чуть позже.",
      errorTitle: "Не удалось загрузить прогресс",
      firstLesson: "Первый урок",
      firstTest: "Первый тест",
      focusLabel: "Фокус",
      highAccuracy: "Высокая точность",
      hoursShort: "ч",
      lessonUnit: "урок",
      lessons: "Уроки",
      metricSolvedQuestions: "Решенные вопросы",
      neutralAdvice: "Пройдите диагностику, чтобы увидеть личные рекомендации.",
      noStreak: "Завершите первый урок и начните серию.",
      noWeakTopics: "Чтобы определить слабые темы, сначала пройдите диагностический тест.",
      noWeeklyActivity: "На этой неделе активности пока нет.",
      parentEmpty: "Отчет для родителей появится после первой учебной недели.",
      parentReport: "Отчет родителю",
      recentAchievements: "Последние достижения",
      repeat: "Повторить",
      remainingLessons: (count: number) => `Осталось уроков: ${count}`,
      review: "Повторить",
      rewardLocked: "Подарок откроется после цели",
      rewardUnlocked: "Подарок открыт!",
      startDiagnostic: "Начать диагностику",
      startLesson: "Начать урок",
      streakTitle: "Серия",
      studyTime: "Время",
      subjectMixed: "Смешанная подготовка",
      testsPassed: "Тесты",
      todayGoal: "Цель дня",
      viewAll: "Все",
      weakTitle: "Слабые темы",
      weeklyLabel: "Данные за 7 дней",
      weeklyTitle: "Недельный прогресс",
    };
  }

  return {
    accuracy: "Дәлдік",
    adviceLabel: "AI-Sana кеңесі",
    errorText: "Бетті сәл кейінірек қайта ашып көріңіз.",
    errorTitle: "Прогресс жүктелмеді",
    firstLesson: "Алғашқы сабақ",
    firstTest: "Алғашқы тест",
    focusLabel: "Назар аудару",
    highAccuracy: "Жоғары дәлдік",
    hoursShort: "сағ",
    lessonUnit: "сабақ",
    lessons: "Сабақ",
    metricSolvedQuestions: "Шешілген сұрақтар",
    neutralAdvice: "Жеке ұсыныс алу үшін алдымен диагностикалық тесттен өтіңіз.",
    noStreak: "Бірінші сабақты аяқтап, серияңызды бастаңыз.",
    noWeakTopics: "Әлсіз тақырыптарды анықтау үшін алдымен диагностикалық тесттен өтіңіз.",
    noWeeklyActivity: "Бұл аптада белсенділік әлі жоқ.",
    parentEmpty: "Ата-ана есебі алғашқы оқу аптасынан кейін қолжетімді болады.",
    parentReport: "Ата-ана есебі",
    recentAchievements: "Соңғы жетістіктер",
    repeat: "Қайталау",
    remainingLessons: (count: number) => `Тағы ${count} сабақ қалды`,
    review: "Қайталау",
    rewardLocked: "Сыйлық мақсат орындалғанда ашылады",
    rewardUnlocked: "Сыйлық ашылды!",
    startDiagnostic: "Диагностиканы бастау",
    startLesson: "Сабақты бастау",
    streakTitle: "Серия күндері",
    studyTime: "Оқу уақыты",
    subjectMixed: "Аралас дайындық",
    testsPassed: "Өткен тест",
    todayGoal: "Бүгінгі мақсат",
    viewAll: "Барлығын көру",
    weakTitle: "Әлсіз тақырыптар",
    weeklyLabel: "7 күндік дерек",
    weeklyTitle: "Апталық прогресс",
  };
}
