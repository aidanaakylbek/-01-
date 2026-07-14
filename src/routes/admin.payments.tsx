import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, MouseEvent, useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { listPaymentRequests, updatePaymentRequest } from "@/lib/api/account.functions";
import type { PaymentRequest } from "@/lib/account-store.server";

export const Route = createFileRoute("/admin/payments")({
  loader: async () => listPaymentRequests(),
  head: () => ({
    meta: [
      { title: "Admin Payments - AI-Sana" },
      { name: "description", content: "Manual Kaspi Pay payment approval panel." },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const initialRequests = Route.useLoaderData() as PaymentRequest[];
  const [requests, setRequests] = useState(initialRequests);

  const refresh = async () => {
    setRequests(await listPaymentRequests());
  };

  const submit = async (form: HTMLFormElement, requestId: string, action: "invoice_sent" | "approve" | "reject") => {
    const formData = new FormData(form);

    await updatePaymentRequest({
      data: {
        id: requestId,
        action,
        adminNote: String(formData.get("adminNote") ?? ""),
        kaspiInvoiceReference: String(formData.get("kaspiInvoiceReference") ?? ""),
        kaspiPaymentLink: String(formData.get("kaspiPaymentLink") ?? ""),
      },
    });
    await refresh();
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>, requestId: string, action: "invoice_sent" | "approve" | "reject") => {
    event.preventDefault();
    await submit(event.currentTarget, requestId, action);
  };

  const submitButtonForm = async (
    event: MouseEvent<HTMLButtonElement>,
    requestId: string,
    action: "approve" | "reject",
  ) => {
    const form = event.currentTarget.form;

    if (form) {
      await submit(form, requestId, action);
    }
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">Admin</p>
          <h1 className="mt-3 text-4xl font-black">Kaspi payment requests</h1>
          <p className="mt-3 font-semibold text-[#DDD6FE]">
            MVP режимі: төлем Kaspi Pay ішінде тексеріледі, содан кейін admin approve жасайды.
          </p>
        </GameCard>

        {requests.length === 0 ? (
          <GameCard>
            <p className="font-black">Әзірге төлем өтінімі жоқ.</p>
          </GameCard>
        ) : (
          requests.map((request) => (
            <GameCard className="bg-white/95" key={request.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                    {request.status}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{request.studentName}</h2>
                  <p className="font-semibold text-[#6B5E8F]">{request.studentEmail}</p>
                  <div className="mt-4 grid gap-2 text-sm font-bold text-[#1E1B4B]">
                    <p>Parent phone: {request.parentPhone}</p>
                    <p>Plan: {request.planName}</p>
                    <p>Amount: {request.amount.toLocaleString("kk-KZ")} {request.currency}</p>
                    <p>Method: {request.paymentMethod}</p>
                    <p>Created: {new Date(request.createdAt).toLocaleString("kk-KZ")}</p>
                    {request.confirmedAt ? <p>Confirmed: {new Date(request.confirmedAt).toLocaleString("kk-KZ")}</p> : null}
                    {request.rejectedAt ? <p>Rejected: {new Date(request.rejectedAt).toLocaleString("kk-KZ")}</p> : null}
                  </div>
                </div>
                <form className="space-y-3" onSubmit={(event) => void submitForm(event, request.id, "invoice_sent")}>
                  <AdminInput label="Kaspi invoice reference" name="kaspiInvoiceReference" defaultValue={request.kaspiInvoiceReference ?? ""} />
                  <AdminInput label="Kaspi payment link" name="kaspiPaymentLink" defaultValue={request.kaspiPaymentLink ?? ""} />
                  <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
                    Admin note
                    <textarea
                      className="min-h-24 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 font-semibold focus:border-[#8B5CF6] focus:outline-none"
                      defaultValue={request.adminNote ?? ""}
                      name="adminNote"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-2xl bg-[#FACC15] px-4 py-3 font-black text-[#1E1B4B]" type="submit">
                      Mark invoice sent
                    </button>
                    <button
                      className="rounded-2xl bg-[#22C55E] px-4 py-3 font-black text-white"
                      onClick={(event) => void submitButtonForm(event, request.id, "approve")}
                      type="button"
                    >
                      Approve payment
                    </button>
                    <button
                      className="rounded-2xl bg-[#EF4444] px-4 py-3 font-black text-white"
                      onClick={(event) => void submitButtonForm(event, request.id, "reject")}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </div>
            </GameCard>
          ))
        )}
      </div>
    </GameLayout>
  );
}

function AdminInput({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string;
  label: string;
  name: string;
}) {
  return (
    <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
      {label}
      <input
        className="h-13 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold focus:border-[#8B5CF6] focus:outline-none"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}
