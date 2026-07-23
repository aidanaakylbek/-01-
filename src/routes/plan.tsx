import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";

export const Route = createFileRoute("/plan")({
  loader: async () => getAccountDashboard(),
  head: () => ({
    meta: [{ title: "Practice — AI-Sana" }],
  }),
  component: PracticePage,
});

type PracticeKey =
  | "topic"
  | "weak"
  | "mixed"
  | "mistakes"
  | "quick"
  | "ai"
  | "daily";

type Difficulty = "easy" | "medium" | "hard";

type PracticeCard = {
  key: PracticeKey;
  icon: string;
  title: string;
  eyebrow: string;
  description: string;
  duration: string;
  questions: string;
  difficulty?: string;
  highlight?: boolean;
  locked?: boolean;
};

const difficultyLabels: Record<Difficulty, { kk: string; ru: string }> = {
  easy: { kk: "Оңай", ru: "Легко" },
  medium: { kk: "Орташа", ru: "Средне" },
  hard: { kk: "Қиын", ru: "Сложно" },
};

function PracticePage() {
  const dashboard = Route.useLoaderData();
  const { language } = useLanguage();
  const [active, setActive] = useState<PracticeKey>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState("Пайыздар");
  const [quickCount, setQuickCount] = useState(10);

  const weakTopics = dashboard.account.diagnosticWeakTopics?.length
    ? dashboard.account.diagnosticWeakTopics
    : ["Пайыздар", "Логика", "Оқу сауаттылығы"];
  const mistakesCount = dashboard.examAttempts.reduce(
    (total, attempt) => total + attempt.questions.filter((answer) => !answer.isCorrect).length,
    0,
  );
  const completedLessons = dashboard.completedLessons ?? 0;

  const c = useMemo(() => {
    if (language === "RU") {
      return {
        hero: "Практика",
        subtitle:
          "Выберите формат тренировки: по теме, по слабым местам, смешанный экзамен или быстрые вопросы.",
        today: "Сегодня AI-Sana советует",
        recommended: `Повторить ${weakTopics.slice(0, 2).join(" и ")}. Рекомендуем 10 вопросов среднего уровня.`,
        chooseTopic: "Выберите тему",
        difficulty: "Сложность",
        count: "Количество",
        start: "Начать",
        openTutor: "Открыть AI Tutor",
        sessionReady: "Сессия готова",
        sessionHint:
          "Нажмите «Начать», и AI-Sana подберет вопросы по выбранному режиму. Полная история будет сохраняться после подключения практики к базе попыток.",
        selectedMode: "Выбранный режим",
        questions: "вопросов",
        duration: "время",
        rules: "Как работает",
        rulesText:
          "Слабые темы берутся из диагностики, тестов и ошибок. Смешанная практика помогает готовиться к реальному формату НИШ/БИЛ/РФММ.",
        cards: {
          topic: {
            title: "По теме",
            eyebrow: "Topic Practice",
            description: "Выберите тему и решайте только похожие задания.",
          },
          weak: {
            title: "Слабые темы",
            eyebrow: "Adaptive",
            description: "AI-Sana подбирает вопросы по самым слабым местам.",
          },
          mixed: {
            title: "Смешанная практика",
            eyebrow: "Exam style",
            description: "Разные темы в одном формате, как на реальном тесте.",
          },
          mistakes: {
            title: "Ошибки",
            eyebrow: "Mistake Review",
            description: "Повторите вопросы, где раньше был неправильный ответ.",
          },
          quick: {
            title: "Быстрая практика",
            eyebrow: "3–10 минут",
            description: "Короткая сессия на 5, 10 или 15 вопросов.",
          },
          ai: {
            title: "AI рекомендует",
            eyebrow: "Personal",
            description: "Персональная сессия по диагностике и последним ошибкам.",
          },
          daily: {
            title: "Задание дня",
            eyebrow: "Daily Challenge",
            description: "Один ежедневный челлендж с бонусами.",
          },
        },
      };
    }

    return {
      hero: "Жаттығу",
      subtitle:
        "Өзіңе керек жаттығу түрін таңда: тақырып, әлсіз тұстар, аралас формат немесе жылдам сұрақтар.",
      today: "Бүгін AI-Sana ұсынады",
      recommended: `${weakTopics.slice(0, 2).join(" және ")} тақырыптарын қайталау. Орташа деңгейде 10 сұрақ ұсынамыз.`,
      chooseTopic: "Тақырып таңда",
      difficulty: "Деңгей",
      count: "Саны",
      start: "Бастау",
      openTutor: "AI Tutor ашу",
      sessionReady: "Сессия дайын",
      sessionHint:
        "«Бастау» басқанда AI-Sana осы режимге сай сұрақтарды дайындайды. Толық тарих practice attempts базасына қосылғаннан кейін сақталады.",
      selectedMode: "Таңдалған режим",
      questions: "сұрақ",
      duration: "уақыты",
      rules: "Қалай жұмыс істейді",
      rulesText:
        "Әлсіз тақырыптар диагностика, тесттер және бұрынғы қателер бойынша анықталады. Аралас жаттығу НЗМ/БИЛ/РФММ нақты тест форматына дайындайды.",
      cards: {
        topic: {
          title: "Тақырып бойынша",
          eyebrow: "Topic Practice",
          description: "Бір нақты тақырыпты таңдап, тек сол тақырыптан сұрақ шеш.",
        },
        weak: {
          title: "Әлсіз тақырыптар",
          eyebrow: "Adaptive",
          description: "AI-Sana ең қиын болып тұрған тақырыптардан жаттығу құрады.",
        },
        mixed: {
          title: "Аралас жаттығу",
          eyebrow: "Exam style",
          description: "Әртүрлі тақырыптар араласып келеді, нақты емтихан сияқты.",
        },
        mistakes: {
          title: "Қате жіберген сұрақтар",
          eyebrow: "Mistake Review",
          description: "Бұрын қате кеткен сұрақтарды қайта шешіп, түсіндірме ал.",
        },
        quick: {
          title: "Жылдам жаттығу",
          eyebrow: "3–10 минут",
          description: "Күнделікті қысқа сессия: 5, 10 немесе 15 сұрақ.",
        },
        ai: {
          title: "AI ұсынған жаттығу",
          eyebrow: "Personal",
          description: "Диагностика, прогресс және қателер бойынша жеке жаттығу.",
        },
        daily: {
          title: "Күннің тапсырмасы",
          eyebrow: "Daily Challenge",
          description: "Күніне бір рет ашылатын арнайы челлендж және бонус.",
        },
      },
    };
  }, [language, weakTopics]);

  const cards: PracticeCard[] = [
    {
      key: "topic",
      icon: "target",
      title: c.cards.topic.title,
      eyebrow: c.cards.topic.eyebrow,
      description: c.cards.topic.description,
      difficulty: difficultyLabels[difficulty][language === "RU" ? "ru" : "kk"],
      duration: "8–12 мин",
      questions: "10",
    },
    {
      key: "weak",
      icon: "troubleshoot",
      title: c.cards.weak.title,
      eyebrow: c.cards.weak.eyebrow,
      description: c.cards.weak.description,
      difficulty: "Adaptive",
      duration: "10 мин",
      questions: "10",
    },
    {
      key: "mixed",
      icon: "shuffle",
      title: c.cards.mixed.title,
      eyebrow: c.cards.mixed.eyebrow,
      description: c.cards.mixed.description,
      difficulty: "Adaptive",
      duration: "12–15 мин",
      questions: "15",
    },
    {
      key: "mistakes",
      icon: "replay",
      title: c.cards.mistakes.title,
      eyebrow: c.cards.mistakes.eyebrow,
      description: c.cards.mistakes.description,
      difficulty: mistakesCount ? `${mistakesCount}` : "0",
      duration: "6–10 мин",
      questions: String(Math.max(5, Math.min(10, mistakesCount || 5))),
    },
    {
      key: "quick",
      icon: "bolt",
      title: c.cards.quick.title,
      eyebrow: c.cards.quick.eyebrow,
      description: c.cards.quick.description,
      difficulty: difficultyLabels[difficulty][language === "RU" ? "ru" : "kk"],
      duration: quickCount === 5 ? "3 мин" : quickCount === 10 ? "6 мин" : "10 мин",
      questions: String(quickCount),
    },
    {
      key: "ai",
      icon: "auto_awesome",
      title: c.cards.ai.title,
      eyebrow: c.cards.ai.eyebrow,
      description: c.cards.ai.description,
      difficulty: "Adaptive",
      duration: "8–10 мин",
      questions: "10",
      highlight: true,
    },
    {
      key: "daily",
      icon: "local_fire_department",
      title: c.cards.daily.title,
      eyebrow: c.cards.daily.eyebrow,
      description: c.cards.daily.description,
      difficulty: completedLessons > 0 ? "+XP" : "New",
      duration: "5 мин",
      questions: "7",
    },
  ];

  const activeCard = cards.find((card) => card.key === active) ?? cards[0];
  const topics = [
    "Арифметика",
    "Пайыздар",
    "Логика",
    "Геометрия",
    "Теңдеулер",
    "Қазақ тілі",
    "Оқу сауаттылығы",
  ];

  return (
    <GameLayout
      right={
        <div className="space-y-4">
          <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">
              AI-Sana
            </p>
            <h3 className="mt-2 text-2xl font-black">{c.today}</h3>
            <p className="mt-3 text-sm font-semibold text-[#EDE9FE]">{c.recommended}</p>
          </GameCard>
          <GameCard>
            <h3 className="text-lg font-black">{c.rules}</h3>
            <p className="mt-2 text-sm font-semibold text-[#6B5E8F]">{c.rulesText}</p>
            <div className="mt-4 space-y-3">
              {weakTopics.slice(0, 3).map((weakTopic, index) => (
                <div key={weakTopic}>
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>{weakTopic}</span>
                    <span className="text-[#EF4444]">{28 + index * 7}%</span>
                  </div>
                  <ProgressBar danger value={28 + index * 7} />
                </div>
              ))}
            </div>
          </GameCard>
        </div>
      }
    >
      <div className="space-y-5">
        <GameCard className="overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#8B5CF6] text-white">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-[#FACC15]">
                AI-Sana Practice
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">{c.hero}</h1>
              <p className="mt-4 max-w-3xl text-lg font-semibold text-[#EDE9FE]">{c.subtitle}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:w-80">
              <StatPill label={c.questions} value="10+" icon="quiz" />
              <StatPill label={c.duration} value="3–15" icon="timer" />
              <StatPill label="AI" value="Smart" icon="auto_awesome" />
            </div>
          </div>
        </GameCard>

        <GameCard className="bg-white/95">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                {c.chooseTopic}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTopic(item);
                      setActive("topic");
                    }}
                    className={`rounded-2xl border-2 px-4 py-2 text-sm font-black transition ${
                      topic === item && active === "topic"
                        ? "border-[#6D28D9] bg-[#6D28D9] text-white shadow-[0_4px_0_#4C1D95]"
                        : "border-[#DDD6FE] bg-[#F5F3FF] text-[#4C1D95] hover:-translate-y-0.5"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                {c.difficulty}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`rounded-2xl border-2 px-2 py-2 text-sm font-black transition ${
                      difficulty === level
                        ? "border-[#FACC15] bg-[#FACC15] text-[#1E1B4B] shadow-[0_4px_0_#CA8A04]"
                        : "border-[#DDD6FE] bg-white text-[#4C1D95]"
                    }`}
                  >
                    {difficultyLabels[level][language === "RU" ? "ru" : "kk"]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GameCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <PracticeModeCard
              active={active === card.key}
              card={card}
              key={card.key}
              onClick={() => setActive(card.key)}
            />
          ))}
        </div>

        <GameCard className="bg-white/95">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                {c.sessionReady}
              </p>
              <h2 className="mt-2 text-3xl font-black">{activeCard.title}</h2>
              <p className="mt-2 max-w-3xl font-semibold text-[#6B5E8F]">
                {active === "topic" ? `${topic}: ${activeCard.description}` : activeCard.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <MiniMeta icon="quiz" text={`${activeCard.questions} ${c.questions}`} />
                <MiniMeta icon="timer" text={activeCard.duration} />
                <MiniMeta icon="signal_cellular_alt" text={activeCard.difficulty ?? "Adaptive"} />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#6B5E8F]">{c.sessionHint}</p>
            </div>

            <div className="rounded-[28px] border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                {c.selectedMode}
              </p>
              {active === "quick" ? (
                <div className="mt-3">
                  <p className="font-black text-[#1E1B4B]">{c.count}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuickCount(count)}
                        className={`rounded-2xl border-2 px-3 py-2 font-black ${
                          quickCount === count
                            ? "border-[#6D28D9] bg-[#6D28D9] text-white"
                            : "border-[#DDD6FE] bg-white text-[#4C1D95]"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3">
                <Link
                  className="rounded-2xl bg-[#6D28D9] px-5 py-3 text-center font-black text-white shadow-[0_5px_0_#4C1D95] transition hover:-translate-y-0.5"
                  to="/explain-solution"
                >
                  {c.start}
                </Link>
                <Link
                  className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-3 text-center font-black text-[#6D28D9]"
                  to="/explain-solution"
                >
                  {c.openTutor}
                </Link>
              </div>
            </div>
          </div>
        </GameCard>
      </div>
    </GameLayout>
  );
}

function PracticeModeCard({
  active,
  card,
  onClick,
}: {
  active: boolean;
  card: PracticeCard;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-64 rounded-[28px] border-2 p-5 text-left transition ${
        active
          ? "border-[#6D28D9] bg-[#F5F3FF] shadow-[0_9px_0_rgba(109,40,217,0.20)]"
          : "border-[#DDD6FE] bg-white shadow-[0_7px_0_rgba(109,40,217,0.10)] hover:-translate-y-1"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`material-symbols-outlined grid h-14 w-14 place-items-center rounded-2xl text-3xl text-white shadow-[0_5px_0_#4C1D95] ${
            card.highlight ? "bg-[#FACC15] !text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]" : "bg-[#6D28D9]"
          }`}
        >
          {card.icon}
        </span>
        <span className="rounded-full bg-[#EDE9FE] px-3 py-1 text-sm font-black text-[#6D28D9]">
          {card.questions}
        </span>
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
        {card.eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#1E1B4B]">{card.title}</h2>
      <p className="mt-3 min-h-16 font-semibold text-[#6B5E8F]">{card.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <MiniMeta icon="timer" text={card.duration} />
        {card.difficulty ? <MiniMeta icon="signal_cellular_alt" text={card.difficulty} /> : null}
      </div>
    </button>
  );
}

function MiniMeta({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F3FF] px-3 py-1 text-sm font-black text-[#4C1D95]">
      <span className="material-symbols-outlined text-base">{icon}</span>
      {text}
    </span>
  );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-white/25 bg-white/15 p-3 text-center backdrop-blur">
      <span className="material-symbols-outlined text-2xl text-[#FACC15]">{icon}</span>
      <p className="mt-1 text-lg font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-wider text-[#EDE9FE]">{label}</p>
    </div>
  );
}
