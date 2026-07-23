import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { challengeLevels, challengeTopics } from "@/data/topic-challenge";
import { useLanguage } from "@/hooks/use-language";
import { saveWeakTopicProgress } from "@/lib/api/account.functions";

export const Route = createFileRoute("/topic-challenge")({
  head: () => ({
    meta: [
      { title: "Қиын тақырып — AI-Sana" },
      { name: "description", content: "Әлсіз тақырыпты ойын режимінде жеңу." },
    ],
  }),
  component: TopicChallenge,
});

function TopicChallenge() {
  const { language } = useLanguage();
  const c = copy[language];
  const [topicId, setTopicId] = useState(challengeTopics[0].id);
  const [level, setLevel] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const activeTopic = challengeTopics.find((topic) => topic.id === topicId) ?? challengeTopics[0];
  const activeLevel = challengeLevels.find((item) => item.level === level) ?? challengeLevels[0];
  const unlockedLevel = Math.max(level, 1);

  const result = useMemo(() => {
    const correct = activeLevel.questions.filter(
      (question) => normalize(answers[question.id]) === normalize(question.answer),
    ).length;

    return {
      correct,
      percent: Math.round((correct / activeLevel.questions.length) * 100),
    };
  }, [activeLevel.questions, answers]);

  const submit = async () => {
    const passed = result.percent >= activeLevel.targetPercent;
    const nextLevel = passed ? Math.min(5, activeLevel.level + 1) : activeLevel.level;
    const nextFeedback = passed
      ? c.passedFeedback(activeTopic.title[language], activeLevel.title[language])
      : c.retryFeedback(activeTopic.title[language], activeLevel.title[language]);

    setFeedback(nextFeedback);

    await saveWeakTopicProgress({
      data: {
        topicId,
        currentLevel: nextLevel,
        levels: challengeLevels.map((item) => ({
          level: item.level,
          bestPercent: item.level === activeLevel.level ? result.percent : 0,
          unlocked: item.level <= nextLevel,
          completed: item.level < nextLevel,
          lastFeedback: item.level === activeLevel.level ? nextFeedback : undefined,
        })),
      },
    });

    if (passed) {
      setLevel(nextLevel);
      setAnswers({});
    }
  };

  return (
    <GameLayout
      right={
        <div className="space-y-4">
          <MascotCoach text={c.coach} />
          <GameCard>
            <p className="text-sm font-black uppercase tracking-widest text-[#8B5CF6]">
              {c.progressTitle}
            </p>
            <h3 className="mt-2 text-3xl font-black text-[#1E1B4B]">{result.percent}%</h3>
            <ProgressBar
              value={result.percent}
              danger={result.percent < activeLevel.targetPercent}
            />
            <p className="mt-3 text-sm font-bold text-[#6B5E8F]">
              {result.correct}/{activeLevel.questions.length} · {activeLevel.targetPercent}%
            </p>
          </GameCard>
          <GameCard className="bg-[#1E1B4B] text-white">
            <p className="text-sm font-black uppercase tracking-widest text-[#FACC15]">
              Final Level
            </p>
            <h3 className="mt-2 text-2xl font-black">{c.bossTitle}</h3>
            <p className="mt-2 font-semibold text-[#DDD6FE]">{c.bossText}</p>
          </GameCard>
        </div>
      }
    >
      <section className="rounded-[32px] bg-gradient-to-br from-[#6D28D9] via-[#8B5CF6] to-[#C084FC] p-6 text-white shadow-[0_12px_0_rgba(76,29,149,0.24)] md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
          AI-Sana Quest
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{c.title}</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold text-[#F5F3FF]">{c.desc}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {c.badges.map((badge) => (
            <span
              className="rounded-full border-2 border-white/30 bg-white/15 px-4 py-2 text-sm font-black"
              key={badge}
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-5">
          <GameCard>
            <h2 className="text-2xl font-black text-[#1E1B4B]">{c.chooseTopic}</h2>
            <div className="mt-4 grid gap-3">
              {challengeTopics.map((topic) => {
                const active = topic.id === topicId;
                return (
                  <button
                    className={`flex items-center gap-3 rounded-[22px] border-2 px-4 py-4 text-left font-black transition ${
                      active
                        ? "border-[#6D28D9] bg-[#EDE9FE] text-[#6D28D9] shadow-[0_6px_0_#C4B5FD]"
                        : "border-[#DDD6FE] bg-white text-[#1E1B4B] hover:border-[#8B5CF6]"
                    }`}
                    key={topic.id}
                    onClick={() => {
                      setTopicId(topic.id);
                      setLevel(1);
                      setAnswers({});
                      setFeedback("");
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined grid h-11 w-11 place-items-center rounded-2xl bg-[#F5F3FF] text-[#8B5CF6]">
                      {topic.icon}
                    </span>
                    {topic.title[language]}
                  </button>
                );
              })}
            </div>
          </GameCard>

          <GameCard>
            <h2 className="text-2xl font-black text-[#1E1B4B]">{c.levels}</h2>
            <div className="mt-4 space-y-3">
              {challengeLevels.map((item) => {
                const isLocked = item.level > unlockedLevel;
                const active = item.level === activeLevel.level;
                return (
                  <button
                    className={`flex w-full items-center justify-between rounded-[22px] border-2 px-4 py-4 text-left font-black transition ${
                      active
                        ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-[0_6px_0_#4C1D95]"
                        : "border-[#DDD6FE] bg-white text-[#1E1B4B] hover:border-[#8B5CF6]"
                    } ${isLocked ? "cursor-not-allowed opacity-45" : ""}`}
                    disabled={isLocked}
                    key={item.level}
                    onClick={() => {
                      setLevel(item.level);
                      setAnswers({});
                      setFeedback("");
                    }}
                    type="button"
                  >
                    <span>
                      {item.level}. {item.title[language]}
                    </span>
                    <span className="material-symbols-outlined">
                      {isLocked ? "lock" : active ? "play_arrow" : "radio_button_unchecked"}
                    </span>
                  </button>
                );
              })}
            </div>
          </GameCard>
        </div>

        <GameCard className="overflow-hidden p-0">
          <div className="border-b-2 border-[#DDD6FE] bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                  {activeTopic.title[language]}
                </p>
                <h2 className="mt-2 text-3xl font-black text-[#1E1B4B] md:text-4xl">
                  {activeLevel.title[language]}
                </h2>
              </div>
              <div className="rounded-2xl bg-[#FACC15] px-4 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]">
                {c.goal}: {activeLevel.targetPercent}%
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:p-6">
            {activeLevel.questions.map((question, questionIndex) => (
              <label
                className="rounded-[24px] border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4"
                key={question.id}
              >
                <span className="flex items-start gap-3 text-lg font-black text-[#1E1B4B]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#8B5CF6] text-white">
                    {questionIndex + 1}
                  </span>
                  {question.prompt[language]}
                </span>
                <input
                  className="mt-4 w-full rounded-2xl border-2 border-[#DDD6FE] bg-white px-4 py-4 text-lg font-bold text-[#1E1B4B] outline-none transition focus:border-[#6D28D9] focus:ring-4 focus:ring-[#C084FC]/25"
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                  }
                  placeholder={c.answerPlaceholder}
                  value={answers[question.id] ?? ""}
                />
              </label>
            ))}
          </div>

          <div className="border-t-2 border-[#DDD6FE] bg-white p-5 md:p-6">
            <button
              className="inline-flex items-center gap-3 rounded-[22px] bg-[#6D28D9] px-6 py-4 font-black text-white shadow-[0_7px_0_#4C1D95] transition hover:-translate-y-0.5"
              onClick={submit}
              type="button"
            >
              {c.check}
              <span className="material-symbols-outlined">bolt</span>
            </button>

            {feedback ? (
              <div className="mt-5 rounded-[24px] border-2 border-[#C084FC] bg-[#EDE9FE] p-5">
                <p className="text-2xl font-black text-[#6D28D9]">
                  {result.percent}% · {result.correct}/{activeLevel.questions.length}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#1E1B4B]">{feedback}</p>
              </div>
            ) : null}
          </div>
        </GameCard>
      </section>
    </GameLayout>
  );
}

function normalize(value: string) {
  return value.replace(",", ".").trim().toLowerCase();
}

const copy = {
  EN: {
    title: "Beat a Hard Topic",
    desc: "Pick a weak topic, clear five levels, earn confidence, and unlock exam speed.",
    chooseTopic: "Choose weak topic",
    levels: "Levels",
    goal: "Goal",
    answerPlaceholder: "Type your answer",
    check: "Check level",
    progressTitle: "Current result",
    bossTitle: "Final test opens after level 5",
    bossText: "Score 70% step by step, then prove the topic is no longer scary.",
    coach: "Start with the easiest level. AI-Sana will show what to repeat after each try.",
    badges: ["5 levels", "+XP", "AI feedback"],
    passedFeedback: (topic: string, level: string) =>
      `Great work in ${topic}. You passed ${level}. Keep the method and solve faster without skipping steps.`,
    retryFeedback: (topic: string, level: string) =>
      `You are close in ${topic}. Repeat ${level}: focus on the first step and check calculations carefully.`,
  },
  KZ: {
    title: "Қиын тақырыпты жең",
    desc: "Әлсіз тақырыпты таңдап, 5 деңгейді өт, сенімділігіңді көтер және емтихан жылдамдығын аш.",
    chooseTopic: "Әлсіз тақырыпты таңда",
    levels: "Деңгейлер",
    goal: "Мақсат",
    answerPlaceholder: "Жауабыңды жаз",
    check: "Деңгейді тексеру",
    progressTitle: "Қазіргі нәтиже",
    bossTitle: "Қорытынды тест 5-деңгейден кейін ашылады",
    bossText: "70%-ға біртіндеп жетіп, бұл тақырып енді қиын емес екенін дәлелде.",
    coach: "Ең жеңіл деңгейден баста. Әр әрекеттен кейін AI-Sana нені қайталау керегін көрсетеді.",
    badges: ["5 деңгей", "+XP", "AI түсіндірме"],
    passedFeedback: (topic: string, level: string) =>
      `${topic} бойынша керемет ілгерілеу бар. ${level} деңгейінен өттің. Енді әдісті сақтап, қадамдарды тастамай жылдамырақ шығар.`,
    retryFeedback: (topic: string, level: string) =>
      `${topic} бойынша жақын қалдың. ${level} деңгейін қайтала: бірінші қадамға және есептеуге мұқият бол.`,
  },
  RU: {
    title: "Победи сложную тему",
    desc: "Выбери слабую тему, пройди 5 уровней, набери уверенность и открой экзаменационную скорость.",
    chooseTopic: "Выберите слабую тему",
    levels: "Уровни",
    goal: "Цель",
    answerPlaceholder: "Введите ответ",
    check: "Проверить уровень",
    progressTitle: "Текущий результат",
    bossTitle: "Итоговый тест откроется после 5 уровня",
    bossText: "Набери 70% шаг за шагом и докажи, что тема больше не страшная.",
    coach: "Начни с самого легкого уровня. AI-Sana покажет, что повторить после каждой попытки.",
    badges: ["5 уровней", "+XP", "AI-разбор"],
    passedFeedback: (topic: string, level: string) =>
      `Есть отличный прогресс в теме ${topic}. Уровень «${level}» пройден. Дальше сохраняй метод и решай быстрее, не пропуская шаги.`,
    retryFeedback: (topic: string, level: string) =>
      `Ты близко в теме ${topic}. Повтори уровень «${level}»: держи фокус на первом шаге и аккуратно проверяй вычисления.`,
  },
};
