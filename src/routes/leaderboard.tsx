import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — AI-Sana" }] }),
  component: LeaderboardPage,
});

const students = [
  ["Сен", 0, "🔥 0"],
  ["Рейтинг сабақтан кейін ашылады", 0, "🔥 0"],
];

function LeaderboardPage() {
  const { language } = useLanguage();
  const c =
    language === "RU"
      ? {
          title: "Purple League",
          subtitle: "Собирай XP и поднимайся в рейтинге недели.",
          coach: "Рейтинг алғашқы сабақтан кейін жаңарады.",
          weekly: "Недельный рейтинг",
        }
      : language === "EN"
        ? {
            title: "Purple League",
            subtitle: "Earn XP and climb this week's leaderboard.",
            coach: "Leaderboard starts updating after your first lesson.",
            weekly: "Weekly leaderboard",
          }
        : {
            title: "Purple League",
            subtitle: "XP жинап, апталық рейтингте жоғары көтеріл.",
            coach: "Рейтинг алғашқы сабақтан кейін жаңарады.",
            weekly: "Апталық рейтинг",
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            Leaderboard
          </p>
          <h1 className="mt-2 text-5xl font-black">{c.title}</h1>
          <p className="mt-3 text-lg font-semibold text-[#DDD6FE]">{c.subtitle}</p>
        </GameCard>
        <MascotCoach text={c.coach} />
        <GameCard>
          <h2 className="text-2xl font-black">{c.weekly}</h2>
          <div className="mt-5 space-y-3">
            {students.map(([name, xp, streak], index) => (
              <div
                key={name}
                className={`flex items-center gap-4 rounded-[24px] border-2 p-4 ${
                  name === "Сен" ? "border-[#FACC15] bg-[#FFF7CC]" : "border-[#DDD6FE] bg-white"
                }`}
              >
                <div
                  className={`grid h-14 w-14 place-items-center rounded-full text-xl font-black text-white ${
                    index === 0 ? "bg-[#FACC15] text-[#1E1B4B]" : "bg-[#8B5CF6]"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-black">{name}</p>
                  <ProgressBar value={Math.min(100, Number(xp) / 40)} />
                </div>
                <div className="text-right">
                  <p className="font-black text-[#6D28D9]">{xp} XP</p>
                  <p className="font-bold text-[#6B5E8F]">{streak}</p>
                </div>
              </div>
            ))}
          </div>
        </GameCard>
      </div>
    </GameLayout>
  );
}
