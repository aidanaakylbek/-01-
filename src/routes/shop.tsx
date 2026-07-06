import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — AI-Sana" }] }),
  component: ShopPage,
});

const rewards = [
  ["Avatar frames", "🖼️", 180],
  ["Mascot outfits", "🧥", 320],
  ["Themes", "🎨", 450],
  ["Streak freeze", "🧊", 250],
  ["Badge effects", "✨", 500],
  ["Reward chest", "🎁", 600],
];

function ShopPage() {
  const { language } = useLanguage();
  const title =
    language === "RU" ? "Магазин наград" : language === "EN" ? "Rewards Shop" : "Сыйлық дүкені";
  const subtitle =
    language === "RU"
      ? "Трать Sana Coins на стиль профиля и игровые бонусы."
      : language === "EN"
        ? "Spend Sana Coins on profile style and game boosts."
        : "Sana Coins арқылы профиль стилін және ойын бонустарын ал.";

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            💎 1280 Sana Coins
          </p>
          <h1 className="mt-2 text-5xl font-black">{title}</h1>
          <p className="mt-3 max-w-2xl font-semibold text-[#DDD6FE]">{subtitle}</p>
        </GameCard>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rewards.map(([name, icon, price]) => (
            <GameCard key={name as string}>
              <div className="text-6xl">{icon}</div>
              <h2 className="mt-4 text-2xl font-black">{name}</h2>
              <p className="mt-2 font-black text-[#8B5CF6]">💎 {price}</p>
              <button className="mt-5 w-full rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]">
                Unlock
              </button>
            </GameCard>
          ))}
        </section>
      </div>
    </GameLayout>
  );
}
