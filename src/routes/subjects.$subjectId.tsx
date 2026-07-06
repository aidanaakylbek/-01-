import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
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
      { name: "description", content: "AI-Sana subject path." },
    ],
  }),
  component: SubjectPage,
});

const difficulty = {
  basic: { KZ: "Бастапқы", RU: "Базовый", EN: "Basic" },
  medium: { KZ: "Орташа", RU: "Средний", EN: "Medium" },
  advanced: { KZ: "Күрделі", RU: "Сложный", EN: "Advanced" },
};

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { language } = useLanguage();
  const c =
    language === "RU"
      ? {
          back: "Назад к карте",
          coach: "Открывай темы по порядку: так легче сохранить серию.",
          modules: "Модули",
          openLesson: "Открыть урок",
          practice: "Практика",
          test: "Тест есть",
        }
      : language === "EN"
        ? {
            back: "Back to map",
            coach: "Unlock topics in order: it is easier to keep your streak.",
            modules: "Modules",
            openLesson: "Open lesson",
            practice: "Practice",
            test: "Has test",
          }
        : {
            back: "Картаға оралу",
            coach: "Тақырыптарды ретімен аш: серияңды сақтау жеңіл болады.",
            modules: "Модульдер",
            openLesson: "Сабақты ашу",
            practice: "Жаттығу",
            test: "Тест бар",
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <Link to="/subjects" className="inline-flex rounded-2xl bg-white px-4 py-3 font-black text-[#6D28D9] shadow-[0_5px_0_rgba(109,40,217,0.12)]">
          ← {c.back}
        </Link>
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                {subject.exam} Quest
              </p>
              <h1 className="mt-2 text-4xl font-black md:text-6xl">{subject.title[language]}</h1>
              <p className="mt-3 max-w-2xl text-lg font-semibold text-[#EDE9FE]">
                {subject.description[language]}
              </p>
            </div>
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white/20 text-white">
              <span className="material-symbols-outlined text-6xl">{subject.icon}</span>
            </div>
          </div>
        </GameCard>
        <MascotCoach text={c.coach} />
        <section className="space-y-5">
          {subject.modules.map((module, moduleIndex) => (
            <GameCard key={module.id}>
              <div className="mb-6 flex flex-col gap-3 border-b-2 border-[#DDD6FE] pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                    {c.modules} {moduleIndex + 1}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{module.title[language]}</h2>
                  <p className="mt-2 font-semibold text-[#6B5E8F]">{module.description[language]}</p>
                </div>
                <span className="rounded-full bg-[#FACC15] px-4 py-2 font-black text-[#1E1B4B]">
                  {module.topics.length * 20} XP
                </span>
              </div>
              <div className="space-y-5">
                {module.topics.map((topic, topicIndex) => {
                  const hasLesson = Boolean(topic.lesson);
                  const locked = !hasLesson && topicIndex > 1;
                  return (
                    <div key={topic.id} className="grid gap-4 md:grid-cols-[90px_1fr] md:items-start">
                      <div className="relative flex justify-center">
                        {topicIndex < module.topics.length - 1 ? (
                          <span className="absolute top-16 h-[calc(100%+1.25rem)] w-3 rounded-full bg-[#DDD6FE]" />
                        ) : null}
                        <div
                          className={`relative z-10 grid h-20 w-20 place-items-center rounded-full text-white shadow-[0_8px_0_#5B21B6] ${
                            locked ? "bg-[#DDD6FE] text-[#8B5CF6]" : "bg-[#8B5CF6]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-4xl">
                            {locked ? "lock" : hasLesson ? "play_arrow" : "star"}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-[26px] border-2 border-[#DDD6FE] bg-white p-5 shadow-[0_7px_0_rgba(109,40,217,0.10)]">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <span className="rounded-full bg-[#F5F3FF] px-3 py-2 text-xs font-black text-[#6D28D9]">
                              {difficulty[topic.difficulty][language]}
                            </span>
                            <h3 className="mt-4 text-2xl font-black">{topic.title[language]}</h3>
                            <p className="mt-2 font-semibold text-[#6B5E8F]">
                              {topic.description[language]}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#C084FC] px-4 py-2 font-black text-white">
                            +20 XP
                          </span>
                        </div>
                        <ProgressBar value={hasLesson ? 68 : locked ? 0 : 30} />
                        <div className="mt-5 flex flex-wrap gap-3">
                          {hasLesson ? (
                            <Link
                              to="/lesson/$subjectId/$topicId"
                              params={{ subjectId: subject.id, topicId: topic.id }}
                              className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
                            >
                              {c.openLesson} →
                            </Link>
                          ) : (
                            <Link
                              to="/plan"
                              className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
                            >
                              {c.practice} →
                            </Link>
                          )}
                          {hasLesson ? (
                            <span className="rounded-2xl border-2 border-[#DDD6FE] px-5 py-3 font-black text-[#6D28D9]">
                              🧩 {c.test}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GameCard>
          ))}
        </section>
      </div>
    </GameLayout>
  );
}
