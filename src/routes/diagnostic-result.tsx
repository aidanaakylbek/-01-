import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import {
  createPaymentRequest,
  getAccountDashboard,
  getPricingPlans,
} from "@/lib/api/account.functions";
import type { PaymentMethod, PricingPlan } from "@/lib/account-store.server";

export const Route = createFileRoute("/diagnostic-result")({
  loader: async () => {
    const [dashboard, plans] = await Promise.all([
      getAccountDashboard(),
      getPricingPlans(),
    ]);

    return { dashboard, plans };
  },
  head: () => ({
    meta: [
      { title: "Diagnostic Result - AI-Sana" },
      { name: "description", content: "AI-Sana diagnostic result and pricing next step." },
    ],
  }),
  component: DiagnosticResult,
});

function DiagnosticResult() {
  const { dashboard, plans } = Route.useLoaderData();
  const navigate = useNavigate();
  const [pendingKey, setPendingKey] = useState("");
  const score = dashboard.account.diagnosticScore ?? dashboard.averageAccuracy;
  const weakTopics = dashboard.account.diagnosticWeakTopics?.length
    ? dashboard.account.diagnosticWeakTopics
    : [];
  const firstWeakTopic = weakTopics[0] ?? "диагностикадағы қате сұрақтар";

  const startPayment = async (planKey: PricingPlan["key"], paymentMethod: PaymentMethod) => {
    setPendingKey(`${planKey}:${paymentMethod}`);
    const request = await createPaymentRequest({ data: { planKey, paymentMethod } });
    await navigate({ to: "/payment", search: { requestId: request.id } as never });
  };

  return (
    <GameLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            AI-Sana Diagnostic
          </p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Диагностика аяқталды!</h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold text-[#EDE9FE]">
            Толық дайындықты бастау үшін тариф таңдаңыз. Диагностика нәтижесіне қарай
            AI-Sana әлсіз тақырыптарды көрсетіп, оқу жолын ашады.
          </p>
        </GameCard>

        <GameCard className="bg-white/95">
          <div className="grid gap-4 md:grid-cols-3">
            <Summary label="Жалпы нәтиже" value={`${score}%`} />
            <Summary
              label="Әлсіз тақырыптар"
              value={weakTopics.length ? weakTopics.slice(0, 2).join(", ") : "Әлі анықталмады"}
            />
            <Summary label="Келесі мақсат" value={`${Math.min(95, score + 10)}%`} />
          </div>
          <div className="mt-6 rounded-3xl bg-[#F5F3FF] p-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
              AI-Sana кеңесі
            </p>
            <p className="mt-2 text-lg font-bold text-[#1E1B4B]">
              Алдымен {firstWeakTopic} тақырыбын қайталап, кейін қысқа жаттығу және mini
              test орындаңыз. Толық тариф ашылғанда AI-Sana әр қатені қадамдап түсіндіреді.
            </p>
            <a
              className="mt-4 inline-flex rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5"
              href={`/explain-solution?mode=diagnostic&topic=${encodeURIComponent(firstWeakTopic)}&diagnosticResult=${encodeURIComponent(`${score}%`)}`}
            >
              AI-Sana-дан разбор сұрау
            </a>
          </div>
        </GameCard>

        <GameCard className="border-[#FACC15] bg-[#FFFBEB]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                Тарифтер
              </p>
              <h2 className="mt-1 text-3xl font-black text-[#1E1B4B]">
                Толық дайындықты ашыңыз
              </h2>
              <p className="mt-2 font-semibold text-[#6B5E8F]">
                Kaspi Pay, Kaspi Red және Kaspi 0-0-12 қолжетімді.
              </p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_rgba(250,204,21,0.35)]">
              Сабақтар + AI разбор + ата-ана есебі
            </div>
          </div>
        </GameCard>

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <GameCard className="relative flex flex-col bg-white/95" key={plan.key}>
              {plan.badge ? (
                <span className="absolute right-5 top-5 rounded-full bg-[#FACC15] px-4 py-2 text-sm font-black text-[#1E1B4B]">
                  {plan.badge}
                </span>
              ) : null}
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                {plan.durationLabel}
              </p>
              <h3 className="mt-2 text-3xl font-black text-[#1E1B4B]">{plan.name}</h3>
              <p className="mt-2 min-h-12 font-semibold text-[#6B5E8F]">{plan.description}</p>
              <p className="mt-5 text-4xl font-black text-[#6D28D9]">
                {plan.price.toLocaleString("kk-KZ")} KZT
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {[
                  "Барлық сабақтар",
                  "AI түсіндірме",
                  "Апталық челлендж",
                  "Прогресс бақылау",
                  "Ата-анаға Telegram есеп",
                ].map((feature) => (
                  <li className="flex gap-2 font-bold text-[#1E1B4B]" key={feature}>
                    <span className="text-[#22C55E]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3">
                {paymentMethods.map((method) => (
                  <button
                    className="rounded-2xl bg-[#6D28D9] px-5 py-4 font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5 disabled:opacity-60"
                    disabled={pendingKey === `${plan.key}:${method.key}`}
                    key={method.key}
                    onClick={() => void startPayment(plan.key, method.key)}
                    type="button"
                  >
                    {pendingKey === `${plan.key}:${method.key}` ? "Жіберілуде..." : method.label}
                  </button>
                ))}
              </div>
            </GameCard>
          ))}
        </section>
      </div>
    </GameLayout>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8B5CF6]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#1E1B4B]">{value}</p>
    </div>
  );
}

const paymentMethods: Array<{ key: PaymentMethod; label: string }> = [
  { key: "kaspi_pay", label: "Kaspi арқылы төлеу" },
  { key: "kaspi_red", label: "Kaspi Red" },
  { key: "kaspi_0_0_12", label: "Kaspi 0-0-12" },
];
