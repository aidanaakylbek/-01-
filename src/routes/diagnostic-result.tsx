import { createFileRoute, Link } from "@tanstack/react-router";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { getAccountDashboard } from "@/lib/api/account.functions";

export const Route = createFileRoute("/diagnostic-result")({
  loader: async () => getAccountDashboard(),
  head: () => ({
    meta: [
      { title: "Diagnostic Result - AI-Sana" },
      { name: "description", content: "AI-Sana diagnostic result and pricing next step." },
    ],
  }),
  component: DiagnosticResult,
});

function DiagnosticResult() {
  const dashboard = Route.useLoaderData();
  const score = dashboard.account.diagnosticScore ?? dashboard.averageAccuracy;
  const weakTopics = dashboard.account.diagnosticWeakTopics?.length
    ? dashboard.account.diagnosticWeakTopics
    : ["Пайыздар", "Логика", "Оқу сауаттылығы"];

  return (
    <GameLayout>
      <div className="mx-auto max-w-4xl space-y-5">
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            AI-Sana Diagnostic
          </p>
          <h1 className="mt-3 text-5xl font-black">Диагностика аяқталды!</h1>
          <p className="mt-4 text-lg font-semibold text-[#EDE9FE]">
            Толық дайындықты бастау үшін тариф таңдаңыз.
          </p>
        </GameCard>

        <GameCard className="bg-white/95">
          <div className="grid gap-4 md:grid-cols-3">
            <Summary label="Жалпы нәтиже" value={`${score}%`} />
            <Summary label="Әлсіз тақырыптар" value={weakTopics.slice(0, 2).join(", ")} />
            <Summary label="Келесі мақсат" value={`${Math.min(95, score + 10)}%`} />
          </div>
          <div className="mt-6 rounded-3xl bg-[#F5F3FF] p-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
              AI-Sana кеңесі
            </p>
            <p className="mt-2 text-lg font-bold text-[#1E1B4B]">
              Алдымен {weakTopics[0]} тақырыбын қайталап, кейін қысқа жаттығу және mini test орындаңыз.
            </p>
          </div>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-[#6D28D9] px-6 py-4 font-black text-white shadow-[0_6px_0_#4C1D95]"
            to="/pricing"
          >
            Тариф таңдауға өту
          </Link>
        </GameCard>
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
