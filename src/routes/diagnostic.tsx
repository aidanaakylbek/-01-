import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Find Your Level — AulBridge" },
      { name: "description", content: "Take the AulBridge diagnostic to find your level across NIS, BIL, and NSPM subjects." },
    ],
  }),
  component: Diagnostic,
});

type Subj = { icon: string; title: string; bg: string; fg: string };

function Card({ s }: { s: Subj }) {
  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-4 soft-shadow border border-surface-variant flex items-center gap-4 card-hover">
      <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0 ${s.fg}`}>
        <span className="material-symbols-outlined text-2xl">{s.icon}</span>
      </div>
      <h3 className="font-label-md text-label-md text-on-surface">{s.title}</h3>
    </div>
  );
}

function Diagnostic() {
  const { t, language } = useLanguage();

  const nis: Subj[] = [
    { icon: "science", title: t("diag_sub_nat_sci"), bg: "bg-primary-fixed", fg: "text-primary" },
    { icon: "translate", title: t("diag_sub_languages"), bg: "bg-surface-container-high", fg: "text-on-surface" },
    { icon: "analytics", title: t("diag_sub_quant"), bg: "bg-secondary-fixed", fg: "text-secondary-fixed-dim" },
    { icon: "calculate", title: t("diag_sub_math"), bg: "bg-tertiary-fixed", fg: "text-tertiary" },
  ];
  const nspm: Subj[] = [
    { icon: "calculate", title: t("diag_sub_math"), bg: "bg-tertiary-fixed", fg: "text-tertiary" },
    { icon: "extension", title: t("diag_sub_logic"), bg: "bg-secondary-fixed", fg: "text-secondary-fixed-dim" },
  ];
  const bil: Subj[] = [
    { icon: "menu_book", title: t("diag_sub_reading"), bg: "bg-primary-fixed", fg: "text-primary" },
    { icon: "calculate", title: t("diag_sub_math"), bg: "bg-tertiary-fixed", fg: "text-tertiary" },
    { icon: "extension", title: t("diag_sub_logic"), bg: "bg-secondary-fixed", fg: "text-secondary-fixed-dim" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md">
      <Navbar />

      <main className="flex-grow flex flex-col items-center px-container-padding-mobile md:px-container-padding-desktop py-stack-lg max-w-2xl mx-auto w-full">
        {/* Back navigation */}
        <div className="w-full flex justify-start mb-4">
          <Link to="/" className="text-on-surface-variant flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-variant transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("diag_back")}
          </Link>
        </div>

        <div className="w-full mb-stack-lg">
          <div className="flex justify-between items-end mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              {t("diag_progress_lbl")}
            </span>
            <span className="font-label-md text-label-md text-primary font-bold">0%</span>
          </div>
          <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "5%" }} />
          </div>
        </div>

        <div className="text-center mb-stack-lg w-full">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background mb-stack-sm">
            {t("diag_header")}
          </h1>
          <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl p-4 flex items-start gap-4 border-l-4 border-tertiary soft-shadow max-w-md mx-auto text-left">
            <div className="bg-surface-container-lowest rounded-full p-2 flex-shrink-0 mt-1">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            </div>
            <p className="font-body-md text-body-md">
              {t("diag_insight_desc")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-stack-md w-full mb-stack-lg">
          <Section badge="NIS" badgeBg="bg-primary text-on-primary" subtitle={t("diag_nis_subtitle")} items={nis} />
          <Section badge="NSPM" badgeBg="bg-secondary text-on-secondary" subtitle={t("diag_nspm_subtitle")} items={nspm} />
          <Section badge="BIL" badgeBg="bg-tertiary text-on-tertiary" subtitle={t("diag_bil_subtitle")} items={bil} />
        </div>

        <div className="w-full mt-auto mb-stack-md md:mb-0">
          <Link to="/home" className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-[24px] soft-shadow btn-squish transition-transform flex justify-center items-center gap-2 group cursor-pointer">
            {t("diag_btn_start")}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
          <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-4">
            {t("diag_time_desc")}
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ badge, badgeBg, subtitle, items }: { badge: string; badgeBg: string; subtitle: string; items: Subj[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-2">
        <span className={`${badgeBg} text-label-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>{badge}</span>
        <span className="font-label-md text-label-md text-on-surface-variant">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((s, i) => <Card key={i} s={s} />)}
      </div>
    </div>
  );
}
