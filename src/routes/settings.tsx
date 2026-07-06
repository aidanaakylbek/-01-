import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { AibiMark } from "@/components/aibi-mark";
import { mentorStyles } from "@/lib/ai-mentor";
import { getAccountDashboard, updateMentorStyle } from "@/lib/api/account.functions";
import type { MentorStyle } from "@/lib/account-store.server";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/settings")({
  loader: async () => getAccountDashboard(),
  head: () => ({ meta: [{ title: "Profile — AI-Sana" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const dashboard = Route.useLoaderData();
  const { language } = useLanguage();
  const [mentorStyle, setMentorStyle] = useState<MentorStyle>(dashboard.account.mentorStyle);
  const [status, setStatus] = useState("");
  const title = language === "RU" ? "Профиль ученика" : language === "EN" ? "Student Profile" : "Оқушы профилі";

  const save = async (style: MentorStyle) => {
    setMentorStyle(style);
    setStatus("Saving...");
    try {
      await updateMentorStyle({ data: { mentorStyle: style } });
      setStatus(language === "KZ" ? "Сақталды" : language === "RU" ? "Сохранено" : "Saved");
    } catch {
      setStatus("Try again");
    }
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <AibiMark size="lg" className="h-24 w-24 bg-white" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                  Level 16 · Purple League
                </p>
                <h1 className="mt-2 text-4xl font-black">{title}</h1>
                <p className="mt-1 text-[#EDE9FE]">{dashboard.account.name}</p>
              </div>
            </div>
            <div className="rounded-[24px] bg-white/15 p-5 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[#FACC15]">
                Sana Coins
              </p>
              <p className="text-4xl font-black">💎 1280</p>
            </div>
          </div>
        </GameCard>

        <section className="grid gap-4 md:grid-cols-4">
          <GameCard><p className="font-black text-[#6B5E8F]">XP</p><p className="text-3xl font-black">2450</p></GameCard>
          <GameCard><p className="font-black text-[#6B5E8F]">Streak</p><p className="text-3xl font-black">🔥 12</p></GameCard>
          <GameCard><p className="font-black text-[#6B5E8F]">Badges</p><p className="text-3xl font-black">🏅 8</p></GameCard>
          <GameCard><p className="font-black text-[#6B5E8F]">Accuracy</p><p className="text-3xl font-black">82%</p></GameCard>
        </section>

        <GameCard>
          <h2 className="text-2xl font-black">Study history</h2>
          <ProgressBar value={68} />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Диагностика", "Натурал сандар", "Пайыздар"].map((item) => (
              <div key={item} className="rounded-2xl bg-[#F5F3FF] p-4 font-black">
                ✅ {item}
              </div>
            ))}
          </div>
        </GameCard>

        <GameCard>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">AI mentor style</h2>
            <span className="font-bold text-[#8B5CF6]">{status}</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {mentorStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => save(style.id)}
                className={`rounded-[24px] border-2 p-5 text-left transition ${
                  mentorStyle === style.id
                    ? "border-[#6D28D9] bg-[#EDE9FE] shadow-[0_7px_0_#8B5CF6]"
                    : "border-[#DDD6FE] bg-white hover:bg-[#F5F3FF]"
                }`}
              >
                <p className="text-xl font-black">{style.label[language]}</p>
                <p className="mt-2 font-semibold text-[#6B5E8F]">{style.description[language]}</p>
              </button>
            ))}
          </div>
        </GameCard>
      </div>
    </GameLayout>
  );
}
