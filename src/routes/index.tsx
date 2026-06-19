import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AulBridge — Bridge to NIS & BIL Success" },
      {
        name: "description",
        content:
          "Personalized AI preparation designed for rural students. A custom learning path for NIS, BIL & NSPM success.",
      },
      { property: "og:title", content: "AulBridge — Bridge to NIS & BIL Success" },
      {
        property: "og:description",
        content: "Personalized AI preparation designed for rural students.",
      },
    ],
  }),
  component: Landing,
});

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

function Landing() {
  const { t, language } = useLanguage();

  return (
    <>
      <Navbar />

      {/* ───── Main Content ───── */}
      <main style={{ isolation: "isolate" }}>
        {/* Hero */}
        <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden px-margin-mobile md:px-margin-desktop">
          <div
            className="max-w-container-max mx-auto grid lg:grid-cols-12 gap-8 items-center relative"
            style={{ isolation: "isolate" }}
          >
            <div className="z-10 relative lg:col-span-5 lg:mt-asymmetric-offset">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-xl md:text-display-xl text-primary mb-8 leading-tight">
                {language === "KZ" ? (
                  <>
                    <span className="hand-drawn-underline text-secondary">
                      Зияткерлік мектептер
                    </span>{" "}
                    мен <span className="hand-drawn-underline text-secondary">БИЛ</span>-ге барар
                    жолыңыз
                  </>
                ) : language === "RU" ? (
                  <>
                    Постройте свой мост к успеху в{" "}
                    <span className="hand-drawn-underline text-secondary">НИШ</span> и{" "}
                    <span className="hand-drawn-underline text-secondary">БИЛ</span>
                  </>
                ) : (
                  <>
                    Build Your Bridge to{" "}
                    <span className="hand-drawn-underline text-secondary">NIS</span> and{" "}
                    <span className="hand-drawn-underline text-secondary">BIL</span> Success
                  </>
                )}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-xl">
                {t("hero_desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  to="/register"
                  className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-8 py-5 hover:bg-secondary-container hover:text-on-secondary-container transition-all btn-squish flex justify-center items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  {t("hero_btn_diagnostic")}
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
                <a
                  className="bg-transparent text-primary font-label-caps text-label-caps uppercase tracking-widest px-8 py-5 hover:bg-surface-container transition-all btn-squish flex justify-center items-center gap-3 border-2 border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                  href="#how-it-works"
                >
                  <span className="material-symbols-outlined text-xl">play_circle</span>
                  {t("hero_btn_video")}
                </a>
              </div>
            </div>
            <div className="relative z-0 lg:col-span-7 h-full min-h-[500px] lg:min-h-[700px] lg:-mt-asymmetric-offset pl-0 lg:pl-12">
              <div className="absolute inset-0 bg-surface-container-high organic-shape-1 translate-x-4 translate-y-4 opacity-50"></div>
              <div className="relative h-full w-full overflow-hidden border border-outline-variant rounded-tr-[100px] rounded-bl-[100px]">
                <img
                  alt="Bridge to the future illustration"
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALsLekp1kh9Qv7U3WcCfEXIbERnlzksP2BqJdq3RWWQJhwN8srSuBidfRR9xn-XjHS38yMnWa5HLGyt7pllRucngvYYljHaSW1Pcn9yN-uF1QkKckNBQbQhrdBhUkBJOyjs1wYoevyW42Ie_RjIyZMaSxNAk8_6IWhkFx28cTPMfepkJtPx2k0wkHzhmD_YvW1Jc_wY-8aApvIuQSz1k1S1SE3Ah0WCJIXpMUD2A6HDy_fWYHQKjTs1T0GXjcxjC_dMevk1P9QURk"
                />
                <div className="absolute inset-0 bg-secondary mix-blend-overlay opacity-10"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary-fixed rounded-full blur-3xl opacity-20 -z-10"></div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-inverse-surface text-inverse-on-surface px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto flex-col justify-center items-start md:items-center gap-12 md:gap-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative w-full">
              {[
                {
                  value: t("stats_transform_val"),
                  label: t("stats_transform_lbl"),
                  desc: t("stats_transform_desc"),
                  icon: "trending_up",
                  shape: "organic-shape-1",
                  bg: "bg-secondary",
                  fg: "text-on-secondary",
                },
                {
                  value: t("stats_path_val"),
                  label: t("stats_path_lbl"),
                  desc: t("stats_path_desc"),
                  icon: "auto_awesome",
                  shape: "organic-shape-2",
                  bg: "bg-secondary-container",
                  fg: "text-on-secondary-container",
                },
                {
                  value: t("stats_bridges_val"),
                  label: t("stats_bridges_lbl"),
                  desc: t("stats_bridges_desc"),
                  icon: "architecture",
                  shape: "organic-shape-1",
                  bg: "bg-secondary",
                  fg: "text-on-secondary",
                },
              ].map((s) => (
                <div key={s.label} className="relative group">
                  <div
                    className={`absolute -inset-4 bg-secondary/5 ${s.shape} blur-3xl group-hover:bg-secondary/10 transition-colors`}
                  ></div>
                  <div className="relative p-8 border-l-2 border-secondary/30 hover:border-secondary transition-colors flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-16 h-16 ${s.shape} ${s.bg} flex items-center justify-center ${s.fg} shadow-lg`}
                      >
                        <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="relative inline-block mb-2">
                        <span
                          className="font-display-xl text-display-xl"
                          style={{ color: "var(--secondary-fixed)" }}
                        >
                          {s.value}
                        </span>
                        <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary/40 rounded-full"></div>
                      </div>
                      <span
                        className="font-label-caps text-label-caps uppercase tracking-widest mb-4"
                        style={{ color: "var(--secondary-fixed)" }}
                      >
                        {s.label}
                      </span>
                      <p className="font-body-md text-body-md text-inverse-on-surface/70">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="how-it-works"
          className="py-32 px-margin-mobile md:px-margin-desktop bg-surface max-w-container-max mx-auto scroll-mt-28"
        >
          <div className="mb-20 max-w-3xl">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
              {language === "KZ" ? (
                <>
                  Ақылды оқыту, <span className="hand-drawn-underline">жылдам нәтиже</span>
                </>
              ) : language === "RU" ? (
                <>
                  Умное обучение, <span className="hand-drawn-underline">быстрые результаты</span>
                </>
              ) : (
                <>
                  Smarter Learning, <span className="hand-drawn-underline">Faster Results</span>
                </>
              )}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {t("features_desc")}
            </p>
          </div>
          <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
            <div className="md:col-span-7 bg-surface-container-highest p-10 md:p-14 border border-outline-variant hover:border-secondary transition-colors flex flex-col items-start group relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary opacity-5 organic-shape-2 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="w-16 h-16 border-2 border-primary flex items-center justify-center text-primary mb-8 bg-surface">
                <span className="material-symbols-outlined text-3xl" style={fill1}>
                  psychology
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-4">
                {t("feat_diagnostics_title")}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                {t("feat_diagnostics_desc")}
              </p>
            </div>
            <div className="md:col-span-5 bg-secondary-container p-10 md:p-14 border border-secondary hover:bg-secondary hover:text-on-secondary transition-colors flex flex-col items-start group mt-0 md:mt-16 text-on-secondary-container">
              <div className="w-16 h-16 border-2 border-current flex items-center justify-center mb-8 bg-transparent">
                <span className="material-symbols-outlined text-3xl" style={fill1}>
                  route
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4 group-hover:text-on-secondary">
                {t("feat_plans_title")}
              </h3>
              <p className="font-body-md text-body-md opacity-90 group-hover:text-on-secondary">
                {t("feat_plans_desc")}
              </p>
            </div>
            <div className="md:col-span-12 bg-surface-container-lowest p-10 md:p-14 border border-outline-variant hover:border-primary transition-colors flex flex-col md:flex-row items-start md:items-center gap-10 group">
              <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-3xl" style={fill1}>
                  troubleshoot
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-3">
                  {t("feat_errors_title")}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                  {t("feat_errors_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop bg-surface-container-highest overflow-hidden relative">
          <div className="max-w-container-max mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-0 h-full min-h-[400px] lg:min-h-[600px] overflow-hidden border border-outline-variant">
              <img
                alt="AulBridge hybrid illustration"
                className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEFCGJlNkmjihsc69n7rgFZpRHmlnbqJ6AJNjz-zp06gj_s3q1kci-VH2EfUGRDXcONCvXMpJz6KEHV3aMyCDbMGj1oAh8Rly2tvqctOJ61ke-CKsxJnPjOzIGJ241RIorF2l8v9klCelKUuuquR3nnlrToi4qf0lukcT9vpT8ylr-p5-uPjkNW04GjemcofSEP5mJmQ2m2a7ff3G2TjL7hzAIUB4fwe13cxp7OvZ4jIzT80Q4jIBFuAyYkIGri9GYHuE9vBYhvVw"
              />
            </div>
            <div className="relative z-10 lg:pl-10">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6">
                {language === "KZ" ? (
                  <>
                    Ертеңгі күннің мектептеріне{" "}
                    <span className="italic text-secondary">бүгіннен дайындалыңыз</span>
                  </>
                ) : language === "RU" ? (
                  <>
                    Готовьтесь к школам будущего{" "}
                    <span className="italic text-secondary">уже сегодня</span>
                  </>
                ) : (
                  <>
                    Prepare for the Schools of Tomorrow,{" "}
                    <span className="italic text-secondary">Today</span>
                  </>
                )}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                {t("vision_desc")}
              </p>
              <a
                className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href="#"
              >
                {t("vision_btn_stories")}{" "}
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-surface-bright organic-shape-1 opacity-40 -z-10 translate-x-1/4 translate-y-1/4"></div>
        </section>

        {/* CTA */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop bg-primary text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="font-display-xl text-display-xl text-on-primary mb-8">
              {t("cta_title")}
            </h2>
            <p
              className="font-body-lg text-body-lg mb-12 opacity-80"
              style={{ color: "var(--primary-fixed)" }}
            >
              {t("cta_desc")}
            </p>
            <Link
              to="/register"
              className="inline-block bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-12 py-6 hover:bg-surface hover:text-primary transition-colors btn-squish shadow-lg text-lg border border-secondary hover:border-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
            >
              {t("hero_btn_diagnostic")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
