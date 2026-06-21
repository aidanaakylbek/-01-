import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";

export const Route = createFileRoute("/reports")({
  loader: () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "Parent Report - AI-Sana" },
      {
        name: "description",
        content: "Parent-facing report with student progress, risks, and next actions.",
      },
    ],
  }),
  component: ParentReport,
});

function ParentReport() {
  const { language } = useLanguage();
  const dashboard = Route.useLoaderData();
  const copy =
    language === "RU"
      ? {
          title: "Отчет для родителей",
          subtitle:
            "Понятный отчет для родителей: как идет подготовка, где есть риск и что делать дальше.",
          student: "Ученик",
          grade: "7 класс",
          readiness: "Готовность",
          readinessText:
            "Aidana идет по плану. Главный риск сейчас - логические задачи и количественные сравнения.",
          weeklySummary: "Итоги недели",
          parentAction: "Что сделать родителю",
          nextExam: "Следующий пробный экзамен",
          nextExamText: "Суббота, 10:00. Полноформатный тест по НИШ/БИЛ/РФМШ.",
          openPlan: "Открыть план",
          openProgress: "Посмотреть прогресс",
          risks: "Зоны риска",
          recommendations: "Рекомендации на неделю",
          lessonsCompleted: "Уроки завершены",
          studyTime: "Время обучения",
          averageAccuracy: "Средняя точность",
          hourShort: "ч",
          gradeSuffix: "класс",
          nextExamLine: "Суббота, 10:00. Полноформатный тест по НИШ/БИЛ/РФМШ.",
          parentRecommendation:
            "Попросите ученика показать две самые сложные задачи недели и объяснить, как он исправил ошибки.",
          riskLevels: { High: "Высокий", Medium: "Средний" },
          risksList: [
            {
              title: "Логические задачи",
              detail: "Точность снизилась до 45%. Нужна короткая ежедневная практика.",
            },
            {
              title: "Количественные сравнения",
              detail: "Показатель нестабилен: 52%. Повторить стратегии сравнения.",
            },
            {
              title: "Выносливость на пробном экзамене",
              detail: "На этой неделе нужен один полный тест по времени.",
            },
          ],
          recommendationsList: [
            "Выделить 25 минут на логику в понедельник, среду и пятницу.",
            "После каждой практики разобрать две ошибки вслух.",
            "Оставить субботнее утро свободным для полного пробного экзамена.",
          ],
        }
      : language === "KZ"
        ? {
            title: "Ата-ана есебі",
            subtitle:
              "Ата-аналарға арналған түсінікті есеп: дайындық барысы, тәуекелдер және келесі қадамдар.",
            student: "Оқушы",
            grade: "7 сынып",
            readiness: "Дайындық",
            readinessText:
              "Aidana жоспар бойынша келе жатыр. Негізгі тәуекел - логикалық есептер және сандық салыстыру.",
            weeklySummary: "Апта қорытындысы",
            parentAction: "Ата-ана не істей алады",
            nextExam: "Келесі сынақ емтихан",
            nextExamText: "Сенбі, 10:00. НИШ/БИЛ/РФМШ бойынша толық тест.",
            openPlan: "Жоспарды ашу",
            openProgress: "Прогресті көру",
            risks: "Тәуекел аймақтары",
            recommendations: "Аптаға ұсыныстар",
            lessonsCompleted: "Аяқталған сабақтар",
            studyTime: "Оқу уақыты",
            averageAccuracy: "Орташа дәлдік",
            hourShort: "сағ",
            gradeSuffix: "сынып",
            nextExamLine: "Сенбі, 10:00. НИШ/БИЛ/РФМШ бойынша толық тест.",
            parentRecommendation:
              "Оқушыдан осы аптадағы ең қиын екі есепті көрсетіп, қатесін қалай түзеткенін түсіндіруін сұраңыз.",
            riskLevels: { High: "Жоғары", Medium: "Орташа" },
            risksList: [
              {
                title: "Логикалық есептер",
                detail: "Дәлдік 45%-ға түсті. Күн сайын қысқа жаттығу қажет.",
              },
              {
                title: "Сандық салыстырулар",
                detail: "Көрсеткіш тұрақсыз: 52%. Салыстыру стратегияларын қайталау керек.",
              },
              {
                title: "Сынақ емтиханға төзімділік",
                detail: "Осы аптада уақытпен бір толық тест орындау қажет.",
              },
            ],
            recommendationsList: [
              "Дүйсенбі, сәрсенбі және жұма күндері логикаға 25 минут бөлу.",
              "Әр жаттығудан кейін екі қатені дауыстап талдау.",
              "Сенбі таңын толық сынақ емтиханға бос қалдыру.",
            ],
          }
        : {
            title: "Parent Report",
            subtitle:
              "A clear report for parents: how preparation is going, where risk exists, and what to do next.",
            student: "Student",
            grade: "Grade 7",
            readiness: "Readiness",
            readinessText:
              "Aidana is on track. The main risk right now is logic problems and quantitative comparisons.",
            weeklySummary: "Weekly Summary",
            parentAction: "Parent Action",
            nextExam: "Next Mock Exam",
            nextExamText: "Saturday, 10:00. Full-length NIS/BIL/NSPM practice test.",
            openPlan: "Open Plan",
            openProgress: "View Progress",
            risks: "Risk Areas",
            recommendations: "Recommendations This Week",
            lessonsCompleted: "Lessons completed",
            studyTime: "Study time",
            averageAccuracy: "Average accuracy",
            hourShort: "h",
            gradeSuffix: "Grade",
            nextExamLine: "Saturday, 10:00. Full-length NIS/BIL/NSPM practice test.",
            parentRecommendation:
              "Ask the student to show the two hardest logic questions from this week and explain how they corrected them.",
            riskLevels: { High: "High", Medium: "Medium" },
            risksList: [
              {
                title: "Logic Problems",
                detail: "Accuracy dropped to 45%. Needs short daily practice.",
              },
              {
                title: "Quantitative Comparisons",
                detail: "Still unstable at 52%. Review comparison strategies.",
              },
              {
                title: "Mock Exam Stamina",
                detail: "Student should practice one full timed test this week.",
              },
            ],
            recommendationsList: [
              "Set aside 25 minutes for logic practice on Monday, Wednesday, and Friday.",
              "Ask the student to explain two mistakes after each practice session.",
              "Keep Saturday morning free for the full mock exam.",
            ],
          };

  const weeklyStats = [
    {
      label: copy.lessonsCompleted,
      value: `${dashboard.completedLessons}/${dashboard.weeklyGoal}`,
      icon: "task_alt",
    },
    { label: copy.studyTime, value: `${dashboard.studyHours} ${copy.hourShort}`, icon: "timer" },
    { label: copy.averageAccuracy, value: `${dashboard.averageAccuracy}%`, icon: "analytics" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background pb-safe">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-stack-lg">
          <div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
              AI-Sana
            </span>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-3">
              {copy.title}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/plan"
              className="bg-secondary text-on-secondary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container transition-colors text-center"
            >
              {copy.openPlan}
            </Link>
            <Link
              to="/progress"
              className="bg-surface text-primary border border-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-high transition-colors text-center"
            >
              {copy.openProgress}
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-lg">
          <div className="lg:col-span-7 bg-surface-container-highest border border-outline-variant p-8 md:p-10 rounded-tr-[40px] rounded-bl-[40px]">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
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
                    strokeDashoffset={251.2 - (251.2 * dashboard.readiness) / 100}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="block font-headline-lg text-headline-lg text-primary">
                    {dashboard.readiness}%
                  </span>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                    {copy.readiness}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                  {copy.student}
                </span>
                <h2 className="font-headline-md text-headline-md text-primary mt-3">
                  {dashboard.account.name}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {language === "EN"
                    ? `${copy.gradeSuffix} ${dashboard.account.grade}`
                    : `${dashboard.account.grade} ${copy.gradeSuffix}`}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-5">
                  {copy.readinessText}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-8 rounded-tr-[40px]">
            <span className="material-symbols-outlined text-secondary text-4xl">
              family_restroom
            </span>
            <h2 className="font-headline-md text-headline-md text-primary mt-4">
              {copy.parentAction}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              {copy.parentRecommendation}
            </p>
            <div className="mt-6 border-t border-outline-variant pt-5">
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                {copy.nextExam}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                {copy.nextExamLine}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
          {weeklyStats.map((item) => (
            <div
              key={item.label}
              className="bg-surface-container-lowest border border-outline-variant p-6"
            >
              <span className="material-symbols-outlined text-secondary text-3xl">{item.icon}</span>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mt-5">
                {item.label}
              </p>
              <p className="font-headline-md text-headline-md text-primary mt-2">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 md:p-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-6">{copy.risks}</h2>
            <div className="flex flex-col gap-4">
              {dashboard.risks.map((risk, index) => {
                const localizedRisk = copy.risksList[index] ?? risk;

                return (
                  <div key={risk.title} className="border border-outline-variant p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-label-md text-label-md text-primary">
                          {localizedRisk.title}
                        </h3>
                        <p className="font-body-md text-sm text-on-surface-variant mt-2">
                          {localizedRisk.detail}
                        </p>
                      </div>
                      <span
                        className={`font-label-sm text-label-sm px-3 py-1 ${
                          risk.level === "High"
                            ? "bg-error-container text-error"
                            : "bg-secondary-fixed text-on-secondary-fixed"
                        }`}
                      >
                        {copy.riskLevels[risk.level]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-6 md:p-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-6">
              {copy.recommendations}
            </h2>
            <div className="flex flex-col gap-4">
              {copy.recommendationsList.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border border-outline-variant bg-surface p-4"
                >
                  <span className="material-symbols-outlined text-secondary">task_alt</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
