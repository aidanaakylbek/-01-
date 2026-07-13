import { createFileRoute, Link } from "@tanstack/react-router";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - AI-Sana" },
      {
        name: "description",
        content: "About AI-Sana and its mission for exam preparation.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { language } = useLanguage();
  const copy =
    language === "KZ"
      ? {
          title: "Біз туралы",
          body: "AI-Sana НЗМ, БИЛ және РФММ-ға дайындалатын әр оқушыға көмектеседі: диагностика, жеке оқу жоспары және ата-аналарға түсінікті есептер арқылы.",
          cards: [
            ["psychology", "Диагностика", "Оқушының күшті жақтары мен білім олқылықтарын табамыз."],
            [
              "route",
              "Жоспар",
              "Бүгін нені оқу керек және әрі қарай қалай жылжу керегін көрсетеміз.",
            ],
            ["family_restroom", "Ата-аналар", "Баланың прогресі туралы қарапайым есептер береміз."],
          ],
          start: "Бастау",
        }
      : language === "RU"
        ? {
            title: "О нас",
            body: "AI-Sana помогает каждому ученику готовиться к НИШ, БИЛ и РФМШ через диагностику, персональный учебный план и понятные отчеты для родителей.",
            cards: [
              ["psychology", "Диагностика", "Находим сильные стороны и пробелы ученика."],
              ["route", "План", "Показываем, что учить сегодня и как двигаться дальше."],
              ["family_restroom", "Родители", "Даем простые отчеты о прогрессе ребенка."],
            ],
            start: "Начать",
          }
        : {
            title: "About",
            body: "AI-Sana helps every student prepare for NIS, BIL, and NSPM through diagnostics, a personalized study plan, and clear parent reports.",
            cards: [
              ["psychology", "Diagnostics", "We find each student's strengths and knowledge gaps."],
              ["route", "Plan", "We show what to study today and how to move forward."],
              [
                "family_restroom",
                "Parents",
                "We provide simple reports about the student's progress.",
              ],
            ],
            start: "Start",
          };

  return (
    <GameLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <GameCard className="overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <span className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            AI-Sana
          </span>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">{copy.title}</h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold text-[#EDE9FE]">{copy.body}</p>
          <Link
            to="/register"
            className="mt-8 inline-flex rounded-2xl bg-[#FACC15] px-8 py-4 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] transition hover:-translate-y-0.5"
          >
            {copy.start}
          </Link>
        </GameCard>

        <div className="grid gap-5 md:grid-cols-3">
          {copy.cards.map(([icon, title, text]) => (
            <GameCard key={title} className="bg-white/95">
              <span className="material-symbols-outlined text-4xl text-[#6D28D9]">{icon}</span>
              <h2 className="mt-4 text-2xl font-black text-[#1E1B4B]">{title}</h2>
              <p className="mt-3 font-semibold leading-7 text-[#6B5E8F]">{text}</p>
            </GameCard>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}

