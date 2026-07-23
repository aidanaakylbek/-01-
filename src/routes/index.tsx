import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameCard, GameLayout, ProgressBar, RightWidgets } from "@/components/gamified-platform";
import aiSanaPoster from "@/assets/ai-sana-hero.jpg";
import aiSanaAnimated from "@/assets/ai-sana-animated.mp4";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { DashboardAccount } from "@/lib/account-store.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI-Sana — Gamified Exam Preparation" },
      {
        name: "description",
        content: "AI-Sana is a purple AI-powered learning game for NIS, BIL and RFMS exams.",
      },
    ],
  }),
  component: Dashboard,
});

const lessonNodes = [
  { title: "Диагностика", state: "current", icon: "quiz", href: "/diagnostic" },
  { title: "Логика", state: "locked", icon: "lock", href: "/plan" },
  { title: "Математика", state: "locked", icon: "lock", href: "/subjects#nis" },
  { title: "Оқу сауаттылығы", state: "locked", icon: "menu_book", href: "/subjects#bil" },
  { title: "Mini Test", state: "locked", icon: "quiz", href: "/exam" },
  { title: "Boss Test", state: "boss", icon: "workspace_premium", href: "/exam" },
];

export function Dashboard() {
  const { language } = useLanguage();
  const [dashboard, setDashboard] = useState<DashboardAccount | null>(null);

  useEffect(() => {
    let mounted = true;

    void getAccountDashboard()
      .then((data) => {
        if (mounted) {
          setDashboard(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setDashboard(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const completedLessons = dashboard?.completedLessons ?? 0;
  const xpToday = completedLessons > 0 ? completedLessons * 40 : 0;
  const bossUnlocked = completedLessons >= 10;
  const currentLessonHref = completedLessons > 0 ? "/plan" : "/diagnostic";
  const c =
    language === "RU"
      ? {
          titleLines: ["Платформа подготовки", "к НИШ, БИЛ и РФМШ"],
          subtitle:
            "AI Tutor, личный план, ежедневные задания и полный контроль прогресса помогают идти к цели.",
          coach: "Сегодня пройди 3 урока. Еще 2 вопроса осталось!",
          start: "Начать текущий урок",
          boss: "Boss Test открылся!",
          bossLocked: "Boss Test",
          bossLockedText: "Заверши 10 уроков, чтобы открыть.",
          bossText: "Набери 80%, чтобы перейти на следующий уровень.",
          ready: "Ты готов к следующему уровню!",
        }
      : language === "EN"
        ? {
            titleLines: ["NIS, BIL and RFMS", "preparation platform"],
            subtitle:
              "AI Tutor, a personal plan, daily tasks and full progress tracking help you move toward your goal.",
            coach: "Complete 3 lessons today. Only 2 questions left!",
            start: "Start current lesson",
            boss: "Boss Test unlocked!",
            bossLocked: "Boss Test",
            bossLockedText: "Complete 10 lessons to unlock.",
            bossText: "Score 80% to move to the next level.",
            ready: "You are ready for the next level!",
          }
        : {
            titleLines: ["НЗМ, БИЛ және РФММ-ға", "дайындық платформасы"],
            subtitle:
              "AI Tutor, жеке оқу жоспары, күнделікті тапсырмалар және толық прогресс бақылауы арқылы мақсатыңа жақында.",
            coach: "Бүгін 3 сабақ өт! Тағы 2 сұрақ қалды!",
            start: "Қазіргі сабақты бастау",
            boss: "Boss Test ашылды!",
            bossLocked: "Boss Test",
            bossLockedText: "Ашу үшін 10 сабақты аяқта.",
            bossText: "Келесі деңгейге өту үшін 80% жина.",
            ready: "Келесі деңгейге дайынсың!",
          };

  return (
    <GameLayout right={<RightWidgets />}>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#8B5CF6] p-5 text-white shadow-[0_12px_0_rgba(30,27,75,0.25)] md:p-8">
          <div className="absolute right-[-60px] top-[-70px] h-48 w-48 rounded-full bg-[#C084FC]/25 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center xl:grid-cols-[minmax(0,1fr)_400px]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                AI-Sana Quest
              </p>
              <h1 className="mt-3 max-w-3xl text-[2rem] font-black leading-[1.05] tracking-tight sm:text-[2.5rem] md:text-[3.5rem] xl:text-[4rem]">
                <span className="block">{c.titleLines[0]}</span>
                <span className="block">{c.titleLines[1]}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#EDE9FE] md:text-lg">
                {c.subtitle}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={currentLessonHref as never}
                  className="inline-flex justify-center rounded-2xl bg-[#FACC15] px-6 py-4 text-center font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] transition hover:-translate-y-0.5"
                >
                  {c.start}
                </Link>
                {bossUnlocked ? (
                  <Link
                    to="/exam"
                    className="inline-flex justify-center rounded-2xl border-2 border-white/70 bg-white/10 px-6 py-4 text-center font-black text-white backdrop-blur transition hover:bg-white/20"
                  >
                    Boss Test
                  </Link>
                ) : (
                  <div>
                    <button
                      className="inline-flex w-full cursor-not-allowed justify-center rounded-2xl border-2 border-white/45 bg-white/10 px-6 py-4 text-center font-black text-white/80 backdrop-blur sm:w-auto"
                      disabled
                      type="button"
                    >
                      🔒 {c.bossLocked}
                    </button>
                    <p className="mt-2 max-w-[260px] text-sm font-bold text-[#EDE9FE]">
                      {c.bossLockedText}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="relative min-h-[270px] overflow-visible sm:min-h-[310px]">
              <div className="absolute right-2 top-8 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
              <div className="relative mx-auto flex h-full max-w-[380px] items-center justify-center">
                {xpToday > 0 ? (
                  <div className="absolute right-3 top-2 rounded-[22px] border-2 border-white/30 bg-white/20 px-4 py-3 font-black text-white shadow-[0_8px_0_rgba(30,27,75,0.18)] backdrop-blur-md animate-[sana-bubble_3.2s_ease-in-out_infinite]">
                    ⭐ +{xpToday} XP
                  </div>
                ) : null}
                {completedLessons > 0 ? (
                  <div className="absolute left-0 top-16 rounded-[22px] bg-[#FACC15] px-4 py-3 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] animate-[sana-spark_2.8s_ease-in-out_infinite]">
                    🔥 Quest Complete
                  </div>
                ) : null}
                <div className="relative rounded-full bg-white/15 p-4 ring-2 ring-white/30 shadow-[0_20px_60px_rgba(30,27,75,0.28)] animate-[sana-live_5.5s_ease-in-out_infinite]">
                  <div className="absolute inset-2 rounded-full border-2 border-white/20" />
                  <div className="absolute -left-3 top-9 z-10 rounded-2xl border-2 border-white/50 bg-white px-4 py-2 text-sm font-black text-[#6D28D9] shadow-[0_6px_0_rgba(30,27,75,0.16)] animate-[sana-bubble_2.8s_ease-in-out_infinite]">
                    Сәлем!
                  </div>
                  <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_16px_0_rgba(30,27,75,0.18)] md:h-72 md:w-72">
                    <video
                      aria-label="Animated AI-Sana tutor"
                      autoPlay
                      className="h-full w-full scale-[1.42] object-cover object-[center_62%]"
                      height={288}
                      loop
                      muted
                      playsInline
                      poster={aiSanaPoster}
                      preload="auto"
                      src={aiSanaAnimated}
                      style={{
                        display: "block",
                        height: "100%",
                        maxHeight: 288,
                        maxWidth: 288,
                        objectFit: "cover",
                        width: "100%",
                      }}
                      width={288}
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/70 to-transparent" />
                    <span className="sana-wave-line sana-wave-line-1" />
                    <span className="sana-wave-line sana-wave-line-2" />
                    <span className="sana-wave-line sana-wave-line-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <GameCard className="relative overflow-hidden">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
                  Learning Path
                </p>
                <h2 className="mt-2 text-3xl font-black">Жарайсың!</h2>
              </div>
              <div className="rounded-2xl bg-[#F5F3FF] px-4 py-3 font-black text-[#6D28D9]">
                ⭐ 0 XP today
              </div>
            </div>
            <div className="relative mx-auto max-w-xl py-4">
              <div className="absolute left-1/2 top-12 h-[calc(100%-6rem)] w-4 -translate-x-1/2 rounded-full bg-[#DDD6FE]" />
              <div className="relative space-y-8">
                {lessonNodes.map((node, index) => (
                  <LessonNode key={node.title} node={node} index={index} />
                ))}
              </div>
            </div>
          </GameCard>

          <div className="space-y-5">
            <GameCard className="bg-[#FFF7CC]">
              <div className="text-5xl">🎁</div>
              <h3 className="mt-3 text-2xl font-black">{c.ready}</h3>
              <p className="mt-2 font-semibold text-[#6B5E8F]">
                Алғашқы сабақтан кейін прогресс басталады.
              </p>
              <ProgressBar value={0} />
            </GameCard>
            <GameCard className="border-[#FACC15] bg-[#1E1B4B] text-white">
              <p className="text-sm font-black uppercase tracking-widest text-[#FACC15]">Special</p>
              <h3 className="mt-2 text-2xl font-black">{c.boss}</h3>
              <p className="mt-2 text-[#DDD6FE]">{c.bossText}</p>
              <Link
                to="/exam"
                className="mt-5 inline-flex rounded-2xl bg-[#FACC15] px-5 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]"
              >
                Boss Test
              </Link>
            </GameCard>
          </div>
        </section>
      </div>
    </GameLayout>
  );
}

function LessonNode({ node, index }: { node: (typeof lessonNodes)[number]; index: number }) {
  const side = index % 2 === 0 ? "md:mr-auto" : "md:ml-auto";
  const stateClass =
    node.state === "done"
      ? "bg-[#22C55E] text-white shadow-[0_8px_0_#15803D]"
      : node.state === "current"
        ? "bg-[#8B5CF6] text-white shadow-[0_8px_0_#5B21B6] animate-[reward-pop_0.8s_ease_both]"
        : node.state === "boss"
          ? "bg-[#1E1B4B] text-[#FACC15] shadow-[0_8px_0_#0F0B2E] ring-4 ring-[#FACC15]/40"
          : "bg-[#EDE9FE] text-[#8B5CF6] shadow-[0_8px_0_#DDD6FE]";
  return (
    <Link
      to={node.href as never}
      className={`relative z-10 flex w-full items-center gap-4 rounded-[28px] border-2 border-[#DDD6FE] bg-white p-4 transition hover:-translate-y-1 md:w-[72%] ${side}`}
    >
      <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-full ${stateClass}`}>
        <span className="material-symbols-outlined text-4xl">
          {node.state === "locked" ? "lock" : node.icon}
        </span>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
          Lesson {index + 1}
        </p>
        <h3 className="text-xl font-black text-[#1E1B4B]">{node.title}</h3>
        <p className="mt-1 text-sm font-bold text-[#6B5E8F]">Қатеңді AI-Sana түсіндіреді</p>
      </div>
    </Link>
  );
}
