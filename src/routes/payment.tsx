import { createFileRoute, Link } from "@tanstack/react-router";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { listPaymentRequests } from "@/lib/api/account.functions";
import type { PaymentRequest } from "@/lib/account-store.server";

export const Route = createFileRoute("/payment")({
  validateSearch: (search: Record<string, unknown>) => ({
    requestId: typeof search.requestId === "string" ? search.requestId : "",
  }),
  loader: async ({ location }) => {
    const requests = await listPaymentRequests();
    const search = location.search as { requestId?: string };
    return requests.find((request) => request.id === search.requestId) ?? requests[0] ?? null;
  },
  head: () => ({
    meta: [
      { title: "Payment Request - AI-Sana" },
      { name: "description", content: "AI-Sana Kaspi Pay payment request." },
    ],
  }),
  component: Payment,
});

const methodLabels: Record<string, string> = {
  kaspi_pay: "Kaspi арқылы төлеу",
  kaspi_red: "Kaspi Red",
  kaspi_0_0_12: "Kaspi 0-0-12",
};

function Payment() {
  const request = Route.useLoaderData() as PaymentRequest | null;

  return (
    <GameLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            Kaspi Pay MVP
          </p>
          <h1 className="mt-3 text-4xl font-black">Төлем өтінімі қабылданды</h1>
          <p className="mt-4 text-lg font-semibold text-[#EDE9FE]">
            Kaspi Pay арқылы төлем расталғаннан кейін сізге толық доступ ашылады.
          </p>
        </GameCard>

        {request ? (
          <GameCard className="bg-white/95">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Тариф" value={request.planName} />
              <Info label="Сома" value={`${request.amount.toLocaleString("kk-KZ")} ${request.currency}`} />
              <Info label="Төлем түрі" value={methodLabels[request.paymentMethod] ?? request.paymentMethod} />
              <Info label="Ата-ана телефоны" value={request.parentPhone} />
              <Info label="Статус" value={request.status} />
              <Info label="Өтінім ID" value={request.id} />
            </div>
            <p className="mt-5 rounded-3xl bg-[#F5F3FF] p-4 font-bold text-[#6B5E8F]">
              Админ төлемді растағаннан кейін жазылым іске қосылады.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]" to="/diagnostic">
                Диагностикаға қайту
              </Link>
              <Link className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-3 font-black text-[#6D28D9]" to="/pricing">
                Тарифтер
              </Link>
            </div>
          </GameCard>
        ) : (
          <GameCard>
            <p className="font-black">Төлем өтінімі табылмады.</p>
            <Link className="mt-4 inline-flex rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white" to="/pricing">
              Тариф таңдау
            </Link>
          </GameCard>
        )}
      </div>
    </GameLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8B5CF6]">{label}</p>
      <p className="mt-2 break-words text-xl font-black text-[#1E1B4B]">{value}</p>
    </div>
  );
}
