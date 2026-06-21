import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/hooks/use-language";
import { AibiMark } from "@/components/aibi-mark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aibi — NIS, BIL & NSPM Exam Preparation" },
      {
        name: "description",
        content:
          "Aibi is the AI tutor for students preparing for NIS, BIL, and NSPM entrance exams.",
      },
      { property: "og:title", content: "Aibi — NIS, BIL & NSPM Exam Preparation" },
      {
        property: "og:description",
        content: "Aibi is the AI tutor for NIS, BIL, and NSPM entrance exams.",
      },
    ],
  }),
  component: Landing,
});

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

function Landing() {
  const { t, language } = useLanguage();
  const heroCopy = getHeroCopy(language);

  return (
    <>
      <Navbar />

      {/* ───── Main Content ───── */}
      <main style={{ isolation: "isolate" }}>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-outline-variant bg-surface px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto min-h-[calc(100svh-7rem)] md:min-h-[calc(100svh-5rem)] py-8 md:py-14 grid lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)] gap-8 lg:gap-14 items-center">
            <div className="relative z-10">
              <div className="motion-rise inline-flex items-center gap-3 border border-outline-variant bg-surface-container-lowest px-4 py-2.5 mb-5 md:mb-7">
                <AibiMark className="border-0 shadow-none" shape="circle" size="sm" />
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                  {heroCopy.badge}
                </span>
              </div>

              <h1 className="motion-rise motion-delay-1 font-display-xl text-[56px] leading-[0.95] md:text-[112px] md:leading-[0.9] tracking-normal text-primary mb-4 md:mb-6">
                Aibi
              </h1>
              <p className="motion-rise motion-delay-2 font-headline-lg-mobile text-[28px] leading-[1.15] md:font-headline-lg md:text-headline-lg text-primary max-w-2xl mb-4 md:mb-5">
                {heroCopy.title}
              </p>
              <p className="motion-rise motion-delay-3 font-body-lg text-base leading-7 md:text-body-lg text-on-surface-variant max-w-2xl mb-6 md:mb-8">
                {t("hero_desc")}
              </p>

              <div className="motion-rise motion-delay-4 border-l-4 border-secondary bg-surface-container-lowest px-4 py-3 mb-6 md:mb-8 max-w-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <AibiMark className="mt-0.5" shape="circle" size="sm" />
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {heroCopy.aibiLine}
                  </p>
                </div>
              </div>

              <div className="motion-rise motion-delay-4 flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                <Link
                  to="/register"
                  className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-6 py-4 md:px-7 md:py-5 hover:bg-secondary-container hover:text-on-secondary-container transition-all btn-squish flex justify-center items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary border border-secondary"
                >
                  {t("hero_btn_diagnostic")}
                  <span className="material-symbols-outlined motion-arrow text-xl">
                    arrow_forward
                  </span>
                </Link>
                <a
                  className="bg-surface/85 text-primary font-label-caps text-label-caps uppercase tracking-widest px-6 py-4 md:px-7 md:py-5 hover:bg-surface-container transition-all btn-squish flex justify-center items-center gap-3 border-2 border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                  href="#how-it-works"
                >
                  <span className="material-symbols-outlined text-xl">play_circle</span>
                  {t("hero_btn_video")}
                </a>
              </div>

              <div className="motion-rise motion-delay-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3 max-w-2xl">
                {heroCopy.tracks.map((track) => (
                  <div
                    key={track.title}
                    className="border border-outline-variant bg-surface/90 px-3 py-2.5 sm:px-4 sm:py-3"
                  >
                    <div className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      {track.title}
                    </div>
                    <div className="hidden sm:block font-label-sm text-label-sm text-on-surface-variant mt-1">
                      {track.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden min-h-[560px] lg:block">
              <div className="absolute right-0 top-0 hidden h-24 w-24 border-r-2 border-t-2 border-secondary md:block" />
              <div className="absolute bottom-2 left-0 hidden h-20 w-20 border-b-2 border-l-2 border-primary md:block" />

              <div className="motion-panel motion-delay-2 relative ml-auto max-w-[560px] border border-primary bg-surface-container-lowest shadow-[16px_16px_0_var(--secondary-container)]">
                <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
                  <div>
                    <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      Aibi path
                    </p>
                    <p className="font-title-md text-title-md text-primary">
                      Today&apos;s learning route
                    </p>
                  </div>
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="motion-pulse-dot h-2.5 w-2.5 rounded-full bg-secondary" />
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="h-2.5 w-2.5 rounded-full bg-outline" />
                  </div>
                </div>

                <div className="grid gap-5 p-4 md:grid-cols-[0.9fr_1.1fr] md:p-6">
                  <div className="flex flex-col items-center justify-center border border-outline-variant bg-surface px-4 py-6 text-center">
                    <AibiMark
                      className="motion-float h-32 w-32 border-0 bg-transparent shadow-none md:h-44 md:w-44"
                      label="Aibi character"
                      shape="circle"
                      size="lg"
                    />
                    <p className="mt-3 font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      AI review ready
                    </p>
                    <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                      Method, mistake, next step.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Diagnostic", "68%", "Find weak topics"],
                      ["Plan", "Week 3", "Logic and percentages"],
                      ["Practice", "12 tasks", "NIS, BIL, NSPM"],
                    ].map(([label, value, note]) => (
                      <div
                        className="motion-route-card grid grid-cols-[1fr_auto] gap-3 border border-outline-variant bg-surface px-4 py-3"
                        key={label}
                      >
                        <div>
                          <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                            {label}
                          </p>
                          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                            {note}
                          </p>
                        </div>
                        <span className="font-title-lg text-title-lg text-secondary">{value}</span>
                      </div>
                    ))}

                    <div className="border border-secondary bg-secondary text-on-secondary p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-label-caps text-label-caps uppercase tracking-widest">
                            Next move
                          </p>
                          <p className="mt-1 font-title-md text-title-md">
                            Solve 5 logic questions
                          </p>
                        </div>
                        <span className="material-symbols-outlined motion-arrow text-3xl">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-outline-variant">
                  {heroCopy.tracks.map((track) => (
                    <div
                      className="border-r border-outline-variant px-4 py-3 last:border-r-0"
                      key={track.title}
                    >
                      <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                        {track.title}
                      </p>
                      <p className="mt-1 hidden font-body-sm text-body-sm text-on-surface-variant sm:block">
                        {track.subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-surface-container-low px-margin-mobile py-14 md:px-margin-desktop md:py-18">
          <div className="mx-auto max-w-container-max">
            <div className="grid grid-cols-1 gap-4 border-y border-outline-variant bg-surface md:grid-cols-3">
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
                  value: t("stats_learners_val"),
                  label: t("stats_learners_lbl"),
                  desc: t("stats_learners_desc"),
                  icon: "architecture",
                  shape: "organic-shape-1",
                  bg: "bg-secondary",
                  fg: "text-on-secondary",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="relative border-b border-outline-variant p-6 md:border-b-0 md:border-r md:p-8 md:last:border-r-0"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      {s.label}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center border border-outline-variant bg-surface-container-low">
                      <span className="material-symbols-outlined text-2xl text-primary">
                        {s.icon}
                      </span>
                    </div>
                  </div>
                  <p className="mb-4 font-display-xl text-[48px] leading-none text-primary md:text-[64px]">
                    {s.value}
                  </p>
                  <p className="max-w-sm font-body-md text-body-md text-on-surface-variant">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="how-it-works"
          className="mx-auto max-w-container-max scroll-mt-28 bg-surface px-margin-mobile py-24 md:px-margin-desktop md:py-28"
        >
          <div className="mb-14 max-w-3xl">
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
          <div className="grid gap-0 border border-outline-variant md:grid-cols-3">
            {[
              ["01", "psychology", t("feat_diagnostics_title"), t("feat_diagnostics_desc")],
              ["02", "route", t("feat_plans_title"), t("feat_plans_desc")],
              ["03", "troubleshoot", t("feat_errors_title"), t("feat_errors_desc")],
            ].map(([number, icon, title, desc], index) => (
              <div
                className={`group bg-surface-container-lowest p-6 transition-colors hover:bg-surface-container-low md:p-8 ${
                  index < 2 ? "border-b border-outline-variant md:border-b-0 md:border-r" : ""
                }`}
                key={title}
              >
                <div className="mb-10 flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    Step {number}
                  </span>
                  <span className="material-symbols-outlined text-3xl text-primary" style={fill1}>
                    {icon}
                  </span>
                </div>
                <h3 className="mb-4 font-headline-md text-headline-md text-primary">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision */}
        <section className="relative overflow-hidden bg-surface-container-low px-margin-mobile py-24 md:px-margin-desktop md:py-28">
          <div className="mx-auto grid max-w-container-max gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-center">
            <div className="relative border border-primary bg-surface p-6 shadow-[12px_12px_0_var(--secondary)] md:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-outline-variant pb-5">
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    Aibi review
                  </p>
                  <p className="font-title-md text-title-md text-primary">After every task</p>
                </div>
                <AibiMark className="border-0 shadow-none" shape="circle" size="lg" />
              </div>

              {[
                ["Method", "Find the rule before choosing an answer."],
                ["Mistake", "Show why the wrong option looks tempting."],
                ["Next", "Give one small exercise for the same skill."],
              ].map(([label, text]) => (
                <div
                  className="grid grid-cols-[88px_1fr] border-t border-outline-variant py-4"
                  key={label}
                >
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {label}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">{text}</p>
                </div>
              ))}
            </div>
            <div>
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
                className="inline-flex items-center gap-2 border-b border-primary pb-1 font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors hover:border-secondary hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href="#"
              >
                {t("vision_btn_stories")}{" "}
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-primary px-margin-mobile py-20 text-on-primary md:px-margin-desktop md:py-24">
          <div className="mx-auto grid max-w-container-max gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-3xl">
              <div className="mb-6">
                <AibiMark className="border-0 bg-surface shadow-none" shape="circle" size="lg" />
              </div>
              <h2 className="mb-5 font-display-xl text-[44px] leading-tight md:text-display-xl">
                {t("cta_title")}
              </h2>
              <p
                className="font-body-lg text-body-lg opacity-80"
                style={{ color: "var(--primary-fixed)" }}
              >
                {t("cta_desc")}
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex justify-center border border-secondary bg-secondary px-8 py-5 font-label-caps text-label-caps uppercase tracking-widest text-on-secondary transition-colors btn-squish hover:border-surface hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary md:px-10"
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

function getHeroCopy(language: string) {
  if (language === "KZ") {
    return {
      badge: "Нақты мақсат. Жеке дайындық.",
      title: "Сенің НИШ, БИЛ және РФМШ-ға дайындайтын AI көмекшің.",
      aibiLine:
        "Aibi жауапты ғана айтпайды: әдісін түсіндіреді, қатені көрсетеді және келесі қадамды ұсынады.",
      tracks: [
        { title: "НИШ", subtitle: "Логика және сандық талдау" },
        { title: "БИЛ", subtitle: "Оқу сауаттылығы және тілдер" },
        { title: "РФМШ", subtitle: "Математика және есептер" },
      ],
    };
  }

  if (language === "RU") {
    return {
      badge: "Четкая цель. Личная подготовка.",
      title: "Твой AI-помощник для подготовки к НИШ, БИЛ и РФМШ.",
      aibiLine:
        "Aibi не просто дает ответ: объясняет метод, показывает ошибку и предлагает следующий шаг.",
      tracks: [
        { title: "НИШ", subtitle: "Логика и количественный анализ" },
        { title: "БИЛ", subtitle: "Чтение и языки" },
        { title: "РФМШ", subtitle: "Математика и задачи" },
      ],
    };
  }

  return {
    badge: "Clear goal. Personal preparation.",
    title: "Your AI study guide for NIS, BIL and NSPM entrance exams.",
    aibiLine:
      "Aibi does not just give answers: it explains the method, finds mistakes, and suggests the next step.",
    tracks: [
      { title: "NIS", subtitle: "Logic and quantitative reasoning" },
      { title: "BIL", subtitle: "Reading literacy and languages" },
      { title: "NSPM", subtitle: "Math and problem solving" },
    ],
  };
}
