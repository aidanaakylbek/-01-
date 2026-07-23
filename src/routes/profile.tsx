import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AibiMark } from "@/components/aibi-mark";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { Account, DashboardAccount } from "@/lib/account-store.server";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — AI-Sana" }] }),
  component: ProfileRoute,
});

type Copy = ReturnType<typeof getCopy>;

function ProfileRoute() {
  const { language } = useLanguage();
  const c = getCopy(language);
  const [dashboard, setDashboard] = useState<DashboardAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void getAccountDashboard()
      .then((data) => {
        if (mounted) {
          setDashboard(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setDashboard(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <GameLayout>
        <ProfileSkeleton />
      </GameLayout>
    );
  }

  if (!dashboard) {
    return (
      <GameLayout>
        <GameCard>
          <h1 className="text-2xl font-black text-[#1E1B4B]">{c.loadError}</h1>
          <p className="mt-2 font-semibold text-[#6B5E8F]">{c.loadErrorText}</p>
        </GameCard>
      </GameLayout>
    );
  }

  return <ProfileContent dashboard={dashboard} copy={c} language={language} />;
}

function ProfileContent({
  copy: c,
  dashboard,
  language,
}: {
  copy: Copy;
  dashboard: DashboardAccount;
  language: string;
}) {
  const account = dashboard.account;
  const achievements = useMemo(() => buildAchievements(dashboard, c), [dashboard, c]);
  const recentItems = useMemo(() => buildRecentItems(dashboard, c), [dashboard, c]);
  const telegramConnected =
    account.telegramParentVerified ||
    (account.parentTelegramConnected && account.parentPhoneVerified);
  const activeSubscription = hasActiveSubscription(account);
  const stats = [
    { icon: "⭐", label: "XP", value: `${dashboard.completedLessons * 40}` },
    { icon: "🔥", label: c.streak, value: `${dashboard.completedLessons}` },
    { icon: "🏅", label: c.badges, value: `${achievements.length}` },
    { icon: "🎯", label: c.accuracy, value: `${dashboard.averageAccuracy}%` },
  ];

  const recommendation =
    dashboard.recommendations.find((item) => item.trim().length > 0) ??
    (dashboard.completedLessons > 0 ? c.defaultAdvice : "");

  return (
    <GameLayout>
      <div className="space-y-5">
        <section className="rounded-[28px] border-2 border-[#C4B5FD] bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] p-5 text-white shadow-[0_8px_0_#DDD6FE] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <AibiMark
                size="lg"
                className="h-20 w-20 border-4 border-white bg-white md:h-24 md:w-24"
              />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FACC15]">
                  {c.profile}
                </p>
                <h1 className="mt-1 text-3xl font-black leading-tight md:text-4xl">
                  {account.name}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ProfileChip text={`${c.level} 1`} />
                  <ProfileChip text={`${c.league}: ${c.purpleLeague}`} />
                  <ProfileChip text={`${c.grade}: ${account.grade || c.notSet}`} />
                </div>
              </div>
            </div>
            <CompactCoins />
          </div>
        </section>

        {recommendation ? (
          <section className="rounded-[24px] border-2 border-[#DDD6FE] bg-white px-5 py-4 shadow-[0_6px_0_#EDE9FE]">
            <div className="flex items-start gap-3">
              <AibiMark size="sm" className="h-12 w-12 bg-[#F5F3FF]" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7C3AED]">
                  {c.aiAdvice}
                </p>
                <p className="mt-1 font-bold leading-relaxed text-[#4C3F6F]">{recommendation}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <PersonalInfoCard
              account={account}
              activeSubscription={activeSubscription}
              copy={c}
              language={language}
              telegramConnected={telegramConnected}
            />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <CompactStat key={stat.label} {...stat} />
              ))}
            </section>

            <RecentActivity items={recentItems.slice(0, 3)} copy={c} />
            <LearningHistory items={recentItems} copy={c} />
          </div>

          <aside className="space-y-5">
            <AccountStatusCard
              account={account}
              activeSubscription={activeSubscription}
              copy={c}
              telegramConnected={telegramConnected}
            />
            <AchievementsCard achievements={achievements.slice(0, 3)} copy={c} />
            <EditProfileCard copy={c} />
          </aside>
        </section>
      </div>
    </GameLayout>
  );
}

function PersonalInfoCard({
  account,
  activeSubscription,
  copy: c,
  language,
  telegramConnected,
}: {
  account: Account;
  activeSubscription: boolean;
  copy: Copy;
  language: string;
  telegramConnected: boolean;
}) {
  const items = [
    [c.studentName, account.name],
    [c.email, account.email],
    [c.grade, account.grade || c.notSet],
    [c.targetSchool, "НЗМ / БИЛ / РФММ"],
    [c.registrationDate, c.notAvailable],
    [c.language, language === "RU" ? c.russian : c.kazakh],
    [c.telegram, telegramConnected ? c.connected : c.notConnected],
    [c.subscription, activeSubscription ? c.active : c.inactive],
  ];

  return (
    <GameCard className="p-5 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <AibiMark size="lg" className="h-20 w-20 shrink-0 bg-[#F5F3FF]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#7C3AED]">
                {c.personalInfo}
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#1E1B4B]">{account.name}</h2>
            </div>
            <Link
              className="inline-flex w-fit items-center justify-center rounded-2xl border-2 border-[#C4B5FD] bg-white px-4 py-3 font-black text-[#6D28D9] shadow-[0_4px_0_#DDD6FE] transition hover:-translate-y-0.5"
              to="/profile"
            >
              {c.editProfile}
            </Link>
          </div>

          <dl className="mt-5 grid gap-3 md:grid-cols-2">
            {items.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#F5F3FF] px-4 py-3">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-[#8B5CF6]">
                  {label}
                </dt>
                <dd className="mt-1 break-words font-black text-[#1E1B4B]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </GameCard>
  );
}

function AccountStatusCard({
  account,
  activeSubscription,
  copy: c,
  telegramConnected,
}: {
  account: Account;
  activeSubscription: boolean;
  copy: Copy;
  telegramConnected: boolean;
}) {
  const statuses = [
    { label: c.emailStatus, tone: "green" as const, value: c.emailRegistered },
    {
      label: c.telegramStatus,
      tone: telegramConnected ? ("green" as const) : ("yellow" as const),
      value: telegramConnected ? c.connected : c.notConnected,
    },
    {
      label: c.parentStatus,
      tone: account.parentTelegramConnected ? ("green" as const) : ("yellow" as const),
      value: account.parentTelegramConnected ? c.connected : c.notConnected,
    },
    {
      label: c.subscriptionStatus,
      tone: activeSubscription ? ("purple" as const) : ("yellow" as const),
      value: activeSubscription ? c.active : c.inactive,
    },
  ];

  return (
    <GameCard className="p-5">
      <h2 className="text-xl font-black text-[#1E1B4B]">{c.accountStatus}</h2>
      <div className="mt-4 space-y-3">
        {statuses.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#F5F3FF] px-4 py-3"
          >
            <span className="font-black text-[#4C3F6F]">{status.label}</span>
            <StatusPill tone={status.tone}>{status.value}</StatusPill>
          </div>
        ))}
      </div>
    </GameCard>
  );
}

function RecentActivity({ copy: c, items }: { copy: Copy; items: ActivityItem[] }) {
  return (
    <GameCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#1E1B4B]">{c.recentActivity}</h2>
        <span className="rounded-full bg-[#F5F3FF] px-3 py-1 text-sm font-black text-[#7C3AED]">
          {items.length}
        </span>
      </div>
      {items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <ActivityRow key={`${item.title}-${item.date}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyHistory copy={c} />
      )}
    </GameCard>
  );
}

function LearningHistory({ copy: c, items }: { copy: Copy; items: ActivityItem[] }) {
  return (
    <GameCard className="p-5">
      <h2 className="text-xl font-black text-[#1E1B4B]">{c.learningHistory}</h2>
      {items.length ? (
        <div className="mt-4 divide-y-2 divide-[#EDE9FE]">
          {items.slice(0, 5).map((item) => (
            <ActivityRow key={`${item.title}-${item.date}-history`} item={item} compact />
          ))}
        </div>
      ) : (
        <EmptyHistory copy={c} />
      )}
    </GameCard>
  );
}

function EmptyHistory({ copy: c }: { copy: Copy }) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-[#C4B5FD] bg-[#F5F3FF] p-4">
      <p className="font-bold text-[#6B5E8F]">{c.emptyHistory}</p>
      <Link
        className="mt-3 inline-flex rounded-2xl bg-[#FACC15] px-4 py-3 font-black text-[#1E1B4B] shadow-[0_4px_0_#D97706] transition hover:-translate-y-0.5"
        to="/diagnostic"
      >
        {c.startDiagnostic}
      </Link>
    </div>
  );
}

function AchievementsCard({
  achievements,
  copy: c,
}: {
  achievements: AchievementItem[];
  copy: Copy;
}) {
  if (!achievements.length) return null;

  return (
    <GameCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#1E1B4B]">{c.achievements}</h2>
        <button className="font-black text-[#7C3AED]" type="button">
          {c.viewAll}
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className="flex items-center gap-3 rounded-2xl bg-[#F5F3FF] px-4 py-3"
          >
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <p className="font-black text-[#1E1B4B]">{achievement.title}</p>
              <p className="text-sm font-bold text-[#6B5E8F]">{achievement.text}</p>
            </div>
          </div>
        ))}
      </div>
    </GameCard>
  );
}

function EditProfileCard({ copy: c }: { copy: Copy }) {
  return (
    <GameCard className="p-5">
      <h2 className="text-xl font-black text-[#1E1B4B]">{c.settings}</h2>
      <p className="mt-2 font-semibold text-[#6B5E8F]">{c.settingsText}</p>
      <Link
        className="mt-4 inline-flex rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95] transition hover:-translate-y-0.5"
        to="/profile"
      >
        {c.editProfile}
      </Link>
    </GameCard>
  );
}

function CompactCoins() {
  return (
    <div className="w-fit rounded-2xl border-2 border-white/40 bg-white/15 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Sana Coins</p>
      <p className="mt-1 text-2xl font-black">💎 0</p>
    </div>
  );
}

function CompactStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border-2 border-[#DDD6FE] bg-white px-4 py-4 shadow-[0_5px_0_#EDE9FE]">
      <p className="flex items-center gap-2 text-sm font-black text-[#6B5E8F]">
        <span>{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#1E1B4B]">{value}</p>
    </div>
  );
}

function ActivityRow({ compact, item }: { compact?: boolean; item: ActivityItem }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${compact ? "py-3" : "rounded-2xl bg-[#F5F3FF] px-4 py-3"}`}
    >
      <div className="min-w-0">
        <p className="truncate font-black text-[#1E1B4B]">{item.title}</p>
        <p className="text-sm font-bold text-[#6B5E8F]">{item.meta}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-[#7C3AED]">
        {item.date}
      </span>
    </div>
  );
}

function ProfileChip({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-black text-white">
      {text}
    </span>
  );
}

function StatusPill({ children, tone }: { children: string; tone: "green" | "purple" | "yellow" }) {
  const classes =
    tone === "green"
      ? "bg-[#DCFCE7] text-[#166534]"
      : tone === "purple"
        ? "bg-[#EDE9FE] text-[#6D28D9]"
        : "bg-[#FEF3C7] text-[#92400E]";

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>{children}</span>;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-40 animate-pulse rounded-[28px] bg-[#DDD6FE]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[28px] bg-white" />
        <div className="h-64 animate-pulse rounded-[28px] bg-white" />
      </div>
    </div>
  );
}

type ActivityItem = {
  date: string;
  meta: string;
  title: string;
};

type AchievementItem = {
  icon: string;
  text: string;
  title: string;
};

function buildRecentItems(dashboard: DashboardAccount, c: Copy): ActivityItem[] {
  const items: ActivityItem[] = [];

  if (dashboard.account.diagnosticCompleted) {
    items.push({
      date: c.today,
      meta: `${dashboard.account.diagnosticScore ?? 0}% · бастапқы деңгей анықталды`,
      title: c.diagnosticDone,
    });
  }

  dashboard.examAttempts.slice(0, 4).forEach((attempt) => {
    items.push({
      date: formatShortDate(attempt.createdAt),
      meta: `${attempt.correctAnswers}/${attempt.totalQuestions} · ${attempt.percent}%`,
      title: `${c.test}: ${attempt.examTrack}`,
    });
  });

  return items;
}

function buildAchievements(dashboard: DashboardAccount, c: Copy): AchievementItem[] {
  const achievements: AchievementItem[] = [];

  if (dashboard.account.diagnosticCompleted) {
    achievements.push({
      icon: "🥇",
      text: c.firstDiagnosticText,
      title: c.firstDiagnostic,
    });
  }

  if (dashboard.completedLessons > 0) {
    achievements.push({
      icon: "🔥",
      text: c.streakText,
      title: c.firstStreak,
    });
  }

  if (dashboard.averageAccuracy >= 80) {
    achievements.push({
      icon: "⭐",
      text: c.accuracyText,
      title: c.accuracyBadge,
    });
  }

  return achievements;
}

function hasActiveSubscription(account: Account) {
  if (account.role === "admin") return true;
  if (account.subscriptionStatus !== "active") return false;
  if (!account.subscriptionExpiresAt) return true;
  return new Date(account.subscriptionExpiresAt).getTime() > Date.now();
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("kk-KZ", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getCopy(language: string) {
  if (language === "RU") {
    return {
      accountStatus: "Статус аккаунта",
      achievements: "Последние достижения",
      accuracy: "Точность",
      accuracyBadge: "Высокая точность",
      accuracyText: "Результат выше 80%.",
      active: "Активна",
      aiAdvice: "Совет AI-Sana",
      badges: "Бейджи",
      connected: "Подключено",
      defaultAdvice: "Сохрани серию и заверши сегодня еще один урок.",
      diagnosticDone: "Диагностика завершена",
      editProfile: "Редактировать профиль",
      email: "Email",
      emailRegistered: "Email добавлен",
      emailStatus: "Email",
      emptyHistory: "История обучения появится после первого диагностического теста.",
      firstDiagnostic: "Первая диагностика",
      firstDiagnosticText: "Первый результат сохранен.",
      firstStreak: "Серия началась",
      grade: "Класс",
      inactive: "Неактивна",
      kazakh: "Казахский",
      language: "Язык",
      league: "Лига",
      learningHistory: "История обучения",
      level: "Уровень",
      loadError: "Профиль не загрузился",
      loadErrorText: "Попробуйте обновить страницу.",
      notAvailable: "—",
      notConnected: "Не подключено",
      notSet: "Не указано",
      parentStatus: "Родитель",
      personalInfo: "Личная информация",
      profile: "Профиль",
      purpleLeague: "Фиолетовая лига",
      recentActivity: "Недавняя активность",
      registrationDate: "Дата регистрации",
      russian: "Русский",
      settings: "Настройки профиля",
      settingsText: "Здесь позже появится изменение имени, класса и цели.",
      startDiagnostic: "Начать диагностику",
      streak: "Серия",
      streakText: "Первый учебный шаг сделан.",
      studentName: "Имя ученика",
      subscription: "Подписка",
      subscriptionStatus: "Подписка",
      targetSchool: "Цель",
      telegram: "Telegram",
      telegramStatus: "Telegram",
      test: "Тест",
      today: "Сегодня",
      viewAll: "Все",
    };
  }

  return {
    accountStatus: "Аккаунт статусы",
    achievements: "Соңғы жетістіктер",
    accuracy: "Дәлдік",
    accuracyBadge: "Жоғары дәлдік",
    accuracyText: "Нәтиже 80%-дан жоғары.",
    active: "Белсенді",
    aiAdvice: "AI-Sana кеңесі",
    badges: "Белгілер",
    connected: "Қосылған",
    defaultAdvice: "Серияңды сақтап, бүгін тағы бір сабақ аяқта.",
    diagnosticDone: "Диагностика аяқталды",
    editProfile: "Профильді өзгерту",
    email: "Электрондық пошта",
    emailRegistered: "Email қосылған",
    emailStatus: "Email",
    emptyHistory: "Оқу тарихы алғашқы диагностикалық тесттен кейін пайда болады.",
    firstDiagnostic: "Алғашқы диагностика",
    firstDiagnosticText: "Бірінші нәтиже сақталды.",
    firstStreak: "Серия басталды",
    grade: "Сынып",
    inactive: "Белсенді емес",
    kazakh: "Қазақша",
    language: "Тіл",
    league: "Лига",
    learningHistory: "Оқу тарихы",
    level: "Деңгей",
    loadError: "Профиль ашылмады",
    loadErrorText: "Бетті жаңартып көріңіз.",
    notAvailable: "—",
    notConnected: "Қосылмаған",
    notSet: "Көрсетілмеген",
    parentStatus: "Ата-ана",
    personalInfo: "Жеке ақпарат",
    profile: "Профиль",
    purpleLeague: "Күлгін лига",
    recentActivity: "Соңғы белсенділік",
    registrationDate: "Тіркелген күні",
    russian: "Орысша",
    settings: "Профиль баптауы",
    settingsText: "Мұнда кейін аты-жөн, сынып және мақсат өзгерту қосылады.",
    startDiagnostic: "Диагностиканы бастау",
    streak: "Серия",
    streakText: "Алғашқы оқу қадамы жасалды.",
    studentName: "Оқушының аты",
    subscription: "Жазылым",
    subscriptionStatus: "Жазылым",
    targetSchool: "Мақсат",
    telegram: "Telegram",
    telegramStatus: "Telegram",
    test: "Тест",
    today: "Бүгін",
    viewAll: "Барлығын көру",
  };
}
