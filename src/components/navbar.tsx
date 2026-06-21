import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useLanguage, Lang } from "@/hooks/use-language";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAccountDashboard } from "@/hooks/use-account-dashboard";
import { AibiMark } from "@/components/aibi-mark";

type Tab = "home" | "subjects" | "practice" | "progress" | "reports";

interface NavTab {
  id: Tab;
  labelKey: string;
  icon: string;
  to?: "/home" | "/subjects" | "/plan" | "/progress" | "/reports" | "/login" | "/register";
  disabled?: boolean;
}

const tabs: NavTab[] = [
  { id: "home", labelKey: "nav_home", icon: "home", to: "/home" },
  { id: "subjects", labelKey: "nav_subjects", icon: "auto_stories", to: "/subjects" },
  { id: "practice", labelKey: "nav_practice", icon: "exercise", to: "/plan" },
  { id: "progress", labelKey: "nav_progress", icon: "analytics", to: "/progress" },
  { id: "reports", labelKey: "nav_reports", icon: "description", to: "/reports" },
];

function useScrolled(threshold = 4): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function Navbar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const dashboard = useAccountDashboard();
  const location = useLocation();
  const account = dashboard?.account;
  const profileInitials = account?.initials ?? "AB";
  const profileName =
    account?.name ??
    (language === "KZ"
      ? "AI-Sana оқушысы"
      : language === "RU"
        ? "Ученик AI-Sana"
        : "AI-Sana Student");

  const currentPath = location.pathname;
  const isLanding = currentPath === "/";
  const authLabels =
    language === "RU"
      ? { register: "Регистрация", signIn: "Войти" }
      : language === "KZ"
        ? { register: "Тіркелу", signIn: "Кіру" }
        : { register: "Register", signIn: "Sign In" };
  const actionLabels =
    language === "RU"
      ? {
          notificationsTitle: "Уведомления",
          notificationOne: "Сегодня запланирована практика по логике.",
          notificationTwo: "Пробный экзамен: суббота, 10:00.",
          notificationThree: "Повторите тему: логические задачи.",
          profileTitle: "Профиль ученика",
          profileName: "AI-Sana Student",
          profileStatus: "68% готовности",
          myProgress: "Мой прогресс",
          studyPlan: "План обучения",
          signOut: "Выйти",
        }
      : language === "KZ"
        ? {
            notificationsTitle: "Хабарландырулар",
            notificationOne: "Бүгін логика бойынша жаттығу жоспарланған.",
            notificationTwo: "Сынақ емтихан: сенбі, 10:00.",
            notificationThree: "Тақырыпты қайталаңыз: логикалық есептер.",
            profileTitle: "Оқушы профилі",
            profileName: "AI-Sana Student",
            profileStatus: "68% дайындық",
            myProgress: "Менің прогресім",
            studyPlan: "Оқу жоспары",
            signOut: "Шығу",
          }
        : {
            notificationsTitle: "Notifications",
            notificationOne: "Logic practice is scheduled for today.",
            notificationTwo: "Mock exam: Saturday, 10:00.",
            notificationThree: "Review topic: Logic Problems.",
            profileTitle: "Student Profile",
            profileName: "AI-Sana Student",
            profileStatus: "68% readiness",
            myProgress: "My Progress",
            studyPlan: "Study Plan",
            signOut: "Sign Out",
          };
  const profileStatus = dashboard
    ? language === "KZ"
      ? `${dashboard.readiness}% дайындық`
      : language === "RU"
        ? `${dashboard.readiness}% готовности`
        : `${dashboard.readiness}% readiness`
    : actionLabels.profileStatus;

  // Determine active tab based on pathname
  const activeTab = (): Tab | "" => {
    if (currentPath === "/") return "home";
    if (currentPath.startsWith("/subjects")) return "subjects";
    if (currentPath.startsWith("/plan")) return "practice";
    if (currentPath.startsWith("/progress")) return "progress";
    if (currentPath.startsWith("/reports")) return "reports";
    if (currentPath.startsWith("/home")) return "home";
    return "";
  };

  const active = activeTab();

  const closeHeaderPanels = useCallback(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      closeHeaderPanels();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, closeHeaderPanels]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileOpen(false);
      setNotificationsOpen(false);
      setProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [mobileOpen, handleKeyDown]);

  const handleLangChange = (lang: Lang) => {
    setLanguage(lang);
  };

  const renderLangButtons = () => {
    return (["KZ", "RU", "EN"] as Lang[]).map((lang) => (
      <button
        key={lang}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLangChange(lang);
        }}
        aria-label={`Switch language to ${lang}`}
        aria-pressed={language === lang}
        className={`px-2 py-1 text-sm transition-colors cursor-pointer font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          language === lang
            ? "text-secondary font-bold"
            : "text-on-surface-variant hover:text-primary"
        }`}
        style={{ zIndex: 100, position: "relative" }}
      >
        {lang}
      </button>
    ));
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-surface-variant transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-container-padding-mobile md:px-container-padding-desktop py-base w-full max-w-7xl mx-auto min-h-20">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setMobileOpen(false)}
          >
            <AibiMark aria-hidden="true" size="md" />
            <h1 className="font-headline-md text-headline-md font-bold text-primary whitespace-nowrap">
              <span className="text-secondary font-bold">AI-Sana</span>
            </h1>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex justify-center items-center gap-2"
            aria-label="Main navigation"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === active;
              const className = `nav-link px-3 xl:px-4 py-2 font-label-md text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive ? "active text-primary" : "text-on-surface-variant hover:text-primary"
              } ${tab.disabled ? "opacity-45 cursor-not-allowed hover:text-on-surface-variant" : ""}`;

              if (tab.disabled || !tab.to) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled
                    className={className}
                    aria-disabled="true"
                  >
                    {t(tab.labelKey)}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  to={tab.to}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions (Switcher, Notification, Avatar) */}
          <div className="hidden md:flex items-center justify-end gap-3 xl:gap-5 relative">
            {/* Language Switcher */}
            <div
              className="flex gap-1 border border-outline-variant/50 rounded-full px-2 py-1 bg-surface-container-low"
              role="group"
              aria-label="Language selection"
            >
              {renderLangButtons()}
            </div>

            {isLanding && (
              <div className="hidden xl:flex items-center gap-2">
                <Link
                  to="/register"
                  className="inline-flex bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-5 py-3 hover:bg-secondary-container hover:text-on-secondary-container transition-colors btn-squish border border-secondary whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  {authLabels.register}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex bg-surface text-primary font-label-caps text-label-caps uppercase tracking-widest px-5 py-3 hover:bg-surface-container-high transition-colors btn-squish border border-primary whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {authLabels.signIn}
                </Link>
              </div>
            )}

            {/* Notifications */}
            <div className="hidden xl:block relative">
              <button
                aria-label={t("nav_notifications")}
                aria-expanded={notificationsOpen}
                aria-controls="notifications-panel"
                className="w-10 h-10 flex items-center justify-center text-primary hover:text-secondary btn-squish bg-transparent hover:bg-surface-container-high border border-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setProfileOpen(false);
                }}
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface" />
              {notificationsOpen && (
                <div
                  id="notifications-panel"
                  className="absolute right-0 top-12 w-80 bg-surface-container-lowest border border-outline-variant soft-shadow p-4 z-50"
                >
                  <h2 className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
                    {actionLabels.notificationsTitle}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {[
                      ["event_available", actionLabels.notificationOne],
                      ["emoji_events", actionLabels.notificationTwo],
                      ["priority_high", actionLabels.notificationThree],
                    ].map(([icon, text]) => (
                      <div
                        key={text}
                        className="flex items-start gap-3 border border-outline-variant bg-surface p-3"
                      >
                        <span className="material-symbols-outlined text-secondary text-xl">
                          {icon}
                        </span>
                        <p className="font-body-md text-sm text-on-surface-variant">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="hidden xl:block relative">
              <button
                aria-label={actionLabels.profileTitle}
                aria-expanded={profileOpen}
                aria-controls="profile-panel"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
              >
                <Avatar className="w-10 h-10 border border-outline-variant hover:border-secondary transition-colors cursor-pointer">
                  <AvatarFallback className="bg-secondary text-on-secondary font-bold">
                    {profileInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
              {profileOpen && (
                <div
                  id="profile-panel"
                  className="absolute right-0 top-12 w-72 bg-surface-container-lowest border border-outline-variant soft-shadow p-4 z-50"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-outline-variant">
                    <Avatar className="w-12 h-12 border border-outline-variant">
                      <AvatarFallback className="bg-secondary text-on-secondary font-bold">
                        {profileInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-label-md text-label-md text-primary font-bold">
                        {profileName}
                      </h2>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {profileStatus}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col py-3">
                    <Link
                      to="/progress"
                      className="flex items-center gap-3 px-2 py-3 hover:bg-surface-container-high text-primary font-label-md text-label-md"
                      onClick={closeHeaderPanels}
                    >
                      <span className="material-symbols-outlined">analytics</span>
                      {actionLabels.myProgress}
                    </Link>
                    <Link
                      to="/plan"
                      className="flex items-center gap-3 px-2 py-3 hover:bg-surface-container-high text-primary font-label-md text-label-md"
                      onClick={closeHeaderPanels}
                    >
                      <span className="material-symbols-outlined">exercise</span>
                      {actionLabels.studyPlan}
                    </Link>
                  </div>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-2 py-3 border-t border-outline-variant hover:bg-surface-container-high text-error font-label-md text-label-md"
                    onClick={closeHeaderPanels}
                  >
                    <span className="material-symbols-outlined">logout</span>
                    {actionLabels.signOut}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions: Language + Burger */}
          <div className="flex lg:hidden items-center justify-end gap-3">
            {/* Quick language toggle directly on header for mobile */}
            <div
              className="hidden sm:flex gap-1 border border-outline-variant/30 rounded-full px-2 py-0.5 bg-surface-container-low"
              role="group"
              aria-label="Language selection"
            >
              {renderLangButtons()}
            </div>

            {/* Burger menu button */}
            <button
              aria-label={mobileOpen ? t("nav_close_menu") : t("nav_open_menu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              className="w-10 h-10 flex items-center justify-center text-primary hover:text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="material-symbols-outlined text-3xl">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 bg-surface/98 backdrop-blur-lg flex flex-col animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Top Bar inside Menu */}
          <div className="flex justify-between items-center px-container-padding-mobile py-base h-20">
            <a
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <AibiMark aria-hidden="true" size="md" />
              <h1 className="font-headline-md text-headline-md font-bold text-primary">
                <span className="text-secondary font-bold">AI-Sana</span>
              </h1>
            </a>
            <button
              aria-label={t("nav_close_menu")}
              className="w-10 h-10 flex items-center justify-center text-primary hover:text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          {/* Links */}
          <nav
            className="flex-1 flex flex-col justify-center px-container-padding-mobile gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            aria-label="Mobile menu"
          >
            {tabs.map((tItem) => {
              const isActive = tItem.id === active;
              const className = `flex items-center gap-4 py-5 px-4 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive
                  ? "bg-secondary/10 text-secondary font-bold"
                  : "text-on-surface hover:bg-surface-container-high"
              } ${tItem.disabled ? "opacity-45 cursor-not-allowed hover:bg-transparent" : ""}`;

              if (tItem.disabled || !tItem.to) {
                return (
                  <button
                    key={tItem.id}
                    type="button"
                    disabled
                    aria-disabled="true"
                    className={className}
                  >
                    <span className="material-symbols-outlined text-2xl">{tItem.icon}</span>
                    <span className="font-headline-md text-headline-md">{t(tItem.labelKey)}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={tItem.id}
                  to={tItem.to}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {tItem.icon}
                  </span>
                  <span className="font-headline-md text-headline-md">{t(tItem.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Actions inside Menu */}
          <div className="px-container-padding-mobile pb-safe pb-8 flex flex-col gap-4">
            {isLanding && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-4 flex items-center justify-center gap-3 bg-secondary text-on-secondary border border-secondary hover:bg-secondary-container hover:text-on-secondary-container transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary font-label-md text-label-md"
                >
                  {authLabels.register}
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-4 flex items-center justify-center gap-3 bg-surface text-primary border border-primary hover:bg-surface-container-high transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary font-label-md text-label-md"
                >
                  {authLabels.signIn}
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-surface-variant/40 pt-4">
              {/* User profile section */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-outline-variant">
                  <AvatarFallback className="bg-secondary text-on-secondary font-bold">
                    {profileInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {profileName}
                </span>
              </div>

              {/* Language selection in menu */}
              <div
                className="flex gap-2 border border-outline-variant/30 rounded-full px-3 py-1 bg-surface-container-low"
                role="group"
                aria-label="Language selection"
              >
                {renderLangButtons()}
              </div>
            </div>

            {/* Notifications Button */}
            <button
              aria-label={t("nav_notifications")}
              className="w-full py-4 flex items-center justify-center gap-3 text-primary border border-outline-variant hover:bg-surface-container-high transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="font-label-md text-label-md">{t("nav_notifications")}</span>
            </button>
            {notificationsOpen && (
              <div className="border border-outline-variant bg-surface-container-lowest p-4">
                <h2 className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
                  {actionLabels.notificationsTitle}
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    ["event_available", actionLabels.notificationOne],
                    ["emoji_events", actionLabels.notificationTwo],
                    ["priority_high", actionLabels.notificationThree],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-start gap-3 bg-surface p-3">
                      <span className="material-symbols-outlined text-secondary text-xl">
                        {icon}
                      </span>
                      <p className="font-body-md text-sm text-on-surface-variant">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
