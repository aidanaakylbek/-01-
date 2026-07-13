import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - AI-Sana" },
      {
        name: "description",
        content: "AI-Sana privacy policy.",
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
            "AI-Sana оқушы профилін жасау, прогресті өлшеу және оқу ұсыныстарын дайындау үшін ғана қажетті ақпаратты жинайды.",
            "Оқушы нәтижелері, оқу белсенділігі және ата-аналарға арналған есептер дайындықты жақсарту үшін қолданылады және үшінші тараптарға сатылмайды.",
            "Ата-аналар мен оқушылар аккаунт ақпаратын түзету немесе жою туралы AI-Sana командасына хабарласа алады.",
          ],
        }
      : language === "RU"
        ? {
            eyebrow: "Документ",
            title: "Политика конфиденциальности",
            paragraphs: [
              "AI-Sana собирает только данные, необходимые для создания профиля ученика, измерения прогресса и подготовки учебных рекомендаций.",
              "Результаты ученика, учебная активность и родительские отчеты используются для улучшения подготовки и не продаются третьим лицам.",
              "Родители и ученики могут запросить исправление или удаление данных аккаунта, связавшись с командой AI-Sana.",
            ],
          }
        : {
            eyebrow: "Legal",
            title: "Privacy Policy",
            paragraphs: [
              "AI-Sana collects only the information needed to create a student profile, measure progress, and prepare learning recommendations.",
              "Student results, study activity, and parent reports are used to improve preparation and are not sold to third parties.",
              "Parents and students may request correction or deletion of account information by contacting the AI-Sana team.",
            ],
          };

  return (
    <GameLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <GameCard className="overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <span className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            {copy.eyebrow}
          </span>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">{copy.title}</h1>
        </GameCard>
        <GameCard className="space-y-5 bg-white/95">
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-5 font-semibold leading-8 text-[#4B3D73]">
              {paragraph}
            </p>
          ))}
        </GameCard>
      </div>
    </GameLayout>
  );
}

