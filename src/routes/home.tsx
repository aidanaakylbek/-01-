import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";

export const Route = createFileRoute("/home")({
  loader: () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "Home — Aibi" },
      {
        name: "description",
        content: "Your Aibi readiness, today's plan, and weak topic focus.",
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
    <div className="bg-background text-on-background min-h-screen pb-safe">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-stack-sm pb-stack-lg md:grid md:grid-cols-12 md:gap-stack-md">
        <section className="md:col-span-12 mt-4 mb-2">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            {copy.accountLabel}
          </p>
          <h1 className="font-headline-md text-headline-md text-primary mt-2">
            {dashboard.account.name}
          </h1>
        </section>
        <div className="md:col-span-8 flex flex-col gap-stack-md">
          {/* Readiness hero */}
          <section className="bg-surface-container-highest border border-outline-variant rounded-tr-[40px] rounded-bl-[40px] p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-secondary transition-colors mt-4 card-hover">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary opacity-5 organic-shape-2 group-hover:scale-150 transition-transform duration-700" />
            <h2 className="font-headline-md text-headline-md text-primary mb-2 relative z-10">
              {t("home_readiness_title")}
            </h2>
            <p className="font-body-md text-on-surface-variant mb-8 relative z-10">
              {t("home_readiness_desc")}
            </p>
            <div className="relative w-48 h-48 flex items-center justify-center mb-8 z-10">
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
            <Link
              to="/plan"
              className="w-full md:w-auto px-8 py-4 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container btn-squish transition-all flex items-center justify-center gap-2 z-10 border border-secondary"
            >
              <span className="material-symbols-outlined text-lg">science</span>
              {t("home_readiness_btn")}
            </Link>
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
              {dashboard.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  icon={task.icon}
                  title={copy.tasks[task.id]?.title ?? task.title}
                  subtitle={copy.tasks[task.id]?.subtitle ?? task.subtitle}
                  done={task.status === "done"}
                  active={task.status === "active"}
                  openLabel={copy.open}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="md:col-span-4 flex flex-col gap-stack-md mt-stack-md md:mt-4">
          <section className="bg-surface-container-high border border-outline-variant rounded-tr-[40px] p-6 flex flex-col gap-3 relative overflow-hidden hover:border-secondary transition-colors">
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

          <section className="bg-surface-container-lowest border border-outline-variant p-6 flex flex-col gap-4 rounded-bl-[40px] hover:border-primary transition-colors">
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
            <button className="w-full mt-4 py-3 bg-surface text-primary border border-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-inverse-surface hover:text-on-primary transition-colors flex items-center justify-center gap-2 btn-squish cursor-pointer">
              {t("home_focus_btn")}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
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
}: {
  icon: string;
  title: string;
  subtitle: string;
  done?: boolean;
  active?: boolean;
  openLabel: string;
}) {
  if (done) {
    return (
      <div className="bg-surface-container-lowest p-5 flex items-center gap-4 border border-outline-variant card-hover">
        <div className="w-12 h-12 organic-shape-1 bg-surface-container flex items-center justify-center text-outline">
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
      className={`bg-surface-container-lowest p-5 flex items-center gap-4 border ${active ? "border-secondary" : "border-outline-variant hover:border-primary transition-colors"} card-hover`}
    >
      <div
        className={`w-12 h-12 ${active ? "organic-shape-2 bg-secondary text-on-secondary shadow-sm" : "organic-shape-1 bg-surface-container text-secondary"} flex items-center justify-center`}
      >
        <span className="material-symbols-outlined">{icon}</span>
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

function getHomeCopy(language: string) {
  if (language === "KZ") {
    return {
      accountLabel: "Оқушы аккаунты",
      open: "Ашу",
      nextExamDay: "Сенбі",
      nextExamDescription: "НИШ/БИЛ/РФМШ бойынша толық форматтағы жаттығу тесті.",
      focusTitle: "Логикалық есептер",
      focusDescription: "Соңғы тесттердегі дәлдік 50%-дан төмен.",
      tasks: {
        quantitative: {
          title: "НИШ: Сандық сипаттамалар",
          subtitle: "Математикалық және логикалық талдау",
        },
        reading: {
          title: "БИЛ: Оқу сауаттылығы",
          subtitle: "Қазақ және орыс мәтіндерін түсіну",
        },
        functions: {
          title: "РФМШ: Функциялар және графиктер",
          subtitle: "Күрделі есептерге дайындық",
        },
      } as Record<string, { title: string; subtitle: string }>,
    };
  }

  if (language === "RU") {
    return {
      accountLabel: "Аккаунт ученика",
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
