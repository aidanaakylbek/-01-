import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { getAccountDashboard, verifyTelegramCode } from "@/lib/api/account.functions";
import type { Account } from "@/lib/account-store.server";

export const Route = createFileRoute("/verify-parent-telegram")({
  head: () => ({
    meta: [
      { title: "Ата-ананы растау — AI-Sana" },
      { name: "description", content: "Verify parent Telegram before entering AI-Sana." },
    ],
  }),
  component: VerifyParentTelegram,
});

type InviteResponse = {
  expiresAt: string;
  parentName: string;
  telegramConfigured: boolean;
  telegramLink: string;
  status: {
    phoneVerified: boolean;
    telegramConnected: boolean;
    verified: boolean;
  };
};

function VerifyParentTelegram() {
  const [account, setAccount] = useState<Account | null>(null);
  const [invite, setInvite] = useState<InviteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [codeError, setCodeError] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    const [dashboard, inviteResponse] = await Promise.all([
      getAccountDashboard(),
      fetch("/api/parent/create-invite", { method: "POST" }).then((response) => response.json()),
    ]);
    setAccount(dashboard.account);
    setInvite(inviteResponse as InviteResponse);
    setLoading(false);
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const verified =
    invite?.status.verified ||
    Boolean(account?.telegramParentVerified) ||
    Boolean(account?.parentTelegramConnected && account?.parentPhoneVerified);

  const submitCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCodeError("");
    setChecking(true);

    try {
      const result = await verifyTelegramCode({ data: { code: code.trim() } });

      if (result.status === "verified") {
        setCode("");
        await loadStatus();
        return;
      }

      if (result.status === "rate_limited") {
        setCodeError("Тым жиі көрдіңіз. Бірнеше минуттан кейін қайта көріңіз.");
        return;
      }

      if (result.status === "telegram_already_connected") {
        setCodeError("Бұл Telegram аккаунт басқа AI-Sana профиліне қосылған.");
        return;
      }

      setCodeError("Код қате немесе мерзімі өткен. Telegram ботта жаңа кодты сұраңыз.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <GameLayout>
      <div className="mx-auto max-w-4xl space-y-5">
        <GameCard className="overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">AI-Sana Safety</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            Ата-ананы Telegram арқылы растау қажет
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold text-[#EDE9FE]">
            AI-Sana платформасына кіру үшін ата-анаңыз Telegram арқылы расталуы керек.
            Бұл қауіпсіздік және апталық есептерді жіберу үшін қажет.
          </p>
        </GameCard>

        <GameCard className="bg-white/95">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Ата-ананың аты" value={account?.parentName ?? "Жүктелуде..."} />
            <Info label="Ата-ананың телефон номері" value={account?.parentPhone ?? "Жүктелуде..."} />
            <Info
              label="Telegram status"
              value={verified ? "Ата-ана расталды ✅" : "Ата-ана расталмаған"}
            />
            <Info
              label="Растау коды"
              value={invite?.expiresAt ? "10 минутқа жарамды" : "Дайындалуда..."}
            />
          </div>

          {verified ? null : (
            <ol className="mt-5 list-inside list-decimal space-y-2 rounded-3xl bg-[#F5F3FF] p-4 font-semibold text-[#6B5E8F]">
              <li>Төмендегі батырма арқылы Telegram ботты ашып, Start басыңыз.</li>
              <li>Бот сізге 6-таңбалы растау кодын жібереді.</li>
              <li>Сол кодты осы бетте төменгі өріске енгізіп, растаңыз.</li>
            </ol>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {invite?.telegramConfigured ? (
              <a
                className="rounded-2xl bg-[#FACC15] px-6 py-4 font-black text-[#1E1B4B] shadow-[0_6px_0_#CA8A04]"
                href={invite.telegramLink}
                target="_blank"
                rel="noreferrer"
              >
                Telegram ботты ашу
              </a>
            ) : (
              <p className="rounded-2xl bg-[#FEE2E2] px-5 py-4 font-bold text-[#991B1B]">
                TELEGRAM_BOT_USERNAME әлі қосылмаған.
              </p>
            )}
            <button
              className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-6 py-4 font-black text-[#6D28D9]"
              onClick={() => void loadStatus()}
              type="button"
            >
              {loading ? "Жаңартылуда..." : "Статусты жаңарту"}
            </button>
            {verified ? (
              <Link
                className="rounded-2xl bg-[#6D28D9] px-6 py-4 font-black text-white shadow-[0_6px_0_#4C1D95]"
                to="/diagnostic"
              >
                Диагностикаға өту
              </Link>
            ) : null}
          </div>

          {verified ? null : (
            <form className="mt-5 flex flex-wrap items-start gap-3" onSubmit={submitCode}>
              <label className="flex flex-col gap-2 font-black text-[#1E1B4B]">
                Telegram-нан келген код
                <input
                  className="h-13 w-48 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold tracking-widest text-[#1E1B4B] focus:border-[#8B5CF6] focus:outline-none"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="000000"
                  value={code}
                />
              </label>
              <button
                className="mt-8 rounded-2xl bg-[#6D28D9] px-6 py-4 font-black text-white shadow-[0_5px_0_#4C1D95] disabled:opacity-60"
                disabled={checking || code.trim().length === 0}
                type="submit"
              >
                {checking ? "Тексерілуде..." : "Кодты растау"}
              </button>
              {codeError ? (
                <p className="w-full rounded-2xl border-2 border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-black text-[#EF4444]">
                  {codeError}
                </p>
              ) : null}
            </form>
          )}
        </GameCard>
      </div>
    </GameLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8B5CF6]">{label}</p>
      <p className="mt-2 text-xl font-black text-[#1E1B4B]">{value}</p>
    </div>
  );
}
