import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Aibi" },
      {
        name: "description",
        content: "About Aibi and its mission for exam preparation.",
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
          body: "Aibi НИШ, БИЛ және РФМШ-ға дайындалатын әр оқушыға көмектеседі: диагностика, жеке оқу жоспары және ата-аналарға түсінікті есептер арқылы.",
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
            body: "Aibi помогает каждому ученику готовиться к НИШ, БИЛ и РФМШ через диагностику, персональный учебный план и понятные отчеты для родителей.",
            cards: [
              ["psychology", "Диагностика", "Находим сильные стороны и пробелы ученика."],
              ["route", "План", "Показываем, что учить сегодня и как двигаться дальше."],
              ["family_restroom", "Родители", "Даем простые отчеты о прогрессе ребенка."],
            ],
            start: "Начать",
          }
        : {
            title: "About",
            body: "Aibi helps every student prepare for NIS, BIL, and NSPM through diagnostics, a personalized study plan, and clear parent reports.",
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
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
          Aibi
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-4">
          {copy.title}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-6">{copy.body}</p>
        <div className="grid md:grid-cols-3 gap-gutter mt-stack-lg">
          {copy.cards.map(([icon, title, text]) => (
            <div
              key={title}
              className="border border-outline-variant bg-surface-container-lowest p-6"
            >
              <span className="material-symbols-outlined text-secondary text-3xl">{icon}</span>
              <h2 className="font-headline-md text-headline-md text-primary mt-4">{title}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-3">{text}</p>
            </div>
          ))}
        </div>
        <Link
          to="/register"
          className="inline-flex mt-stack-lg bg-secondary text-on-secondary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest"
        >
          {copy.start}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
