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
      { title: `${loaderData?.subject.title.EN ?? "Subject"} — Aibi` },
      {
        name: "description",
        content: loaderData?.subject.description.EN ?? "Aibi subject modules and topics.",
      },
    ],
  }),
  component: SubjectPage,
});

const difficultyCopy = {
  basic: {
    EN: "Basic",
    KZ: "Бастапқы",
    RU: "Базовый",
  },
  medium: {
    EN: "Medium",
    KZ: "Орташа",
    RU: "Средний",
  },
  advanced: {
    EN: "Advanced",
    KZ: "Күрделі",
    RU: "Сложный",
  },
};

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { language } = useLanguage();
  const copy =
    language === "KZ"
      ? {
          back: "Пәндерге оралу",
          modules: "Модульдер",
          module: "Модуль",
          topics: "тақырып",
          start: "Тақырыпқа кіру",
          practice: "Жаттығу бастау",
        }
      : language === "RU"
        ? {
            back: "Назад к предметам",
            modules: "Модули",
            module: "Модуль",
            topics: "тем",
            start: "Открыть тему",
            practice: "Начать практику",
          }
        : {
            back: "Back to subjects",
            modules: "Modules",
            module: "Module",
            topics: "topics",
            start: "Open topic",
            practice: "Start practice",
          };

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

        <section className="border border-outline-variant bg-surface-container-highest rounded-tr-[48px] rounded-bl-[48px] p-8 md:p-10 mb-stack-lg">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {subject.exam}
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
            <h2 className="font-headline-md text-headline-md text-primary">{copy.modules}</h2>
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
                  {module.topics.map((topic) => (
                    <div className="border border-outline-variant bg-surface p-5" key={topic.id}>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-title-lg text-title-lg text-primary">
                          {topic.title[language]}
                        </h4>
                        <span className="bg-primary-container text-on-primary-container px-3 py-1 font-label-sm text-label-sm whitespace-nowrap">
                          {difficultyCopy[topic.difficulty][language]}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                        {topic.description[language]}
                      </p>
                      <Link
                        className="mt-5 inline-flex items-center gap-2 border border-primary text-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
                        to="/plan"
                      >
                        {copy.start}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
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
