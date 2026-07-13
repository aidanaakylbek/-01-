import { createFileRoute } from "@tanstack/react-router";

import { verifyParentTelegramInvite } from "@/lib/account-store.server";
import { sendTelegramMessage } from "@/lib/telegram.server";

type TelegramUpdate = {
  message?: {
    chat?: {
      id?: number | string;
    };
    text?: string;
  };
};

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
        const chatId = update?.message?.chat?.id;
        const text = update?.message?.text?.trim() ?? "";

        if (!chatId || !text.startsWith("/start")) {
          return Response.json({ ok: true, ignored: true });
        }

        const inviteCode = extractParentInviteCode(text);

        if (!inviteCode) {
          await sendTelegramMessage({
            chatId: String(chatId),
            text: "Сәлем! AI-Sana ата-ана есебіне қосылу үшін сайттағы арнайы сілтемені ашыңыз.",
          });

          return Response.json({ ok: true, ignored: true });
        }

        const account = verifyParentTelegramInvite(inviteCode, String(chatId));

        if (!account) {
          await sendTelegramMessage({
            chatId: String(chatId),
            text: "Сілтеме жарамсыз немесе мерзімі өткен. AI-Sana аккаунтынан қайта қосылып көріңіз.",
          });

          return Response.json({ ok: false, reason: "invalid_invite" }, { status: 404 });
        }

        await sendTelegramMessage({
          chatId: String(chatId),
          text: [
            "Сіз AI-Sana ата-ана есебіне қосылдыңыз ✅",
            "",
            `Растау коды қабылданды: ${inviteCode}`,
            "",
            "Енді балаңыздың апталық оқу нәтижесі Telegram арқылы келеді.",
          ].join("\n"),
        });

        return Response.json({ ok: true, verified: true, studentId: account.id });
      },
    },
  },
});

function extractParentInviteCode(text: string) {
  const [, payload] = text.split(/\s+/, 2);

  if (!payload?.startsWith("parent_")) {
    return "";
  }

  return payload.replace(/^parent_/, "").trim();
}
