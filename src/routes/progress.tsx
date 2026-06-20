import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { SubjectProgress } from "@/lib/account-store.server";

export const Route = createFileRoute("/progress")({
  loader: () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "My Progress — Aibi" },
      {
        name: "description",
        content: "Weekly accuracy, time spent, and subject status across NIS, BIL & NSPM tracks.",
      },
    ],
  }),
  component: Progress,
});

function Progress() {
  const { t, language } = useLanguage();
  const dashboard = Route.useLoaderData();
  const copy = getProgressCopy(language);
  const trendPath = buildTrendPath(dashboard.accuracyTrend);
  const trendAreaPath = buildTrendAreaPath(dashboard.accuracyTrend);
  const firstAccuracy = dashboard.accuracyTrend[0]?.accuracy ?? dashboard.averageAccuracy;
  const latestAccuracy =
    dashboard.accuracyTrend[dashboard.accuracyTrend.length - 1]?.accuracy ??
    dashboard.averageAccuracy;
  const weeklyAccuracyChange = latestAccuracy - firstAccuracy;
  const studyGoalHours = 5;
  const studyGoalPercent = Math.min((dashboard.studyHours / studyGoalHours) * 100, 100);
  const logicSubject = dashboard.subjects.find((subject) => subject.status === "needs-practice");
  const regularSubjects = dashboard.subjects.filter(
    (subject) => subject.status !== "needs-practice",
  );

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-safe">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-6 pb-[100px] md:pb-12">
        <header className="mb-stack-md mt-4">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
            {t("prog_header")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            {t("prog_subheader")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter md:gap-stack-md">
          <div className="md:col-span-12 bg-tertiary-fixed/30 border-l-[6px] border-tertiary-fixed-dim rounded-2xl p-5 flex items-start gap-4 mb-stack-md">
            <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-tertiary-fixed-dim"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-on-tertiary-fixed-variant">
                {t("prog_insight_title")}
              </h3>
              <p className="font-body-md text-body-md text-on-surface mt-1">
                {t("prog_insight_desc")}
              </p>
            </div>
          </div>

          {/* Weekly goal */}
          <section className="md:col-span-5 bg-surface-container-lowest rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm border border-surface-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface self-start mb-6">
              {t("prog_lessons_title")}
            </h2>
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-variant"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              <svg
                className="w-full h-full -rotate-90 absolute top-0 left-0 drop-shadow-md"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${(dashboard.completedLessons / dashboard.weeklyGoal) * 100}, 100`}
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[40px] leading-[48px] font-bold text-primary">
                  {dashboard.completedLessons}/{dashboard.weeklyGoal}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                  {t("prog_lessons_completed")}
                </span>
              </div>
            </div>
            <button className="mt-8 bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-full hover:bg-primary/90 active:scale-95 transition-all w-full shadow-md font-bold tracking-wide cursor-pointer">
              {t("prog_lessons_btn")}
            </button>
          </section>

          {/* Subjects */}
          <section className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            <div className="sm:col-span-2 mb-2">
              <h4 className="font-label-md text-label-md text-primary uppercase tracking-wide">
                {t("prog_nis_track")}
              </h4>
            </div>
            {regularSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                subjectName={copy.subjects[subject.id] ?? subject.name}
                labels={copy.badges}
              />
            ))}

            <div className="sm:col-span-2 mt-4 mb-2">
              <h4 className="font-label-md text-label-md text-primary uppercase tracking-wide">
                {t("prog_nspm_track")}
              </h4>
            </div>
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-variant/30 flex flex-col justify-between sm:col-span-2 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 organic-shape-3 bg-error-container flex items-center justify-center text-on-error-container group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">extension</span>
                </div>
                <span className="bg-error-container/50 text-error font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">flag</span>{" "}
                  {t("prog_needs_practice")}
                </span>
              </div>
              <div className="mt-2">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {copy.subjects[logicSubject?.id ?? "logic"] ?? t("prog_sub_logic")}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {t("prog_sub_logic_desc")}
                </p>
                <div className="w-full bg-surface-variant rounded-full h-3 mt-5 overflow-hidden">
                  <div
                    className="bg-error h-full rounded-full transition-all duration-1000"
                    style={{ width: `${logicSubject?.percent ?? 40}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Trend + time */}
          <section className="md:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-gutter md:gap-stack-md mt-4">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-surface-variant/40">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-8">
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {copy.weeklyDynamics}
                  </p>
                  <h2 className="font-headline-md text-headline-md text-on-surface mt-2">
                    {t("prog_accuracy_title")}
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-3 min-w-0 md:min-w-[360px]">
                  <MetricPill label={copy.now} value={`${latestAccuracy}%`} />
                  <MetricPill label={copy.average} value={`${dashboard.averageAccuracy}%`} />
                  <MetricPill
                    tone={weeklyAccuracyChange >= 0 ? "good" : "danger"}
                    label={copy.week}
                    value={`${weeklyAccuracyChange >= 0 ? "+" : ""}${weeklyAccuracyChange}%`}
                  />
                </div>
              </div>
              <div className="h-60 w-full relative flex items-end justify-between px-2 pb-8">
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient id="accuracyArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0040e0" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#0040e0" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <line
                    stroke="#e0e3e6"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                    x1="0"
                    x2="100"
                    y1="25"
                    y2="25"
                  />
                  <line
                    stroke="#e0e3e6"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                    x1="0"
                    x2="100"
                    y1="50"
                    y2="50"
                  />
                  <line
                    stroke="#e0e3e6"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                    x1="0"
                    x2="100"
                    y1="75"
                    y2="75"
                  />
                  <path d={trendAreaPath} fill="url(#accuracyArea)" />
                  <path
                    className="chart-line drop-shadow-sm"
                    d={trendPath}
                    fill="none"
                    stroke="#0040e0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                  />
                  {dashboard.accuracyTrend.map((point, index) => {
                    const x = (index / (dashboard.accuracyTrend.length - 1)) * 100;
                    const y = 100 - point.accuracy;

                    return (
                      <circle
                        key={point.day}
                        cx={x}
                        cy={y}
                        fill={index === dashboard.accuracyTrend.length - 1 ? "#ffffff" : "#0040e0"}
                        r={index === dashboard.accuracyTrend.length - 1 ? "4" : "3"}
                        stroke={
                          index === dashboard.accuracyTrend.length - 1 ? "#0040e0" : undefined
                        }
                        strokeWidth={index === dashboard.accuracyTrend.length - 1 ? "3" : undefined}
                      />
                    );
                  })}
                </svg>
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute bottom-0 left-0">
                  {t("prog_mon")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute bottom-0 left-1/4 -ml-2">
                  {t("prog_tue")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute bottom-0 left-2/4 -ml-3">
                  {t("prog_wed")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute bottom-0 left-3/4 -ml-2">
                  {t("prog_thu")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute bottom-0 right-0">
                  {t("prog_fri")}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 border-t border-surface-variant/60 pt-5">
                <InsightTag icon="trending_up" text={copy.accuracyGrowth} />
                <InsightTag
                  icon="flag"
                  text={`${copy.subjects[logicSubject?.id ?? "logic"] ?? copy.logic} ${copy.remainsFocus}`}
                />
              </div>
            </div>
            <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-6 md:p-8 shadow-sm border border-primary/20 flex flex-col justify-between min-h-[360px]">
              <div>
                <div className="w-12 h-12 bg-secondary text-on-secondary flex items-center justify-center mb-7">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    schedule
                  </span>
                </div>
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">
                  {copy.studyTime}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-[56px] leading-[64px] font-bold">
                    {dashboard.studyHours}
                  </span>
                  <span className="font-headline-md text-headline-md opacity-80">{copy.hours}</span>
                </div>
                <p className="font-body-md text-body-md text-inverse-on-surface/70 mt-3">
                  {copy.notStopwatch}
                </p>
              </div>
              <div className="mt-8">
                <div className="flex justify-between text-sm text-inverse-on-surface/70 mb-3">
                  <span>{copy.weeklyGoal}</span>
                  <span>
                    {studyGoalHours} {copy.hourShort}
                  </span>
                </div>
                <div className="h-3 bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-700"
                    style={{ width: `${studyGoalPercent}%` }}
                  />
                </div>
                <p className="font-label-sm text-label-sm mt-5 inline-flex bg-white/10 border border-white/15 px-4 py-2">
                  {t("prog_time_this_week")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function buildTrendPath(points: Array<{ day: string; accuracy: number }>) {
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - point.accuracy;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
}

function buildTrendAreaPath(points: Array<{ day: string; accuracy: number }>) {
  if (points.length === 0) return "";

  const line = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - point.accuracy;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");

  return `${line} L 100,100 L 0,100 Z`;
}

function getProgressCopy(language: string) {
  if (language === "KZ") {
    return {
      weeklyDynamics: "Апталық динамика",
      now: "Қазір",
      average: "Орташа",
      week: "Апта",
      accuracyGrowth: "Апта соңында дәлдік өсті",
      remainsFocus: "назарда қалады",
      studyTime: "Оқу уақыты",
      notStopwatch: "Бұл секундомер емес, апта ішіндегі жалпы оқу уақыты.",
      weeklyGoal: "Апталық мақсат",
      hours: "сағат",
      hourShort: "сағ",
      logic: "Логика",
      badges: {
        strong: "Күшті жағы",
        improving: "Жақсаруда",
      },
      subjects: {
        "natural-science": "Жаратылыстану",
        languages: "Ағылшын және қазақ тілі",
        logic: "Логикалық есептер",
      } as Record<string, string>,
    };
  }

  if (language === "RU") {
    return {
      weeklyDynamics: "Недельная динамика",
      now: "Сейчас",
      average: "Среднее",
      week: "Неделя",
      accuracyGrowth: "Рост точности к концу недели",
      remainsFocus: "остается в фокусе",
      studyTime: "Учебное время",
      notStopwatch: "Не секундомер, а итоговое время занятий за неделю.",
      weeklyGoal: "Цель недели",
      hours: "ч",
      hourShort: "ч",
      logic: "Логика",
      badges: {
        strong: "Сильная сторона",
        improving: "Улучшается",
      },
      subjects: {
        "natural-science": "Естествознание",
        languages: "Английский и казахский",
        logic: "Логические задачи",
      } as Record<string, string>,
    };
  }

  return {
    weeklyDynamics: "Weekly Dynamics",
    now: "Now",
    average: "Average",
    week: "Week",
    accuracyGrowth: "Accuracy improved by the end of the week",
    remainsFocus: "remains in focus",
    studyTime: "Study Time",
    notStopwatch: "Not a stopwatch, but total study time for the week.",
    weeklyGoal: "Weekly goal",
    hours: "hrs",
    hourShort: "h",
    logic: "Logic",
    badges: {
      strong: "Strong",
      improving: "Improving",
    },
    subjects: {
      "natural-science": "Natural Science",
      languages: "English & Kazakh",
      logic: "Logic Problems",
    } as Record<string, string>,
  };
}

function MetricPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "danger";
}) {
  const toneClass =
    tone === "good"
      ? "bg-secondary/10 text-secondary border-secondary/30"
      : tone === "danger"
        ? "bg-error-container text-error border-error/30"
        : "bg-surface-container-high text-primary border-outline-variant";

  return (
    <div className={`border px-3 py-3 ${toneClass}`}>
      <p className="font-label-sm text-label-sm uppercase tracking-wide opacity-70">{label}</p>
      <p className="font-headline-md text-headline-md mt-1">{value}</p>
    </div>
  );
}

function InsightTag({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 border border-outline-variant bg-surface px-3 py-2 text-on-surface-variant">
      <span className="material-symbols-outlined text-secondary text-lg">{icon}</span>
      <span className="font-label-sm text-label-sm">{text}</span>
    </div>
  );
}

function getSubjectUi(subject: SubjectProgress, labels: { strong: string; improving: string }) {
  if (subject.status === "strong") {
    return {
      badge: labels.strong,
      badgeIcon: "star",
      badgeBg: "bg-secondary-fixed/50 text-secondary-fixed-dim",
      iconBg: "organic-shape-2 bg-secondary-container text-on-secondary-container",
      bar: "bg-secondary",
    };
  }

  return {
    badge: labels.improving,
    badgeIcon: "trending_up",
    badgeBg: "bg-secondary-container/50 text-secondary-fixed-dim",
    iconBg: "organic-shape-1 bg-primary-container text-on-primary-container",
    bar: "bg-primary",
  };
}

function SubjectCard({
  subject,
  subjectName,
  labels,
}: {
  subject: SubjectProgress;
  subjectName: string;
  labels: { strong: string; improving: string };
}) {
  const ui = getSubjectUi(subject, labels);

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 ${ui.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <span className="material-symbols-outlined">{subject.icon}</span>
        </div>
        <span
          className={`${ui.badgeBg} font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-1`}
        >
          <span className="material-symbols-outlined text-[14px]">{ui.badgeIcon}</span> {ui.badge}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-headline-md text-headline-md text-on-surface">{subjectName}</h3>
        <div className="w-full bg-surface-variant rounded-full h-3 mt-4 overflow-hidden">
          <div
            className={`${ui.bar} h-full rounded-full transition-all duration-1000`}
            style={{ width: `${subject.percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
