import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";

export const Route = createFileRoute("/home")({
  loader: () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "Home — AI-Sana" },
      {
        name: "description",
        content: "Your AI-Sana readiness, today's plan, and weak topic focus.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, language } = useLanguage();
  const dashboard = Route.useLoaderData();
  const copy = getHomeCopy(language);
  const readinessOffset = 251.2 - (251.2 * dashboard.readiness) / 100;

  return (
    <div className="game-shell text-on-background min-h-screen pb-safe">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-stack-sm pb-stack-lg md:grid md:grid-cols-12 md:gap-stack-md">
        <section className="md:col-span-12 mt-4 mb-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
              {copy.accountLabel}
            </p>
            <h1 className="font-headline-md text-headline-md text-primary mt-2">
              {dashboard.account.name}
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:flex">
            <GameStat icon="local_fire_department" label="streak" value="7" />
            <GameStat icon="bolt" label="XP" value="1240" />
            <GameStat icon="favorite" label="energy" value="5" />
          </div>
        </section>
        <div className="md:col-span-8 flex flex-col gap-stack-md">
          {/* Readiness hero */}
          <section className="game-card p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_230px] md:items-center relative overflow-hidden mt-4">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary-container/40" />
            <div className="relative z-10">
              <span className="game-stat inline-flex items-center gap-2 px-4 py-2 font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                <span className="material-symbols-outlined text-base">flag</span>
                {copy.dailyMission}
              </span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-5">
                {t("home_readiness_title")}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 max-w-xl">
                {t("home_readiness_desc")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/plan"
                  className="game-button px-7 py-4 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  {t("home_readiness_btn")}
                </Link>
                <Link
                  to="/exam"
                  className="px-7 py-4 rounded-2xl border-2 border-outline-variant bg-white font-label-caps text-label-caps uppercase tracking-widest text-primary hover:border-secondary transition-colors"
                >
                  {copy.mockExam}
                </Link>
              </div>
            </div>
            <div className="relative w-48 h-48 flex items-center justify-center z-10 justify-self-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container-low"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-secondary"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="currentColor"
                  strokeDasharray="251.2"
                  strokeDashoffset={readinessOffset}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
                  {dashboard.readiness}%
                </span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mt-1">
                  {t("home_readiness_val")}
                </span>
              </div>
            </div>
          </section>

          {/* Today's plan */}
          <section className="flex flex-col gap-stack-sm mt-4">
            <div className="flex justify-between items-end mb-2">
              <h2 className="font-headline-md text-headline-md text-primary">
                {t("home_plan_title")}
              </h2>
              <Link
                to="/plan"
                className="font-label-caps text-label-caps text-secondary uppercase tracking-widest hover:underline"
              >
                {t("home_plan_view_all")}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {dashboard.tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  icon={task.icon}
                  title={copy.tasks[task.id]?.title ?? task.title}
                  subtitle={copy.tasks[task.id]?.subtitle ?? task.subtitle}
                  done={task.status === "done"}
                  active={task.status === "active"}
                  openLabel={copy.open}
                  step={index + 1}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="md:col-span-4 flex flex-col gap-stack-md mt-stack-md md:mt-4">
          <section className="game-card p-6 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-20%] text-secondary opacity-5">
              <span className="material-symbols-outlined text-[120px]">calendar_month</span>
            </div>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <span className="material-symbols-outlined">emoji_events</span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest">
                {t("home_exam_title")}
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">
                {copy.nextExamDay}, {dashboard.nextExam.time}
              </h3>
              <p className="font-body-md text-on-surface-variant mt-2">
                {copy.nextExamDescription}
              </p>
            </div>
          </section>

          <section className="game-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined">trending_down</span>
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest">
                {t("home_focus_title")}
              </h3>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-primary">{copy.focusTitle}</h4>
              <p className="font-body-md text-on-surface-variant mt-2 text-sm">
                {copy.focusDescription}
              </p>
            </div>
            <div className="w-full bg-surface-container-high h-2 mt-2 border border-outline-variant">
              <div className="bg-error h-full" style={{ width: `${dashboard.focus.percent}%` }} />
            </div>
            <Link to="/topic-challenge" className="w-full mt-4 py-3 bg-surface text-primary border-2 border-primary rounded-2xl font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-colors flex items-center justify-center gap-2 btn-squish cursor-pointer">
              {t("home_focus_btn")}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function TaskCard({
  icon,
  title,
  subtitle,
  done,
  active,
  openLabel,
  step,
}: {
  icon: string;
  title: string;
  subtitle: string;
  done?: boolean;
  active?: boolean;
  openLabel: string;
  step: number;
}) {
  if (done) {
    return (
      <div className="game-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-label-md text-label-md text-on-surface line-through opacity-70">
            {title}
          </h3>
          <p className="font-body-md text-on-surface-variant text-sm opacity-70 mt-1">{subtitle}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`game-card p-5 flex items-center gap-4 ${active ? "border-secondary" : ""}`}
    >
      <div
        className={`w-12 h-12 rounded-full ${active ? "bg-secondary text-on-secondary shadow-sm" : "bg-surface-container text-secondary"} flex items-center justify-center font-title-md`}
      >
        {active ? <span className="material-symbols-outlined">{icon}</span> : step}
      </div>
      <div className="flex-1">
        <h3 className="font-label-md text-label-md text-primary">{title}</h3>
        <p className="font-body-md text-on-surface-variant text-sm mt-1">{subtitle}</p>
      </div>
      <button
        aria-label={openLabel}
        className="w-10 h-10 bg-surface-container-high flex items-center justify-center text-primary hover:bg-secondary hover:text-on-secondary transition-colors btn-squish border border-outline-variant cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
}

function GameStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="game-stat flex items-center gap-2 px-4 py-2">
      <span className="material-symbols-outlined text-secondary text-lg">{icon}</span>
      <div>
        <p className="font-title-md text-title-md text-primary leading-none">{value}</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant leading-none mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function getHomeCopy(language: string) {
  if (language === "KZ") {
    return {
      accountLabel: "Оқушы аккаунты",
      dailyMission: "Бүгінгі миссия",
      mockExam: "Сынақ емтихан",
      open: "Ашу",
      nextExamDay: "Сенбі",
      nextExamDescription: "НЗМ/БИЛ/РФММ бойынша толық форматтағы жаттығу тесті.",
      focusTitle: "Логикалық есептер",
      focusDescription: "Соңғы тесттердегі дәлдік 50%-дан төмен.",
      tasks: {
        quantitative: {
          title: "НЗМ: Сандық сипаттамалар",
          subtitle: "Математикалық және логикалық талдау",
        },
        reading: {
          title: "БИЛ: Оқу сауаттылығы",
          subtitle: "Қазақ және орыс мәтіндерін түсіну",
        },
        functions: {
          title: "РФММ: Функциялар және графиктер",
          subtitle: "Күрделі есептерге дайындық",
        },
      } as Record<string, { title: string; subtitle: string }>,
    };
  }

  if (language === "RU") {
    return {
      accountLabel: "Аккаунт ученика",
      dailyMission: "Миссия дня",
      mockExam: "Пробный экзамен",
      open: "Открыть",
      nextExamDay: "Суббота",
      nextExamDescription: "Полноформатный тренировочный тест по НИШ/БИЛ/РФМШ.",
      focusTitle: "Логические задачи",
      focusDescription: "Точность в последних тестах ниже 50%.",
      tasks: {
        quantitative: {
          title: "НИШ: Количественные характеристики",
          subtitle: "Математический и логический анализ",
        },
        reading: {
          title: "БИЛ: Читательская грамотность",
          subtitle: "Понимание казахского и русского текста",
        },
        functions: {
          title: "РФМШ: Функции и графики",
          subtitle: "Практика задач повышенной сложности",
        },
      } as Record<string, { title: string; subtitle: string }>,
    };
  }

  return {
    accountLabel: "Student Account",
    dailyMission: "Daily mission",
    mockExam: "Mock exam",
    open: "Open",
    nextExamDay: "Saturday",
    nextExamDescription: "Full-length NIS/BIL/NSPM practice test.",
    focusTitle: "Logic Problems",
    focusDescription: "Accuracy in recent tests is below 50%.",
    tasks: {
      quantitative: {
        title: "NIS: Quantitative Characteristics",
        subtitle: "Math and logic analysis",
      },
      reading: {
        title: "BIL: Reading Literacy",
        subtitle: "Kazakh and Russian text comprehension",
      },
      functions: {
        title: "NSPM: Functions and Graphs",
        subtitle: "Advanced problem practice",
      },
    } as Record<string, { title: string; subtitle: string }>,
  };
}
