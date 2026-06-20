import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Aibi" },
      {
        name: "description",
        content: "Aibi privacy policy.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { language } = useLanguage();
  const copy =
    language === "KZ"
      ? {
          eyebrow: "Құжат",
          title: "Құпиялылық саясаты",
          paragraphs: [
            "Aibi оқушы профилін жасау, прогресті өлшеу және оқу ұсыныстарын дайындау үшін ғана қажетті ақпаратты жинайды.",
            "Оқушы нәтижелері, оқу белсенділігі және ата-аналарға арналған есептер дайындықты жақсарту үшін қолданылады және үшінші тараптарға сатылмайды.",
            "Ата-аналар мен оқушылар аккаунт ақпаратын түзету немесе жою туралы Aibi командасына хабарласа алады.",
          ],
        }
      : language === "RU"
        ? {
            eyebrow: "Документ",
            title: "Политика конфиденциальности",
            paragraphs: [
              "Aibi собирает только данные, необходимые для создания профиля ученика, измерения прогресса и подготовки учебных рекомендаций.",
              "Результаты ученика, учебная активность и родительские отчеты используются для улучшения подготовки и не продаются третьим лицам.",
              "Родители и ученики могут запросить исправление или удаление данных аккаунта, связавшись с командой Aibi.",
            ],
          }
        : {
            eyebrow: "Legal",
            title: "Privacy Policy",
            paragraphs: [
              "Aibi collects only the information needed to create a student profile, measure progress, and prepare learning recommendations.",
              "Student results, study activity, and parent reports are used to improve preparation and are not sold to third parties.",
              "Parents and students may request correction or deletion of account information by contacting the Aibi team.",
            ],
          };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
          {copy.eyebrow}
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-4">
          {copy.title}
        </h1>
        <div className="mt-stack-lg space-y-6 font-body-md text-body-md text-on-surface-variant">
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
