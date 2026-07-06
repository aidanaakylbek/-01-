import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { subjects, type Subject } from "@/data/subjects";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — AI-Sana" },
      { name: "description", content: "Gamified AI-Sana subject map." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { language } = useLanguage();
  const location = useLocation();
  if (location.pathname !== "/subjects") return <Outlet />;

  const copy =
    language === "RU"
      ? {
          label: "Карта предметов",
          title: "Выбери экзамен и предмет",
          desc: "Каждый предмет открывается как игровой путь: модули, темы, XP и тесты.",
          coach: "Начни с НИШ математики: сегодня можно закрыть 2 темы.",
          open: "Открыть путь",
          modules: "модуля",
          topics: "тем",
          tracks: [
            ["NIS", "НИШ", "Логика, математика и грамотность"],
            ["BIL", "БИЛ", "Чтение, языки и аналитика"],
            ["NSPM", "РФМШ", "Математика и сложные задачи"],
          ],
        }
      : language === "EN"
        ? {
            label: "Subject Map",
            title: "Choose an exam and subject",
            desc: "Each subject opens as a game path with modules, topics, XP and tests.",
            coach: "Start with NIS Math: you can finish 2 topics today.",
            open: "Open path",
            modules: "modules",
            topics: "topics",
            tracks: [
              ["NIS", "NIS", "Logic, math and literacy"],
              ["BIL", "BIL", "Reading, languages and analysis"],
              ["NSPM", "NSPM", "Math and advanced problems"],
            ],
          }
        : {
            label: "Пән картасы",
            title: "Емтихан мен пәнді таңда",
            desc: "Әр пән ойын жолы сияқты ашылады: модуль, тақырып, XP және тесттер.",
            coach: "НЗМ математикасынан баста: бүгін 2 тақырып жабуға болады.",
            open: "Жолды ашу",
            modules: "модуль",
            topics: "тақырып",
            tracks: [
              ["NIS", "НЗМ", "Логика, математика және сауаттылық"],
              ["BIL", "БИЛ", "Оқу, тілдер және талдау"],
              ["NSPM", "РФММ", "Математика және күрделі есептер"],
            ],
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            {copy.label}
          </p>
          <h1 className="mt-2 text-4xl font-black md:text-6xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-lg font-semibold text-[#EDE9FE]">{copy.desc}</p>
        </GameCard>
        <MascotCoach text={copy.coach} />
        <section className="space-y-5">
          {copy.tracks.map(([trackId, trackTitle, trackDesc]) => {
            const trackSubjects = subjects.filter(
              (subject) => subject.exam === trackId || subject.exam === "ALL",
            );
            return (
              <GameCard key={trackId} className="scroll-mt-24" id={trackId.toLowerCase()}>
                <div className="mb-5 flex flex-col gap-3 border-b-2 border-[#DDD6FE] pb-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                      {trackTitle}
                    </p>
                    <h2 className="mt-1 text-3xl font-black">{trackDesc}</h2>
                  </div>
                  <span className="rounded-full bg-[#F5F3FF] px-4 py-2 font-black text-[#6D28D9]">
                    {trackSubjects.length} пән
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {trackSubjects.map((subject) => (
                    <SubjectCard key={`${trackId}-${subject.id}`} copy={copy} subject={subject} />
                  ))}
                </div>
              </GameCard>
            );
          })}
        </section>
      </div>
    </GameLayout>
  );
}

function SubjectCard({
  copy,
  subject,
}: {
  copy: { open: string; modules: string; topics: string };
  subject: Subject;
}) {
  const { language } = useLanguage();
  const topicCount = subject.modules.reduce((sum, module) => sum + module.topics.length, 0);
  return (
    <Link
      to="/subjects/$subjectId"
      params={{ subjectId: subject.id }}
      className="group rounded-[28px] border-2 border-[#DDD6FE] bg-white p-5 shadow-[0_8px_0_rgba(109,40,217,0.12)] transition hover:-translate-y-1 hover:border-[#8B5CF6]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#8B5CF6] text-white shadow-[0_7px_0_#5B21B6]">
          <span className="material-symbols-outlined text-3xl">{subject.icon}</span>
        </div>
        <span className="rounded-full bg-[#FACC15] px-3 py-2 text-sm font-black text-[#1E1B4B]">
          +{topicCount * 20} XP
        </span>
      </div>
      <h3 className="mt-5 text-2xl font-black">{subject.title[language]}</h3>
      <p className="mt-2 font-semibold text-[#6B5E8F]">{subject.description[language]}</p>
      <ProgressBar value={Math.min(85, topicCount * 12)} />
      <div className="mt-5 flex items-center justify-between border-t-2 border-[#DDD6FE] pt-4">
        <span className="text-sm font-black text-[#6B5E8F]">
          {subject.modules.length} {copy.modules} · {topicCount} {copy.topics}
        </span>
        <span className="font-black text-[#6D28D9]">{copy.open} →</span>
      </div>
    </Link>
  );
}
