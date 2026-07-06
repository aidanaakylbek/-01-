import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Parent Report — AI-Sana" }] }),
  component: ParentReportPage,
});

function ParentReportPage() {
  const { language } = useLanguage();
  const c =
    language === "RU"
      ? {
          title: "Отчет для родителей",
          subtitle: "Активность, сильные темы, слабые темы и совет AI-Sana.",
          send: "Отправить через Telegram",
          weekly: "Недельный отчет",
          monthly: "Месячный отчет",
          strong: "Сильные темы",
          weak: "Слабые темы",
          parentTip: "Попросите ребенка объяснить две ошибки недели своими словами.",
        }
      : language === "EN"
        ? {
            title: "Parent Report",
            subtitle: "Activity, strong topics, weak topics and AI-Sana advice.",
            send: "Send via Telegram",
            weekly: "Weekly report",
            monthly: "Monthly report",
            strong: "Strong topics",
            weak: "Weak topics",
            parentTip: "Ask the student to explain two weekly mistakes in their own words.",
          }
        : {
            title: "Ата-ана есебі",
            subtitle: "Оқушы белсенділігі, мықты тақырыптар, әлсіз тақырыптар және AI-Sana кеңесі.",
            send: "Telegram арқылы жіберу",
            weekly: "Апталық есеп",
            monthly: "Айлық есеп",
            strong: "Мықты тақырыптар",
            weak: "Әлсіз тақырыптар",
            parentTip: "Балаңыздан аптадағы екі қатесін өз сөзімен түсіндіруін сұраңыз.",
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-white to-[#F5F3FF]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                AI-Sana Parent Mode
              </p>
              <h1 className="mt-2 text-4xl font-black md:text-6xl">{c.title}</h1>
              <p className="mt-3 max-w-2xl font-semibold text-[#6B5E8F]">{c.subtitle}</p>
            </div>
            <button className="rounded-2xl bg-[#6D28D9] px-6 py-4 font-black text-white shadow-[0_6px_0_#4C1D95]">
              {c.send}
            </button>
          </div>
        </GameCard>
        <MascotCoach text={c.parentTip} />
        <section className="grid gap-5 lg:grid-cols-2">
          <GameCard>
            <h2 className="text-2xl font-black">{c.weekly}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MiniStat label="Lessons" value="18" />
              <MiniStat label="Accuracy" value="82%" />
              <MiniStat label="Activity" value="High" />
            </div>
            <ProgressBar value={82} />
          </GameCard>
          <GameCard>
            <h2 className="text-2xl font-black">{c.monthly}</h2>
            <div className="mt-4 flex h-32 items-end gap-2">
              {[38, 50, 63, 82].map((h) => (
                <div
                  key={h}
                  className="flex-1 rounded-t-2xl bg-gradient-to-t from-[#6D28D9] to-[#C084FC]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </GameCard>
          <GameCard>
            <h2 className="text-2xl font-black">{c.strong}</h2>
            {["Натурал сандар", "Мәтінді түсіну", "Ағылшын сөздігі"].map((topic) => (
              <div key={topic} className="mt-3 rounded-2xl bg-[#DCFCE7] p-4 font-black">
                ✅ {topic}
              </div>
            ))}
          </GameCard>
          <GameCard>
            <h2 className="text-2xl font-black">{c.weak}</h2>
            {["Пайыздар", "Логикалық тізбек", "Сандық салыстыру"].map((topic) => (
              <div key={topic} className="mt-3 rounded-2xl bg-[#FEE2E2] p-4 font-black">
                ⚠️ {topic}
              </div>
            ))}
          </GameCard>
        </section>
      </div>
    </GameLayout>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F5F3FF] p-4">
      <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
