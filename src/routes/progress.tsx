import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { SubjectProgress } from "@/lib/account-store.server";

export const Route = createFileRoute("/progress")({
  loader: () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "My Progress — AI-Sana" },
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
  const lessonPercent = Math.round((dashboard.completedLessons / dashboard.weeklyGoal) * 100);

  return (
    <div className="bg-background text-on-background min-h-screen pb-safe">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-6 pb-[100px] md:pb-12">
        <header className="mt-4 mb-6">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            {copy.pageLabel}
          </p>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-3">
            {t("prog_header")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            {copy.simpleSummary}
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-gutter mb-gutter">
          <ProgressStat
            icon="verified"
            label={copy.currentAccuracy}
            value={`${latestAccuracy}%`}
            helper={copy.goodDirection}
            tone="primary"
          />
          <ProgressStat
            icon="task_alt"
            label={t("prog_lessons_title")}
            value={`${dashboard.completedLessons}/${dashboard.weeklyGoal}`}
            helper={`${lessonPercent}% ${t("prog_lessons_completed").toLowerCase()}`}
          />
          <ProgressStat
            icon="schedule"
            label={copy.studyTime}
            value={`${dashboard.studyHours} ${copy.hourShort}`}
            helper={`${copy.weeklyGoal}: ${studyGoalHours} ${copy.hourShort}`}
          />
          <ProgressStat
            icon="flag"
            label={copy.mainFocus}
            value={copy.subjects[logicSubject?.id ?? "logic"] ?? copy.logic}
            helper={`${logicSubject?.percent ?? 40}%`}
            tone="danger"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-gutter">
          <div className="space-y-gutter">
            <section className="border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {copy.weeklyDynamics}
                  </p>
                  <h2 className="font-headline-md text-headline-md text-primary mt-2">
                    {t("prog_accuracy_title")}
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                  {copy.chartHint}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:max-w-md mb-5">
                <MetricPill label={copy.now} value={`${latestAccuracy}%`} />
                <MetricPill label={copy.average} value={`${dashboard.averageAccuracy}%`} />
                <MetricPill
                  tone={weeklyAccuracyChange >= 0 ? "good" : "danger"}
                  label={copy.week}
                  value={`${weeklyAccuracyChange >= 0 ? "+" : ""}${weeklyAccuracyChange}%`}
                />
              </div>

              <div className="h-56 w-full relative flex items-end justify-between px-2 pb-8">
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
                    stroke="var(--secondary)"
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
                        fill={
                          index === dashboard.accuracyTrend.length - 1
                            ? "#ffffff"
                            : "var(--secondary)"
                        }
                        r={index === dashboard.accuracyTrend.length - 1 ? "4" : "3"}
                        stroke={
                          index === dashboard.accuracyTrend.length - 1
                            ? "var(--secondary)"
                            : undefined
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

              <div className="mt-5 border-t border-outline-variant pt-5">
                <InsightTag icon="trending_up" text={copy.accuracyGrowth} />
              </div>
            </section>

            <section className="border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
              <div className="mb-5">
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                  {copy.subjectStatus}
                </p>
                <h2 className="font-headline-md text-headline-md text-primary mt-2">
                  {copy.whatIsClear}
                </h2>
              </div>
              <div className="space-y-4">
                {dashboard.subjects.map((subject) => (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    subjectName={copy.subjects[subject.id] ?? subject.name}
                    labels={copy.badges}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-gutter">
            <section className="border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined">tips_and_updates</span>
                </div>
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {t("prog_insight_title")}
                  </p>
                  <h2 className="font-title-lg text-title-lg text-primary mt-2">
                    {copy.nextStepTitle}
                  </h2>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4">
                {t("prog_insight_desc")}
              </p>
              <div className="mt-5 space-y-3">
                {copy.nextSteps.map((step) => (
                  <div
                    className="flex items-start gap-3 border border-outline-variant bg-surface px-3 py-3"
                    key={step}
                  >
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {copy.studyTime}
                  </p>
                  <h2 className="font-title-lg text-title-lg text-primary mt-2">
                    {copy.weeklyGoal}
                  </h2>
                </div>
                <span className="font-headline-md text-headline-md text-primary">
                  {dashboard.studyHours}/{studyGoalHours} {copy.hourShort}
                </span>
              </div>
              <div className="h-3 bg-surface-variant overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-700"
                  style={{ width: `${studyGoalPercent}%` }}
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
                {copy.notStopwatch}
              </p>
            </section>
          </aside>
        </section>
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
      pageLabel: "Түсінікті прогресс",
      simpleSummary:
        "Мұнда тек маңыздысы көрсетіледі: дайындық деңгейі, оқу уақыты, қай пән жақсы және қай тақырыпқа көңіл бөлу керек.",
      currentAccuracy: "Қазіргі дәлдік",
      goodDirection: "Жақсы бағытта",
      mainFocus: "Негізгі фокус",
      weeklyDynamics: "Апталық динамика",
      now: "Қазір",
      average: "Орташа",
      week: "Апта",
      chartHint: "График күн сайынғы дәлдіктің қалай өзгергенін көрсетеді.",
      accuracyGrowth: "Апта соңында дәлдік өсті",
      remainsFocus: "назарда қалады",
      subjectStatus: "Пәндер жағдайы",
      whatIsClear: "Қай жерде мықты, қай жерде жаттығу керек",
      nextStepTitle: "Келесі не істеу керек?",
      nextSteps: [
        "Логикадан 15 минуттық қысқа жаттығу орында.",
        "Қате шыққан екі есепке AI разбор ал.",
        "Апта соңында бір толық пробный тест тапсыр.",
      ],
      studyTime: "Оқу уақыты",
      notStopwatch: "Бұл секундомер емес, апта ішіндегі жалпы оқу уақыты.",
      weeklyGoal: "Апталық мақсат",
      hours: "сағат",
      hourShort: "сағ",
      logic: "Логика",
      badges: {
        strong: "Күшті жағы",
        improving: "Жақсаруда",
        needsPractice: "Тәжірибе қажет",
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
      pageLabel: "Понятный прогресс",
      simpleSummary:
        "Здесь оставлено только главное: уровень подготовки, учебное время, сильные предметы и тема, которой нужно уделить внимание.",
      currentAccuracy: "Текущая точность",
      goodDirection: "Хорошая динамика",
      mainFocus: "Главный фокус",
      weeklyDynamics: "Недельная динамика",
      now: "Сейчас",
      average: "Среднее",
      week: "Неделя",
      chartHint: "График показывает, как менялась точность по дням.",
      accuracyGrowth: "Рост точности к концу недели",
      remainsFocus: "остается в фокусе",
      subjectStatus: "Состояние предметов",
      whatIsClear: "Где сильная сторона, а где нужна практика",
      nextStepTitle: "Что делать дальше?",
      nextSteps: [
        "Сделать короткую практику по логике на 15 минут.",
        "Разобрать с AI две задачи, где были ошибки.",
        "В конце недели пройти один полный пробный тест.",
      ],
      studyTime: "Учебное время",
      notStopwatch: "Не секундомер, а итоговое время занятий за неделю.",
      weeklyGoal: "Цель недели",
      hours: "ч",
      hourShort: "ч",
      logic: "Логика",
      badges: {
        strong: "Сильная сторона",
        improving: "Улучшается",
        needsPractice: "Нужна практика",
      },
      subjects: {
        "natural-science": "Естествознание",
        languages: "Английский и казахский",
        logic: "Логические задачи",
      } as Record<string, string>,
    };
  }

  return {
    pageLabel: "Clear progress",
    simpleSummary:
      "Only the essentials: readiness, study time, strong subjects, and the next topic to practice.",
    currentAccuracy: "Current accuracy",
    goodDirection: "Good direction",
    mainFocus: "Main focus",
    weeklyDynamics: "Weekly Dynamics",
    now: "Now",
    average: "Average",
    week: "Week",
    chartHint: "The chart shows how accuracy changed day by day.",
    accuracyGrowth: "Accuracy improved by the end of the week",
    remainsFocus: "remains in focus",
    subjectStatus: "Subject status",
    whatIsClear: "What is strong and what needs practice",
    nextStepTitle: "What to do next?",
    nextSteps: [
      "Do a short 15-minute logic practice.",
      "Review two missed problems with AI.",
      "Take one full mock test at the end of the week.",
    ],
    studyTime: "Study Time",
    notStopwatch: "Not a stopwatch, but total study time for the week.",
    weeklyGoal: "Weekly goal",
    hours: "hrs",
    hourShort: "h",
    logic: "Logic",
    badges: {
      strong: "Strong",
      improving: "Improving",
      needsPractice: "Needs practice",
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

function ProgressStat({
  icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "primary" | "danger";
}) {
  const iconClass =
    tone === "danger"
      ? "bg-error-container text-error"
      : tone === "primary"
        ? "bg-secondary text-on-secondary"
        : "bg-surface-container-high text-secondary";

  return (
    <div className="border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center ${iconClass}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant text-right">{label}</p>
      </div>
      <p className="font-headline-md text-headline-md text-primary">{value}</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{helper}</p>
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

function getSubjectUi(
  subject: SubjectProgress,
  labels: { strong: string; improving: string; needsPractice?: string },
) {
  if (subject.status === "needs-practice") {
    return {
      badge: labels.needsPractice ?? "Needs practice",
      badgeIcon: "flag",
      badgeClass: "text-error bg-error-container",
      bar: "bg-error",
    };
  }

  if (subject.status === "strong") {
    return {
      badge: labels.strong,
      badgeIcon: "star",
      badgeClass: "text-secondary bg-secondary/10",
      bar: "bg-secondary",
    };
  }

  return {
    badge: labels.improving,
    badgeIcon: "trending_up",
    badgeClass: "text-primary bg-primary/10",
    bar: "bg-primary",
  };
}

function SubjectRow({
  subject,
  subjectName,
  labels,
}: {
  subject: SubjectProgress;
  subjectName: string;
  labels: { strong: string; improving: string; needsPractice?: string };
}) {
  const ui = getSubjectUi(subject, labels);

  return (
    <div className="border border-outline-variant bg-surface px-4 py-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-surface-container-high text-secondary">
            <span className="material-symbols-outlined text-xl">{subject.icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-title-md text-title-md text-primary">{subjectName}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{subject.percent}%</p>
          </div>
        </div>
        <span className={`${ui.badgeClass} shrink-0 px-3 py-1 font-label-sm text-label-sm`}>
          <span className="material-symbols-outlined align-[-3px] text-[14px]">{ui.badgeIcon}</span>{" "}
          {ui.badge}
        </span>
      </div>
      <div className="h-2 bg-surface-variant">
        <div
          className={`${ui.bar} h-full transition-all duration-700`}
          style={{ width: `${subject.percent}%` }}
        />
      </div>
    </div>
  );
}
