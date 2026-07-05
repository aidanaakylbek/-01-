import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { getSubject } from "@/data/subjects";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/subjects/$subjectId")({
  loader: ({ params }) => {
    const subject = getSubject(params.subjectId);
    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.subject.title.EN ?? "Subject"} — AI-Sana` },
      {
        name: "description",
        content: loaderData?.subject.description.EN ?? "AI-Sana subject modules and topics.",
      },
    ],
  }),
  component: SubjectPage,
});

const difficultyCopy = {
  basic: { EN: "Basic", KZ: "Бастапқы", RU: "Базовый" },
  medium: { EN: "Medium", KZ: "Орташа", RU: "Средний" },
  advanced: { EN: "Advanced", KZ: "Күрделі", RU: "Сложный" },
};

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { language } = useLanguage();
  const copy = getSubjectPageCopy(language);

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <Link
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md mb-stack-md"
          to="/subjects"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {copy.back}
        </Link>

        <section className="relative overflow-hidden border border-outline-variant bg-surface-container-lowest p-7 md:p-10 mb-stack-lg shadow-[12px_12px_0_var(--secondary-container)]">
          <div className="absolute right-6 top-6 hidden h-20 w-20 border-r-2 border-t-2 border-secondary md:block" />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {subject.exam} · {copy.learningPath}
              </p>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-3">
                {subject.title[language]}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl">
                {subject.description[language]}
              </p>
            </div>
            <div className="w-16 h-16 bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-4xl">{subject.icon}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 mb-stack-md">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {copy.chooseTopic}
              </p>
              <h2 className="font-headline-md text-headline-md text-primary mt-2">
                {copy.modules}
              </h2>
            </div>
            <Link
              className="hidden sm:inline-flex bg-primary text-on-primary px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary transition-colors"
              to="/plan"
            >
              {copy.practice}
            </Link>
          </div>

          <div className="flex flex-col gap-stack-md">
            {subject.modules.map((module, moduleIndex) => (
              <article
                className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8"
                key={module.id}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-outline-variant pb-5 mb-5">
                  <div>
                    <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      {copy.module} {moduleIndex + 1}
                    </p>
                    <h3 className="font-headline-md text-headline-md text-primary mt-2">
                      {module.title[language]}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                      {module.description[language]}
                    </p>
                  </div>
                  <span className="border border-outline-variant px-3 py-2 font-label-md text-label-md text-on-surface-variant shrink-0">
                    {module.topics.length} {copy.topics}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {module.topics.map((topic, topicIndex) => (
                    <div
                      className="group relative overflow-hidden border border-outline-variant bg-surface p-5 transition-all hover:-translate-y-1 hover:border-secondary hover:shadow-[8px_8px_0_var(--secondary-container)]"
                      key={topic.id}
                    >
                      <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center bg-surface-container-high font-title-md text-title-md text-primary">
                        {topicIndex + 1}
                      </div>
                      <div className="pr-14">
                        <span className="inline-flex bg-primary-container text-on-primary-container px-3 py-1 font-label-sm text-label-sm whitespace-nowrap">
                          {difficultyCopy[topic.difficulty][language]}
                        </span>
                        <h4 className="font-title-lg text-title-lg text-primary mt-4">
                          {topic.title[language]}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-3 min-h-[56px]">
                          {topic.description[language]}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {topic.lesson ? (
                          <Link
                            className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors"
                            params={{ subjectId: subject.id, topicId: topic.id }}
                            to="/subjects/$subjectId/$topicId"
                          >
                            {copy.openLesson}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        ) : (
                          <Link
                            className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
                            to="/plan"
                          >
                            {copy.start}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        )}
                        {topic.lesson ? (
                          <span className="inline-flex items-center gap-2 border border-outline-variant px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">quiz</span>
                            {copy.hasTest}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function getSubjectPageCopy(language: "EN" | "KZ" | "RU") {
  if (language === "KZ") {
    return {
      back: "Пәндерге оралу",
      learningPath: "оқу жолы",
      chooseTopic: "Тақырып таңда",
      modules: "Модульдер",
      module: "Модуль",
      topics: "тақырып",
      start: "Тақырыпқа кіру",
      openLesson: "Сабақты ашу",
      hasTest: "тест бар",
      practice: "Жаттығу бастау",
    };
  }

  if (language === "RU") {
    return {
      back: "Назад к предметам",
      learningPath: "учебный путь",
      chooseTopic: "Выберите тему",
      modules: "Модули",
      module: "Модуль",
      topics: "тем",
      start: "Открыть тему",
      openLesson: "Открыть урок",
      hasTest: "есть тест",
      practice: "Начать практику",
    };
  }

  return {
    back: "Back to subjects",
    learningPath: "learning path",
    chooseTopic: "Choose a topic",
    modules: "Modules",
    module: "Module",
    topics: "topics",
    start: "Open topic",
    openLesson: "Open lesson",
    hasTest: "has test",
    practice: "Start practice",
  };
}
