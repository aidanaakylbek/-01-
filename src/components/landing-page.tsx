import { Link } from "@tanstack/react-router";
import aiSanaBotAvatarImage from "@/assets/ai-sana-bot-avatar.png";
import { GameCard, GameLayout } from "@/components/gamified-platform";
import { useLanguage } from "@/hooks/use-language";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function LandingPage() {
  const { t, language } = useLanguage();
  useDocumentTitle(
    language === "RU"
      ? "AI-Sana — Платформа подготовки к НИШ и БИЛ"
      : "AI-Sana — НЗМ және БИЛ-ге дайындық платформасы",
  );
  const stats = [
    { value: t("stats_transform_val"), label: t("stats_transform_lbl"), desc: t("stats_transform_desc") },
    { value: t("stats_path_val"), label: t("stats_path_lbl"), desc: t("stats_path_desc") },
    { value: t("stats_learners_val"), label: t("stats_learners_lbl"), desc: t("stats_learners_desc") },
  ];

  const features = [
    { icon: "psychology", title: t("feat_diagnostics_title"), desc: t("feat_diagnostics_desc") },
    { icon: "route", title: t("feat_plans_title"), desc: t("feat_plans_desc") },
    { icon: "troubleshoot", title: t("feat_errors_title"), desc: t("feat_errors_desc") },
  ];

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#8B5CF6] text-white">
          <div className="absolute right-[-60px] top-[-70px] h-48 w-48 rounded-full bg-[#C084FC]/25 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_260px] lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
                {t("hero_tagline")}
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                {t("hero_title_1")}
                {t("hero_title_2")}
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-semibold text-[#EDE9FE]">{t("hero_desc")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex rounded-2xl bg-[#FACC15] px-8 py-4 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] transition hover:-translate-y-0.5"
                >
                  {t("hero_btn_diagnostic")}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex rounded-2xl border-2 border-white/40 px-8 py-4 font-black text-white transition hover:bg-white/10"
                >
                  {t("nav_sign_in")}
                </Link>
              </div>
            </div>
            <div className="relative hidden min-h-[220px] items-center justify-center lg:flex">
              <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_16px_0_rgba(30,27,75,0.18)]">
                <img
                  alt="AI-Sana"
                  className="h-full w-full scale-[1.18] object-cover object-top"
                  draggable={false}
                  src={aiSanaBotAvatarImage}
                />
              </div>
            </div>
          </div>
        </GameCard>

        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <GameCard key={stat.label} className="bg-white/95">
              <p className="text-4xl font-black text-[#6D28D9]">{stat.value}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                {stat.label}
              </p>
              <p className="mt-3 font-semibold leading-6 text-[#6B5E8F]">{stat.desc}</p>
            </GameCard>
          ))}
        </div>

        <GameCard className="bg-white/95">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">AI-Sana</p>
          <h2 className="mt-2 text-3xl font-black text-[#1E1B4B] md:text-4xl">
            {t("features_title_1")}
            <span className="text-[#6D28D9]">{t("features_title_2")}</span>
          </h2>
          <p className="mt-3 max-w-2xl font-semibold text-[#6B5E8F]">{t("features_desc")}</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-5"
              >
                <span className="material-symbols-outlined text-3xl text-[#6D28D9]">
                  {feature.icon}
                </span>
                <h3 className="mt-3 text-xl font-black text-[#1E1B4B]">{feature.title}</h3>
                <p className="mt-2 font-semibold leading-6 text-[#6B5E8F]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </GameCard>

        <GameCard className="overflow-hidden bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <h2 className="text-3xl font-black md:text-4xl">
            {t("vision_title_1")}
            <span className="text-[#FACC15]">{t("vision_title_2")}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-semibold text-[#EDE9FE]">{t("vision_desc")}</p>
        </GameCard>

        <GameCard className="overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-center text-white">
          <h2 className="text-3xl font-black md:text-5xl">{t("cta_title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-[#EDE9FE]">
            {t("cta_desc")}
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex rounded-2xl bg-[#FACC15] px-10 py-5 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04] transition hover:-translate-y-0.5"
          >
            {t("hero_btn_diagnostic")}
          </Link>
        </GameCard>
      </div>
    </GameLayout>
  );
}
