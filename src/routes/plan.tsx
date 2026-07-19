import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [{ title: "Practice — AI-Sana" }],
  }),
  component: PracticePage,
});

const answers = ["20", "25", "40", "45"];

function PracticePage() {
  const { language } = useLanguage();
  const [selected, setSelected] = useState<number | null>(null);
  const correct = selected === 0;
  const c =
    language === "RU"
      ? {
          title: "Практика: проценты",
          question: "Сколько будет 25% от 80?",
          progress: "3/10 вопросов",
          left: "Еще 2 вопроса осталось!",
          xp: "+15 XP",
          correct: "Жарайсың! Правильно.",
          wrong: "AI-Sana объясняет: 25% — это одна четверть. 80 ÷ 4 = 20.",
          similar: "Создать похожий вопрос",
          continue: "Продолжить",
        }
      : language === "EN"
        ? {
            title: "Practice: Percentages",
            question: "What is 25% of 80?",
            progress: "Question 3/10",
            left: "Only 2 questions left!",
            xp: "+15 XP",
            correct: "Great job! Correct.",
            wrong: "AI-Sana explains: 25% is one quarter. 80 ÷ 4 = 20.",
            similar: "Create similar question",
            continue: "Continue",
          }
        : {
            title: "Жаттығу: пайыздар",
            question: "80 санының 25%-ы нешеге тең?",
            progress: "3/10 сұрақ",
            left: "Тағы 2 сұрақ қалды!",
            xp: "+15 XP",
            correct: "Жарайсың! Дұрыс.",
            wrong: "AI-Sana түсіндіреді: 25% — төрттен бір бөлік. 80 ÷ 4 = 20.",
            similar: "Ұқсас сұрақ шығару",
            continue: "Жалғастыру",
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <MascotCoach text={c.left} />
        <GameCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-[#8B5CF6]">
                {c.progress}
              </p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">{c.title}</h1>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-white px-4 py-2 font-black">❤️ 5</span>
              <span className="rounded-full bg-[#FACC15] px-4 py-2 font-black text-[#1E1B4B]">
                ⭐ 0 XP
              </span>
            </div>
          </div>
          <ProgressBar value={30} />
        </GameCard>

        <GameCard className="p-6 md:p-8">
          <h2 className="text-2xl font-black md:text-4xl">{c.question}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {answers.map((answer, index) => {
              const active = selected === index;
              const tone =
                active && index === 0
                  ? "border-[#22C55E] bg-[#DCFCE7] shadow-[0_7px_0_#16A34A]"
                  : active
                    ? "border-[#EF4444] bg-[#FEE2E2] shadow-[0_7px_0_#B91C1C]"
                    : "border-[#DDD6FE] bg-white shadow-[0_7px_0_rgba(109,40,217,0.12)] hover:-translate-y-1";
              return (
                <button
                  key={answer}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`rounded-[24px] border-2 p-6 text-left text-2xl font-black transition ${tone}`}
                >
                  <span className="mr-3 text-[#8B5CF6]">{String.fromCharCode(65 + index)}</span>
                  {answer}
                </button>
              );
            })}
          </div>
        </GameCard>

        {selected !== null ? (
          <GameCard className={correct ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-black">{correct ? c.correct : c.wrong}</h3>
                <p className="mt-2 font-black text-[#6D28D9]">{correct ? c.xp : "❤️ -1"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl border-2 border-[#6D28D9] px-5 py-3 font-black text-[#6D28D9]">
                  {c.similar}
                </button>
                <button className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]">
                  {c.continue}
                </button>
              </div>
            </div>
          </GameCard>
        ) : null}
      </div>
    </GameLayout>
  );
}
