import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/explain-solution")({
  head: () => ({ meta: [{ title: "AI Explanation — AI-Sana" }] }),
  component: AIExplanationPage,
});

function AIExplanationPage() {
  const { language } = useLanguage();
  const c =
    language === "RU"
      ? {
          title: "AI-Sana объясняет ошибку",
          coach: "Не страшно ошибаться. Важно понять ход решения.",
          steps: [
            ["Қай жерде қате кетті?", "Ты выбрал 40, потому что умножил 80 на 0.5 вместо 0.25."],
            ["Дұрыс шешу жолы", "25% — это 1/4. Поэтому 80 делим на 4 и получаем 20."],
            ["Ұқсас мысал", "Найди 25% от 120: 120 ÷ 4 = 30."],
            ["Қайта көріп шық", "Повтори: 10%, 25%, 50%."],
          ],
        }
      : language === "EN"
        ? {
            title: "AI-Sana explains the mistake",
            coach: "Mistakes are fine. The goal is to understand the method.",
            steps: [
              ["Where did it go wrong?", "You chose 40 because you used 0.5 instead of 0.25."],
              ["Correct method", "25% is 1/4. So divide 80 by 4 and get 20."],
              ["Similar example", "Find 25% of 120: 120 ÷ 4 = 30."],
              ["Review again", "Repeat: 10%, 25%, 50%."],
            ],
          }
        : {
            title: "AI-Sana қатеңді түсіндіреді",
            coach: "Қателесу қорқынышты емес. Ең маңыздысы — шешу жолын түсіну.",
            steps: [
              ["Қай жерде қате кетті?", "Сен 40 деп таңдадың, себебі 0.25 орнына 0.5 қолдандың."],
              ["Дұрыс шешу жолы", "25% — төрттен бір бөлік. 80 ÷ 4 = 20."],
              ["Ұқсас мысал", "120 санының 25%-ын тап: 120 ÷ 4 = 30."],
              ["Қайта көріп шық", "10%, 25%, 50% тақырыптарын қайтала."],
            ],
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <MascotCoach text={c.coach} />
        <GameCard>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
            Қатеңді AI-Sana түсіндіреді
          </p>
          <h1 className="mt-2 text-4xl font-black md:text-6xl">{c.title}</h1>
        </GameCard>
        <div className="grid gap-4">
          {c.steps.map(([title, text], index) => (
            <GameCard key={title}>
              <div className="flex gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#8B5CF6] text-xl font-black text-white shadow-[0_5px_0_#5B21B6]">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{title}</h2>
                  <p className="mt-2 text-lg font-semibold text-[#6B5E8F]">{text}</p>
                </div>
              </div>
            </GameCard>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
