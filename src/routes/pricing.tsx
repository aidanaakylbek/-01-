import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { createPaymentRequest, getPricingPlans } from "@/lib/api/account.functions";
import type { PaymentMethod, PricingPlan } from "@/lib/account-store.server";

export const Route = createFileRoute("/pricing")({
  loader: async () => getPricingPlans(),
  head: () => ({
    meta: [
      { title: "Pricing - AI-Sana" },
      { name: "description", content: "Choose AI-Sana subscription plan." },
    ],
  }),
  component: Pricing,
});

const methodLabels: Record<PaymentMethod, string> = {
  kaspi_pay: "Kaspi арқылы төлеу",
  kaspi_red: "Kaspi Red",
  kaspi_0_0_12: "Kaspi 0-0-12",
};

const features = [
  "Барлық сабақтар",
  "AI түсіндірме",
  "Апталық челлендж",
  "Айлық қорытынды тест",
  "Прогресс бақылау",
  "Ата-анаға Telegram есеп",
  "Қате сұрақтарды қайта шешу",
];

function Pricing() {
  const plans = Route.useLoaderData() as PricingPlan[];
  const navigate = useNavigate();
  const [pendingKey, setPendingKey] = useState("");

  const startPayment = async (planKey: PricingPlan["key"], paymentMethod: PaymentMethod) => {
    setPendingKey(`${planKey}:${paymentMethod}`);
    const request = await createPaymentRequest({ data: { planKey, paymentMethod } });
    await navigate({ to: "/payment", search: { requestId: request.id } as never });
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            AI-Sana Premium
          </p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Толық дайындықты ашыңыз</h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold text-[#EDE9FE]">
            Kaspi Pay, Kaspi Red және Kaspi 0-0-12 қолжетімді
          </p>
        </GameCard>

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <GameCard className="relative bg-white/95" key={plan.key}>
              {plan.badge ? (
                <span className="absolute right-5 top-5 rounded-full bg-[#FACC15] px-4 py-2 text-sm font-black text-[#1E1B4B]">
                  {plan.badge}
                </span>
              ) : null}
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                {plan.durationLabel}
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#1E1B4B]">{plan.name}</h2>
              <p className="mt-2 font-semibold text-[#6B5E8F]">{plan.description}</p>
              <p className="mt-5 text-4xl font-black text-[#6D28D9]">
                {plan.price.toLocaleString("kk-KZ")} KZT
              </p>
              <ul className="mt-5 space-y-2">
                {features.map((feature) => (
                  <li className="flex gap-2 font-bold text-[#1E1B4B]" key={feature}>
                    <span className="text-[#22C55E]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3">
                {(Object.keys(methodLabels) as PaymentMethod[]).map((method) => (
                  <button
                    className="rounded-2xl bg-[#6D28D9] px-5 py-4 font-black text-white shadow-[0_6px_0_#4C1D95] disabled:opacity-60"
                    disabled={pendingKey === `${plan.key}:${method}`}
                    key={method}
                    onClick={() => void startPayment(plan.key, method)}
                    type="button"
                  >
                    {pendingKey === `${plan.key}:${method}` ? "Жіберілуде..." : methodLabels[method]}
                  </button>
                ))}
              </div>
            </GameCard>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
