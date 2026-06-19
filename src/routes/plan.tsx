import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Personalized Study Plan — AulBridge" },
      { name: "description", content: "Your weekly AulBridge study plan, adapted to your strengths and gaps." },
    ],
  }),
  component: Plan,
});

function Plan() {
  const { t, language } = useLanguage();

  return (
    <div className="bg-background text-on-background min-h-screen pb-24">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop mt-stack-md flex flex-col gap-stack-lg">
        <section className="flex flex-col gap-2 mt-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
            {t("plan_header")}
          </h2>
          <p className="text-on-surface-variant font-body-md">
            {t("plan_subheader")}
          </p>
        </section>

        <div className="bg-tertiary-fixed/30 border-l-4 border-tertiary-fixed-dim rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <div>
            <h3 className="font-label-md text-label-md text-tertiary-container mb-1">
              {t("plan_insight_title")}
            </h3>
            <p className="font-body-md text-on-surface text-sm">
              {t("plan_insight_desc")}
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
          {/* Monday completed */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 relative overflow-hidden bg-surface-container-low">
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-secondary-container/30 flex items-center justify-center border-l border-secondary-container/50">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}>check_circle</span>
            </div>
            <div className="flex justify-between items-start pr-12">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_mon_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_mon_title")}
                </h3>
              </div>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant pr-12">
              {t("plan_mon_desc")}
            </p>
            <div className="mt-auto pr-12">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Tuesday active */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 relative overflow-hidden border-2 border-primary shadow-md bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  {t("plan_tue_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_tue_title")}
                </h3>
              </div>
              <button aria-label="Dismiss" className="w-8 h-8 rounded-full border-2 border-outline flex items-center justify-center text-outline hover:bg-primary-container hover:border-primary-container hover:text-on-primary-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {t("plan_tue_desc")}
            </p>
            <div className="mt-auto flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                  <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="30, 100" strokeLinecap="round" strokeWidth="4" />
                </svg>
                <span className="absolute text-[10px] text-primary font-medium">30%</span>
              </div>
              <button className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all ml-auto cursor-pointer">
                {t("plan_btn_continue")}
              </button>
            </div>
          </div>

          {/* Wednesday */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_wed_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_wed_title")}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {t("plan_wed_desc")}
            </p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
          </div>

          {/* Thursday */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_thu_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_thu_title")}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {t("plan_thu_desc")}
            </p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
          </div>

          {/* Friday */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_fri_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_fri_title")}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {t("plan_fri_desc")}
            </p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
          </div>

          {/* Weekend */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-primary-fixed/40 border border-primary-fixed-dim shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  {t("plan_weekend_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-primary-fixed mt-1">
                  {t("plan_weekend_title")}
                </h3>
              </div>
              <span className="material-symbols-outlined text-primary bg-surface p-2 rounded-full shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <p className="font-body-md text-sm text-on-primary-fixed-variant">
              {t("plan_weekend_desc")}
            </p>
            <button className="mt-auto bg-surface text-primary font-label-md px-6 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-surface-container-lowest active:scale-95 transition-all self-start border border-primary-fixed-dim cursor-pointer">
              {t("plan_btn_start")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
