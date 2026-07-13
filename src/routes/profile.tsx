import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AibiMark } from "@/components/aibi-mark";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { mentorStyles } from "@/lib/ai-mentor";
import { useLanguage } from "@/hooks/use-language";
import { logoutAccount } from "@/lib/api/account.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — AI-Sana" }] }),
  component: ProfileRoute,
});

function ProfileRoute() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const c =
    language === "RU"
      ? {
          title: "Профиль ученика",
          subtitle: "Твой уровень, серия, награды и стиль AI-наставника.",
          coach: "Профиль готов. Продолжай серию и забирай награды за уроки!",
          league: "Фиолетовая лига",
          history: "История обучения",
          mentor: "Стиль AI-наставника",
          coins: "Sana Coins",
          logout: "Выйти из аккаунта",
          stats: ["XP", "Серия", "Бейджи", "Точность"],
          lessons: ["Диагностика", "Натуральные числа", "Проценты"],
        }
      : language === "EN"
        ? {
            title: "Student Profile",
            subtitle: "Your level, streak, rewards, and AI mentor style.",
            coach: "Profile is ready. Keep your streak and claim lesson rewards!",
            league: "Purple League",
            history: "Study history",
            mentor: "AI mentor style",
            coins: "Sana Coins",
            logout: "Log out",
            stats: ["XP", "Streak", "Badges", "Accuracy"],
            lessons: ["Diagnostic", "Natural numbers", "Percentages"],
          }
        : {
            title: "Оқушы профилі",
            subtitle: "Деңгейің, күндік серияң, марапаттарың және AI-ментор стилі.",
            coach: "Профиль дайын. Серияңды сақтап, сабақ сыйлықтарын жинай бер!",
            league: "Күлгін лига",
            history: "Оқу тарихы",
            mentor: "AI-ментор стилі",
            coins: "Sana Coins",
            logout: "Аккаунттан шығу",
            stats: ["XP", "Серия", "Белгілер", "Дәлдік"],
            lessons: ["Диагностика", "Натурал сандар", "Пайыздар"],
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
                  Level 16 · {c.league}
                </p>
                <h1 className="mt-2 text-4xl font-black">{c.title}</h1>
                <p className="mt-1 max-w-xl font-semibold text-[#EDE9FE]">{c.subtitle}</p>
              </div>
            </div>
            <div className="rounded-[24px] bg-white/15 p-5 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-[#FACC15]">
                {c.coins}
              </p>
              <p className="text-4xl font-black">💎 1280</p>
              <button
                className="mt-4 rounded-2xl bg-white px-5 py-3 font-black text-[#6D28D9] shadow-[0_5px_0_#C4B5FD] transition hover:-translate-y-0.5"
                type="button"
                onClick={() => {
                  void logoutAccount().finally(() => {
                    void navigate({ to: "/login" });
                  });
                }}
              >
                {c.logout}
              </button>
            </div>
          </div>
        </GameCard>

        <MascotCoach text={c.coach} />

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["2450", c.stats[0]],
            ["🔥 12", c.stats[1]],
            ["🏅 8", c.stats[2]],
            ["82%", c.stats[3]],
          ].map(([value, label]) => (
            <GameCard key={label}>
              <p className="font-black text-[#6B5E8F]">{label}</p>
              <p className="mt-2 text-3xl font-black text-[#1E1B4B]">{value}</p>
            </GameCard>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <GameCard>
            <h2 className="text-2xl font-black text-[#1E1B4B]">{c.history}</h2>
            <ProgressBar value={68} />
            <div className="mt-5 grid gap-3">
              {c.lessons.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4 font-black"
                >
                  <span>✅ {item}</span>
                  <span className="rounded-full bg-[#EDE9FE] px-3 py-1 text-[#6D28D9]">
                    +{(index + 1) * 20} XP
                  </span>
                </div>
              ))}
            </div>
          </GameCard>

          <GameCard>
            <h2 className="text-2xl font-black text-[#1E1B4B]">{c.mentor}</h2>
            <div className="mt-5 grid gap-3">
              {mentorStyles.map((style, index) => (
                <div
                  key={style.id}
                  className={`rounded-[24px] border-2 p-4 ${
                    index === 2
                      ? "border-[#6D28D9] bg-[#EDE9FE] shadow-[0_6px_0_#C4B5FD]"
                      : "border-[#DDD6FE] bg-white"
                  }`}
                >
                  <p className="text-lg font-black text-[#1E1B4B]">{style.title[language]}</p>
                  <p className="mt-1 font-semibold text-[#6B5E8F]">
                    {style.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </GameCard>
        </section>
      </div>
    </GameLayout>
  );
}
