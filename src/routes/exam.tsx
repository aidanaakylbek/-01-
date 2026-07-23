import { createFileRoute, Link } from "@tanstack/react-router";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/exam")({
  head: () => ({ meta: [{ title: "Monthly Test — AI-Sana" }] }),
  component: MonthlyTestPage,
});

function MonthlyTestPage() {
  const { language } = useLanguage();
  const c =
    language === "RU"
      ? {
          title: "Итоговый тест",
          subtitle: "Проверь прогресс по основным предметам за месяц.",
          start: "Начать тест",
          reward: "Итог после прохождения",
          sections: ["Математика", "Логика", "Чтение", "Английский"],
          badge: "Значок: Purple Solver",
        }
      : language === "EN"
        ? {
            title: "Monthly Test",
            subtitle: "Check your progress across the main subjects.",
            start: "Start test",
            reward: "Result after completion",
            sections: ["Math", "Logic", "Reading", "English"],
            badge: "Badge: Purple Solver",
          }
        : {
            title: "Айлық қорытынды тест",
            subtitle: "Негізгі пәндер бойынша айлық прогресті тексер.",
            start: "Тестті бастау",
            reward: "Аяқтағаннан кейінгі нәтиже",
            sections: ["Математика", "Логика", "Оқу", "Ағылшын"],
            badge: "Белгі: Purple Solver",
          };

  return (
    <GameLayout>
      <section className="overflow-hidden rounded-[36px] border-2 border-[#FACC15] bg-[#1E1B4B] p-6 text-white shadow-[0_14px_0_#0F0B2E] md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FACC15]">
              Final Challenge
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">{c.title}</h1>
            <p className="mt-4 text-xl font-bold text-[#DDD6FE]">{c.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-2xl bg-[#FACC15] px-7 py-4 font-black text-[#1E1B4B] shadow-[0_7px_0_#CA8A04]">
                {c.start}
              </button>
              <Link
                to="/progress"
                className="rounded-2xl border-2 border-white/50 px-7 py-4 font-black text-white"
              >
                Progress
              </Link>
            </div>
          </div>
          <div className="rounded-[32px] border-2 border-[#FACC15]/70 bg-white/10 p-6 text-center">
            <div className="text-8xl reward-pop">🏆</div>
            <h2 className="mt-4 text-2xl font-black">{c.reward}</h2>
            <p className="mt-2 text-[#FACC15] font-black">+500 XP · 💎 250</p>
            <p className="mt-2 text-[#DDD6FE]">{c.badge}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-4">
        {c.sections.map((section, index) => (
          <GameCard key={section}>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#8B5CF6] text-2xl font-black text-white shadow-[0_5px_0_#5B21B6]">
              {index + 1}
            </div>
            <h3 className="mt-4 text-xl font-black">{section}</h3>
            <ProgressBar value={[80, 65, 72, 58][index]} />
          </GameCard>
        ))}
      </section>
    </GameLayout>
  );
}
