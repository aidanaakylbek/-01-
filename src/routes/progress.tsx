import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — AI-Sana" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { language } = useLanguage();
  const c =
    language === "RU"
      ? {
          title: "Твой прогресс",
          advice: "AI-Sana кеңесі: повторяй проценты и логику чаще.",
          accuracy: "Общая точность",
          weak: "Слабые темы",
          lessons: "Завершенные уроки",
          streak: "Календарь серии",
        }
      : language === "EN"
        ? {
            title: "Your Progress",
            advice: "AI-Sana tip: review percentages and logic more often.",
            accuracy: "Overall accuracy",
            weak: "Weak topics",
            lessons: "Completed lessons",
            streak: "Streak calendar",
          }
        : {
            title: "Сенің прогресің",
            advice: "AI-Sana кеңесі: пайыздар мен логика сұрақтарын көбірек қайтала.",
            accuracy: "Жалпы дәлдік",
            weak: "Әлсіз тақырыптар",
            lessons: "Аяқталған сабақтар",
            streak: "Серия күнтізбесі",
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <MascotCoach text={c.advice} />
        <section className="grid gap-4 md:grid-cols-4">
          <Stat title={c.accuracy} value="82%" icon="target" />
          <Stat title="XP" value="2450" icon="stars" />
          <Stat title={c.lessons} value="18" icon="task_alt" />
          <Stat title="Level" value="16" icon="workspace_premium" />
        </section>
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <GameCard>
            <p className="text-sm font-black uppercase tracking-widest text-[#8B5CF6]">
              Weekly progress
            </p>
            <h1 className="mt-2 text-4xl font-black">{c.title}</h1>
            <div className="mt-8 flex h-64 items-end gap-3">
              {[40, 56, 62, 58, 74, 80, 88].map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-3xl bg-gradient-to-t from-[#6D28D9] to-[#C084FC] shadow-[0_6px_0_rgba(109,40,217,0.18)]"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs font-black text-[#6B5E8F]">
                    {["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"][index]}
                  </span>
                </div>
              ))}
            </div>
          </GameCard>
          <div className="space-y-5">
            <GameCard>
              <h2 className="text-2xl font-black">{c.weak}</h2>
              <Topic title="Пайыздар" value={28} />
              <Topic title="Логика" value={45} />
              <Topic title="Оқу сауаттылығы" value={61} />
            </GameCard>
            <GameCard>
              <h2 className="text-2xl font-black">{c.streak}</h2>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 21 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-9 rounded-xl ${index % 5 === 0 ? "bg-[#FACC15]" : "bg-[#8B5CF6]"}`}
                  />
                ))}
              </div>
            </GameCard>
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <GameCard>
      <span className="material-symbols-outlined text-3xl text-[#8B5CF6]">{icon}</span>
      <p className="mt-4 text-sm font-black uppercase tracking-widest text-[#6B5E8F]">{title}</p>
      <p className="mt-1 text-3xl font-black text-[#6D28D9]">{value}</p>
    </GameCard>
  );
}

function Topic({ title, value }: { title: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between font-black">
        <span>{title}</span>
        <span>{value}%</span>
      </div>
      <ProgressBar value={value} danger={value < 50} />
    </div>
  );
}
