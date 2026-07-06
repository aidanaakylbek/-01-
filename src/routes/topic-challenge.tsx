import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { challengeLevels, challengeTopics } from "@/data/topic-challenge";
import { useLanguage } from "@/hooks/use-language";
import { saveWeakTopicProgress } from "@/lib/api/account.functions";

export const Route = createFileRoute("/topic-challenge")({
  head: () => ({
    meta: [
      { title: "Beat a Hard Topic — AI-Sana" },
      { name: "description", content: "Master weak topics from easy to exam speed." },
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
  const unlockedLevel = useMemo(() => Math.max(level, 1), [level]);

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
    <div className="min-h-screen game-shell text-on-background pb-24">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-container-padding-mobile py-stack-lg md:px-container-padding-desktop">
        <section className="game-card p-7 shadow-[12px_12px_0_var(--secondary-container)]">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            AI-Sana Challenge
          </p>
          <h1 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
            {c.title}
          </h1>
          <p className="mt-4 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            {c.desc}
          </p>
        </section>

        <section className="mt-stack-lg grid gap-gutter lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border-2 border-outline-variant bg-surface p-5">
              <h2 className="font-title-lg text-title-lg text-primary">{c.chooseTopic}</h2>
              <div className="mt-4 grid gap-2">
                {challengeTopics.map((topic) => (
                  <button
                    className={`flex items-center gap-3 border p-3 text-left ${
                      topic.id === topicId
                        ? "border-secondary bg-secondary-container"
                        : "border-outline-variant hover:border-secondary"
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
                    <span className="material-symbols-outlined text-secondary">{topic.icon}</span>
                    {topic.title[language]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-outline-variant bg-surface p-5">
              <h2 className="font-title-lg text-title-lg text-primary">{c.levels}</h2>
              <div className="mt-4 space-y-2">
                {challengeLevels.map((item) => {
                  const isLocked = item.level > unlockedLevel;
                  return (
                    <button
                      className={`w-full border p-3 text-left ${
                        item.level === activeLevel.level
                          ? "border-secondary bg-secondary-container"
                          : "border-outline-variant"
                      } ${isLocked ? "opacity-40" : "hover:border-secondary"}`}
                      disabled={isLocked}
                      key={item.level}
                      onClick={() => {
                        setLevel(item.level);
                        setAnswers({});
                      }}
                      type="button"
                    >
                      {item.level}. {item.title[language]}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <article className="game-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant pb-5">
              <div>
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                  {activeTopic.title[language]}
                </p>
                <h2 className="mt-2 font-headline-md text-headline-md text-primary">
                  {activeLevel.title[language]}
                </h2>
              </div>
              <div className="border border-outline-variant px-4 py-3">
                {c.goal}: {activeLevel.targetPercent}%
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              {activeLevel.questions.map((question, questionIndex) => (
                <label className="block" key={question.id}>
                  <span className="font-title-md text-title-md text-primary">
                    {questionIndex + 1}. {question.prompt[language]}
                  </span>
                  <input
                    className="mt-3 w-full rounded-2xl border-2 border-outline-variant bg-surface px-4 py-3 outline-none focus:border-secondary"
                    onChange={(event) =>
                      setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                    }
                    placeholder={c.answerPlaceholder}
                    value={answers[question.id] ?? ""}
                  />
                </label>
              ))}
            </div>

            <button className="mt-6 bg-secondary px-6 py-3 text-on-secondary" onClick={submit} type="button">
              {c.check}
            </button>

            {feedback ? (
              <div className="mt-6 border border-secondary bg-secondary-container p-5">
                <p className="font-title-md text-title-md text-primary">
                  {result.percent}% · {result.correct}/{activeLevel.questions.length}
                </p>
                <p className="mt-2 text-on-surface-variant">{feedback}</p>
              </div>
            ) : null}
          </article>
        </section>
      </main>
    </div>
  );
}

function normalize(value: string) {
  return value.replace(",", ".").trim().toLowerCase();
}

const copy = {
  EN: {
    title: "Beat a hard topic",
    desc: "Choose a weak topic and move from very easy tasks to exam speed. The next level opens after 70%.",
    chooseTopic: "Choose weak topic",
    levels: "Levels",
    goal: "Goal",
    answerPlaceholder: "Type your answer",
    check: "Check level",
    passedFeedback: (topic: string, level: string) =>
      `Good progress in ${topic}. You passed ${level}. Next, keep the method and solve faster without skipping steps.`,
    retryFeedback: (topic: string, level: string) =>
      `You are close in ${topic}. Repeat ${level}: focus on the first step and check calculations carefully.`,
  },
  KZ: {
    title: "Қиын тақырыпты жең",
    desc: "Әлсіз тақырыпты таңдап, өте жеңіл деңгейден емтихан жылдамдығына дейін көтеріл. Келесі деңгей 70%-дан кейін ашылады.",
    chooseTopic: "Әлсіз тақырыпты таңда",
    levels: "Деңгейлер",
    goal: "Мақсат",
    answerPlaceholder: "Жауабыңды жаз",
    check: "Деңгейді тексеру",
    passedFeedback: (topic: string, level: string) =>
      `${topic} бойынша жақсы ілгерілеу бар. ${level} деңгейінен өттің. Енді әдісті сақтап, қадамдарды тастамай жылдамырақ шығар.`,
    retryFeedback: (topic: string, level: string) =>
      `${topic} бойынша жақын қалдың. ${level} деңгейін қайтала: бірінші қадамға және есептеуге мұқият бол.`,
  },
  RU: {
    title: "Победи сложную тему",
    desc: "Выберите слабую тему и пройдите путь от очень лёгкого уровня до экзаменационной скорости. Следующий уровень открывается после 70%.",
    chooseTopic: "Выберите слабую тему",
    levels: "Уровни",
    goal: "Цель",
    answerPlaceholder: "Введите ответ",
    check: "Проверить уровень",
    passedFeedback: (topic: string, level: string) =>
      `Есть прогресс в теме ${topic}. Уровень «${level}» пройден. Дальше сохраняйте метод и решайте быстрее, не пропуская шаги.`,
    retryFeedback: (topic: string, level: string) =>
      `Вы близко в теме ${topic}. Повторите уровень «${level}»: держите фокус на первом шаге и аккуратно проверяйте вычисления.`,
  },
};


