import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { subjects, type Subject } from "@/data/subjects";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — AI-Sana" },
      {
        name: "description",
        content: "All AI-Sana subjects with modules and topics for NIS, BIL, and NSPM preparation.",
      },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { language } = useLanguage();
  const location = useLocation();
  if (location.pathname !== "/subjects") {
    return <Outlet />;
  }

  const copy =
    language === "KZ"
      ? {
          label: "Оқу құрылымы",
          title: "Пәндер",
          desc: "Пәнді таңдаңыз. Ішінде модульдер мен нақты тақырыптар бар.",
          modules: "модуль",
          topics: "тақырып",
          subjectsUnit: "пән",
          open: "Пәнге кіру",
          tracks: [
            {
              id: "NIS",
              title: "НИШ",
              desc: "Назарбаев Зияткерлік мектептеріне дайындық пәндері.",
            },
            {
              id: "BIL",
              title: "БИЛ",
              desc: "Білім-Инновация лицейлеріне арналған пәндер.",
            },
            {
              id: "NSPM",
              title: "РФМШ",
              desc: "Республикалық физика-математика мектебіне дайындық пәндері.",
            },
          ],
        }
      : language === "RU"
        ? {
            label: "Структура обучения",
            title: "Предметы",
            desc: "Выберите предмет. Внутри есть модули и конкретные темы.",
            modules: "модулей",
            topics: "тем",
            subjectsUnit: "предметов",
            open: "Открыть предмет",
            tracks: [
              {
                id: "NIS",
                title: "НИШ",
                desc: "Предметы для подготовки в Назарбаев Интеллектуальные школы.",
              },
              {
                id: "BIL",
                title: "БИЛ",
                desc: "Предметы для подготовки в Билим-Инновация лицеи.",
              },
              {
                id: "NSPM",
                title: "РФМШ",
                desc: "Предметы для подготовки в Республиканскую физико-математическую школу.",
              },
            ],
          }
        : {
            label: "Learning structure",
            title: "Subjects",
            desc: "Choose a subject. Each subject has modules and focused topics.",
            modules: "modules",
            topics: "topics",
            subjectsUnit: "subjects",
            open: "Open subject",
            tracks: [
              {
                id: "NIS",
                title: "NIS",
                desc: "Subjects for Nazarbayev Intellectual Schools preparation.",
              },
              {
                id: "BIL",
                title: "BIL",
                desc: "Subjects for Bilim-Innovation Lyceums preparation.",
              },
              {
                id: "NSPM",
                title: "NSPM",
                desc: "Subjects for Republican Physics and Mathematics School preparation.",
              },
            ],
          };

  const getTrackSubjects = (trackId: "NIS" | "BIL" | "NSPM") =>
    subjects.filter((subject) => subject.exam === trackId || subject.exam === "ALL");

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <section className="mb-stack-lg">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            {copy.label}
          </p>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-3">
            {copy.title}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl">
            {copy.desc}
          </p>
        </section>

        <section className="flex flex-col gap-stack-lg">
          {copy.tracks.map((track) => (
            <div
              id={track.id.toLowerCase()}
              className="scroll-mt-28 border border-outline-variant bg-surface-container-lowest p-5 md:p-6"
              key={track.id}
            >
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-outline-variant pb-5 mb-5">
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {track.title}
                  </p>
                  <h2 className="font-headline-md text-headline-md text-primary mt-2">
                    {track.title}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    {track.desc}
                  </p>
                </div>
                <span className="border border-outline-variant px-3 py-2 font-label-md text-label-md text-on-surface-variant self-start md:self-auto">
                  {getTrackSubjects(track.id as "NIS" | "BIL" | "NSPM").length} {copy.subjectsUnit}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {getTrackSubjects(track.id as "NIS" | "BIL" | "NSPM").map((subject) => (
                  <SubjectCard
                    copy={copy}
                    key={`${track.id}-${subject.id}`}
                    subject={subject}
                    trackTitle={track.title}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function SubjectCard({
  copy,
  subject,
  trackTitle,
}: {
  copy: {
    modules: string;
    topics: string;
    subjectsUnit: string;
    open: string;
  };
  subject: Subject;
  trackTitle: string;
}) {
  const { language } = useLanguage();
  const topicCount = subject.modules.reduce((sum, module) => sum + module.topics.length, 0);

  return (
    <Link
      className="group border border-outline-variant bg-surface p-6 min-h-[260px] flex flex-col gap-5 hover:border-secondary hover:shadow-md transition-all"
      params={{ subjectId: subject.id }}
      to="/subjects/$subjectId"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-14 h-14 bg-secondary text-on-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">{subject.icon}</span>
        </div>
        <span className="border border-outline-variant px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {trackTitle}
        </span>
      </div>

      <div>
        <h3 className="font-headline-md text-headline-md text-primary">
          {subject.title[language]}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">
          {subject.description[language]}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
        <p className="font-label-md text-label-md text-on-surface-variant">
          {subject.modules.length} {copy.modules} • {topicCount} {copy.topics}
        </p>
        <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </div>
      <span className="sr-only">{copy.open}</span>
    </Link>
  );
}
