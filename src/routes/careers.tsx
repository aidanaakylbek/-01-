import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers - AI-Sana" },
      {
        name: "description",
        content: "Careers and open roles at AI-Sana.",
      },
    ],
  }),
  component: Careers,
});

function Careers() {
  const { language } = useLanguage();
  const copy =
    language === "KZ"
      ? {
          eyebrow: "Команда",
          title: "Вакансиялар",
          body: "Біз мектеп оқушыларына қолжетімді дайындық беретін платформа құрып жатырмыз. Білім теңдігі миссиясы сізге жақын болса, танысуға қуаныштымыз.",
          emptyTitle: "Қазір ашық вакансия жоқ",
          emptyText: "AI-Sana командасында жаңа позициялар пайда болғанда, осы бетті жаңартамыз.",
        }
      : language === "RU"
        ? {
            eyebrow: "Команда",
            title: "Вакансии",
            body: "Мы строим платформу для доступной подготовки школьников. Если вам близка миссия образовательного равенства, будем рады познакомиться.",
            emptyTitle: "Открытых вакансий пока нет",
            emptyText: "Мы обновим эту страницу, когда появятся новые позиции в команде AI-Sana.",
          }
        : {
            eyebrow: "Careers",
            title: "Careers",
            body: "We are building a platform for accessible student preparation. If educational equity matters to you, we would be glad to meet.",
            emptyTitle: "No open roles yet",
            emptyText: "We will update this page when new AI-Sana team positions appear.",
          };

  return (
    <GameLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <GameCard className="overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <span className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
          {copy.eyebrow}
          </span>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">{copy.title}</h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold text-[#EDE9FE]">{copy.body}</p>
        </GameCard>
        <GameCard className="bg-white/95">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FACC15] text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]">
            <span className="material-symbols-outlined text-3xl">work</span>
          </div>
          <h2 className="mt-5 text-3xl font-black text-[#1E1B4B]">{copy.emptyTitle}</h2>
          <p className="mt-3 max-w-2xl font-semibold leading-7 text-[#6B5E8F]">{copy.emptyText}</p>
        </GameCard>
      </div>
    </GameLayout>
  );
}

