import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AibiMark } from "@/components/aibi-mark";
import { SiteFooter } from "@/components/site-footer";
import { Lang, useLanguage } from "@/hooks/use-language";
import { getAccountDashboard, logoutAccount } from "@/lib/api/account.functions";
import type { Account } from "@/lib/account-store.server";

type NavItem = {
  label: string;
  icon: string;
  to: string;
};

const labels = {
  KZ: {
    home: "Басты бет",
    path: "Оқу жолы",
    practice: "Жаттығу",
    tutor: "AI Tutor",
    progress: "Прогресс",
    profile: "Профиль",
    leaderboard: "Рейтинг",
    shop: "Дүкен",
    today: "Бүгінгі мақсат",
    lessons: "3 сабақ",
    weak: "Әлсіз тақырыптар",
    weekly: "Апталық прогресс",
    parent: "Ата-ана есебі",
    ai: "AI түсіндірме",
    aiText: "Қатеңді AI-Sana қадамдап түсіндіреді",
    example: "Мысалын көру",
    reward: "Сыйлық ашылды!",
  },
  RU: {
    home: "Главная",
    path: "Путь",
    practice: "Практика",
    tutor: "AI Tutor",
    progress: "Прогресс",
    profile: "Профиль",
    leaderboard: "Лига",
    shop: "Магазин",
    today: "Цель дня",
    lessons: "3 урока",
    weak: "Слабые темы",
    weekly: "Прогресс недели",
    parent: "Отчет родителю",
    ai: "AI-разбор",
    aiText: "AI-Sana объяснит ошибку по шагам",
    example: "Посмотреть пример",
    reward: "Подарок открыт!",
  },
  EN: {
    home: "Home",
    path: "Learning Path",
    practice: "Practice",
    tutor: "AI Tutor",
    progress: "Progress",
    profile: "Profile",
    leaderboard: "Leaderboard",
    shop: "Shop",
    today: "Daily Goal",
    lessons: "3 lessons",
    weak: "Weak Topics",
    weekly: "Weekly Progress",
    parent: "Parent Report",
    ai: "AI Explanation",
    aiText: "AI-Sana explains mistakes step by step",
    example: "See example",
    reward: "Gift unlocked!",
  },
} satisfies Record<Lang, Record<string, string>>;

export function GameLayout({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  const location = useLocation();
  const access = useAccessGate();
  const simpleShell = isSimpleShellRoute(location.pathname);

  if (access.redirecting) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F5F3FF] px-4 text-center text-[#1E1B4B]">
        <GameCard>
          <p className="text-lg font-black">Ата-ананы Telegram арқылы растау қажет</p>
          <p className="mt-2 font-semibold text-[#6B5E8F]">Растау бетіне жіберіп жатырмыз...</p>
        </GameCard>
      </div>
    );
  }

  if (simpleShell) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B]">
        <GameTopBar compact />
        <main className="mx-auto min-h-[calc(100vh-420px)] w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
          {children}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1E1B4B]">
      <GameTopBar />
      <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-3 pb-24 pt-4 md:grid-cols-[216px_minmax(0,1fr)] md:px-5 lg:grid-cols-[220px_minmax(0,1fr)_300px] xl:grid-cols-[232px_minmax(0,1fr)_316px]">
        <GameSidebar />
        <main className="min-w-0 space-y-5">
          {access.paywalled ? <PaywallCard /> : null}
          {children}
        </main>
        <aside className="hidden lg:block">{right ?? <RightWidgets />}</aside>
      </div>
      <SiteFooter />
      <MobileGameNav />
    </div>
  );
}

function useAccessGate() {
  const location = useLocation();
  const [account, setAccount] = useState<Account | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const pathname = location.pathname;

  useEffect(() => {
    let mounted = true;
    setLoadingAccess(true);
    void getAccountDashboard().then((dashboard) => {
      if (mounted) {
        setAccount(dashboard.account);
        setAuthenticated(dashboard.authenticated);
        setLoadingAccess(false);
      }
    }).catch(() => {
      if (mounted) {
        setAuthenticated(false);
        setLoadingAccess(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (loadingAccess || !account || typeof window === "undefined") {
      return;
    }

    const redirect = (to: string) => {
      if (pathname === to) return;
      setRedirecting(true);
      window.location.href = to;
    };

    if (!authenticated) {
      if (isProtectedBeforeLogin(pathname)) redirect("/login");
      return;
    }

    if (!isTelegramVerified(account)) {
      if (isProtectedBeforeTelegram(pathname)) redirect("/verify-parent-telegram");
      return;
    }

    if (!account.diagnosticCompleted && isProtectedBeforeDiagnostic(pathname)) {
      redirect("/diagnostic");
      return;
    }

    if (isPaidRoute(pathname) && !hasActiveSubscription(account)) {
      redirect("/pricing");
    }
  }, [account, authenticated, loadingAccess, pathname]);

  return {
    redirecting,
    paywalled: Boolean(authenticated && account && isTelegramVerified(account) && isPaidRoute(pathname) && !hasActiveSubscription(account)),
  };
}

function isSimpleShellRoute(pathname: string) {
  return [
    "/",
    "/login",
    "/register",
    "/verify-parent-telegram",
    "/diagnostic",
    "/diagnostic-test",
    "/diagnostic-result",
    "/pricing",
    "/payment",
    "/about",
    "/careers",
    "/privacy",
  ].includes(pathname);
}

function isTelegramVerified(account: Account) {
  return account.telegramParentVerified || (account.parentTelegramConnected && account.parentPhoneVerified);
}

function hasActiveSubscription(account: Account) {
  if (account.subscriptionStatus !== "active") {
    return false;
  }

  if (!account.subscriptionExpiresAt) {
    return true;
  }

  return new Date(account.subscriptionExpiresAt).getTime() > Date.now();
}

function isProtectedBeforeLogin(pathname: string) {
  return ![
    "/",
    "/login",
    "/register",
    "/about",
    "/careers",
    "/privacy",
  ].includes(pathname);
}

function isProtectedBeforeTelegram(pathname: string) {
  return ![
    "/login",
    "/register",
    "/verify-parent-telegram",
    "/about",
    "/careers",
    "/privacy",
  ].includes(pathname);
}

function isProtectedBeforeDiagnostic(pathname: string) {
  return ![
    "/login",
    "/register",
    "/verify-parent-telegram",
    "/diagnostic",
    "/diagnostic-test",
    "/about",
    "/careers",
    "/privacy",
  ].includes(pathname);
}

function isPaidRoute(pathname: string) {
  if ([
    "/diagnostic",
    "/diagnostic-test",
    "/diagnostic-result",
    "/pricing",
    "/payment",
    "/verify-parent-telegram",
  ].includes(pathname)) {
    return false;
  }

  return (
    pathname === "/" ||
    pathname.startsWith("/lesson") ||
    pathname.startsWith("/subjects") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/topic-challenge") ||
    pathname.startsWith("/exam") ||
    pathname.startsWith("/explain-solution")
  );
}

function PaywallCard() {
  return (
    <GameCard className="border-[#FACC15] bg-[#FFFBEB]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1E1B4B]">Жазылым қажет</h2>
          <p className="mt-2 font-semibold text-[#6B5E8F]">
            Диагностикалық тест тегін. Толық сабақтар, жаттығулар және AI түсіндірмелерін ашу үшін тариф таңдаңыз.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]" to="/pricing">
            Тарифтерді көру
          </Link>
          <Link className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-3 font-black text-[#6D28D9]" to="/diagnostic">
            Диагностикалық тестке өту
          </Link>
        </div>
      </div>
    </GameCard>
  );
}

export function GameTopBar({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);
  const logoutLabel = language === "RU" ? "Выйти" : language === "EN" ? "Log out" : "Шығу";

  useEffect(() => {
    let mounted = true;
    void getAccountDashboard().then((dashboard) => {
      if (mounted) {
        setAuthenticated(dashboard.authenticated);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#DDD6FE] bg-white/92 shadow-[0_6px_0_rgba(109,40,217,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-3 md:px-5">
        <Link to="/" className="flex shrink-0 items-center gap-2 md:w-[220px]">
          <AibiMark size="md" className="shadow-[0_5px_0_rgba(109,40,217,0.18)]" />
          <span className="hidden text-2xl font-black tracking-tight text-[#6D28D9] sm:inline">
            AI-Sana
          </span>
        </Link>
        {!compact ? (
          <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
            <StatusPill icon="🔥" value="12 күн" />
            <StatusPill icon="❤️" value="5" />
            <StatusPill icon="⭐" value="2450" />
            <StatusPill icon="💎" value="1280" />
            <StatusPill icon="🏆" value="16" />
          </div>
        ) : (
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-black text-[#4B3D73] md:flex">
            <Link className="transition hover:text-[#6D28D9]" to="/about">
              Біз туралы
            </Link>
            <Link className="transition hover:text-[#6D28D9]" to="/privacy">
              Құпиялылық
            </Link>
          </nav>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="flex rounded-full border-2 border-[#DDD6FE] bg-[#F5F3FF] p-1 shadow-[0_4px_0_rgba(109,40,217,0.08)]">
            {(["KZ", "RU", "EN"] as Lang[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-2.5 py-1 text-sm font-black transition ${
                  language === lang ? "bg-[#6D28D9] text-white" : "text-[#1E1B4B]"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          {authenticated ? (
            <>
              <Link
                to="/profile"
                className="grid h-11 w-11 place-items-center rounded-full bg-[#8B5CF6] font-black text-white shadow-[0_5px_0_#5B21B6] transition hover:-translate-y-0.5"
              >
                AA
              </Link>
              <button
                className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-3 py-2 text-sm font-black text-[#6D28D9] shadow-[0_4px_0_rgba(109,40,217,0.12)] transition hover:-translate-y-0.5"
                type="button"
                onClick={() => {
                  void logoutAccount().finally(() => {
                    window.location.href = "/login";
                  });
                }}
              >
                {logoutLabel}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-2xl bg-[#6D28D9] px-4 py-2.5 text-sm font-black text-white shadow-[0_5px_0_#4C1D95] transition hover:-translate-y-0.5"
            >
              Кіру
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function GameSidebar() {
  const { language } = useLanguage();
  const location = useLocation();
  const c = labels[language];
  const items: NavItem[] = [
    { label: c.home, icon: "home", to: "/" },
    { label: c.path, icon: "route", to: "/home" },
    { label: c.practice, icon: "exercise", to: "/plan" },
    { label: c.tutor, icon: "smart_toy", to: "/explain-solution" },
    { label: c.progress, icon: "monitoring", to: "/progress" },
    { label: c.profile, icon: "person", to: "/profile" },
    { label: c.leaderboard, icon: "leaderboard", to: "/leaderboard" },
    { label: c.shop, icon: "storefront", to: "/shop" },
  ];
  return (
    <aside className="hidden md:block">
      <div className="sticky top-20 rounded-[28px] border-2 border-[#DDD6FE] bg-white p-3 shadow-[0_10px_0_rgba(109,40,217,0.10)]">
        <div className="mb-3 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] p-3 text-white shadow-[0_6px_0_rgba(76,29,149,0.28)]">
          <div className="flex items-center gap-3">
            <AibiMark size="lg" className="bg-white" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">AI-Sana</p>
              <p className="text-sm font-black leading-tight">Келесі деңгейге дайынсың!</p>
            </div>
          </div>
        </div>
        <nav className="space-y-1.5">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to as never}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition ${
                  active
                    ? "bg-[#6D28D9] text-white shadow-[0_5px_0_#4C1D95]"
                    : "text-[#4C1D95] hover:bg-[#EDE9FE]"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function MobileGameNav() {
  const { language } = useLanguage();
  const location = useLocation();
  const c = labels[language];
  const items: NavItem[] = [
    { label: c.home, icon: "home", to: "/" },
    { label: c.practice, icon: "exercise", to: "/plan" },
    { label: c.tutor, icon: "smart_toy", to: "/explain-solution" },
    { label: c.progress, icon: "monitoring", to: "/progress" },
    { label: c.shop, icon: "storefront", to: "/shop" },
  ];
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[26px] border-2 border-[#DDD6FE] bg-white/95 p-2 shadow-[0_8px_0_rgba(109,40,217,0.18)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to as never}
              className={`grid place-items-center rounded-2xl px-2 py-2 ${
                active ? "bg-[#6D28D9] text-white" : "text-[#6D28D9]"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              <span className="mt-1 max-w-full truncate text-[10px] font-black">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function StatusPill({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="shrink-0 rounded-full border-2 border-[#DDD6FE] bg-white px-3 py-2 text-sm font-black shadow-[0_4px_0_rgba(109,40,217,0.10)]">
      <span className="mr-1">{icon}</span>
      {value}
    </div>
  );
}

export function RightWidgets() {
  const { language } = useLanguage();
  const c = labels[language];
  return (
    <div className="sticky top-20 space-y-4">
      <GameCard className="bg-white/95">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#8B5CF6]">{c.today}</p>
            <h3 className="mt-1 text-2xl font-black">{c.lessons}</h3>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FACC15] text-2xl shadow-[0_5px_0_#CA8A04]">
            🎁
          </div>
        </div>
        <ProgressBar value={66} />
        <p className="mt-3 text-sm font-bold text-[#6B5E8F]">{c.reward}</p>
      </GameCard>
      <GameCard className="bg-white/95">
        <h3 className="text-lg font-black">{c.weak}</h3>
        <WeakTopic name="Пайыздар" value={28} />
        <WeakTopic name="Сөйлемдегі байланыс" value={35} />
      </GameCard>
      <GameCard className="bg-white/95">
        <h3 className="text-lg font-black">{c.weekly}</h3>
        <div className="mt-4 flex h-28 items-end gap-2">
          {[42, 58, 51, 70, 82, 68, 88].map((h, i) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={i}>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#6D28D9] to-[#C084FC]"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-3xl font-black text-[#6D28D9]">82%</p>
      </GameCard>
      <GameCard>
        <h3 className="text-lg font-black">{c.parent}</h3>
        <p className="mt-2 text-sm font-semibold text-[#6B5E8F]">
          18 сабақ, 73% дұрыс жауап, белсенділік жоғары.
        </p>
      </GameCard>
      <GameCard className="bg-[#1E1B4B] text-white">
        <h3 className="text-lg font-black">{c.ai}</h3>
        <p className="mt-2 text-sm text-[#DDD6FE]">{c.aiText}</p>
        <Link
          to="/explain-solution"
          className="mt-4 inline-flex rounded-2xl bg-[#FACC15] px-4 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]"
        >
          {c.example}
        </Link>
      </GameCard>
    </div>
  );
}

function WeakTopic({ name, value }: { name: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-sm font-black">
        <span>{name}</span>
        <span className="text-[#EF4444]">{value}%</span>
      </div>
      <ProgressBar value={value} danger />
    </div>
  );
}

export function GameCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-[28px] border-2 border-[#DDD6FE] bg-white p-5 shadow-[0_9px_0_rgba(109,40,217,0.12)] ${className}`}
    >
      {children}
    </section>
  );
}

export function ProgressBar({ value, danger = false }: { value: number; danger?: boolean }) {
  return (
    <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#EDE9FE]">
      <div
        className={`h-full rounded-full ${danger ? "bg-[#EF4444]" : "bg-[#22C55E]"}`}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export function MascotCoach({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border-2 border-[#DDD6FE] bg-white p-4 shadow-[0_8px_0_rgba(109,40,217,0.12)]">
      <AibiMark size="lg" className="motion-float bg-[#F5F3FF]" />
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">AI-Sana</p>
        <p className="font-black text-[#1E1B4B]">{text}</p>
      </div>
    </div>
  );
}
