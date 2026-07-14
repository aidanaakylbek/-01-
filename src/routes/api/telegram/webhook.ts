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
      GET: async () =>
        Response.json({
          ok: true,
          message: "AI-Sana Telegram webhook is ready. Telegram must send POST updates here.",
        }),
      POST: async ({ request }) => {
        try {
          const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
          const chatId = update?.message?.chat?.id;
          const text = update?.message?.text?.trim() ?? "";

          console.log("[telegram:webhook] incoming update", {
            chatId: chatId ? String(chatId) : "",
            hasMessage: Boolean(update?.message),
            text,
          });

          if (!chatId || !text) {
            return Response.json({ ok: true, ignored: true });
          }

          const chatIdText = String(chatId);
          const startInviteCode = extractStartParentInviteCode(text);

          if (startInviteCode) {
            await verifyParentOrSendInvalidMessage(chatIdText, startInviteCode);
            return Response.json({ ok: true, handled: "parent_start" });
          }

          if (isPlainStart(text)) {
            await sendTelegramMessage(
              chatIdText,
              [
                "Сәлеметсіз бе! Бұл AI-Sana боты 🤖",
                "Ата-ана есебін қосу үшін AI-Sana сайтындағы арнайы Telegram сілтемесі арқылы кіріңіз.",
              ].join("\n"),
            );

            return Response.json({ ok: true, handled: "plain_start" });
          }

          const manualInviteCode = extractManualInviteCode(text);

          if (manualInviteCode) {
            await verifyParentOrSendInvalidMessage(chatIdText, manualInviteCode);
            return Response.json({ ok: true, handled: "manual_code" });
          }

          await sendTelegramMessage(
            chatIdText,
            "Мен AI-Sana ата-ана есебін жіберетін ботпын. Қосылу үшін сайттағы Telegram батырмасын басыңыз.",
          );

          return Response.json({ ok: true, handled: "unknown_message" });
        } catch (error) {
          console.error("[telegram:webhook] failed to handle update", error);
          return Response.json({ ok: true, handled: false });
        }
      },
    },
  },
});

async function verifyParentOrSendInvalidMessage(chatId: string, inviteCode: string) {
  const account = verifyParentTelegramInvite(inviteCode, chatId);

  if (!account) {
    await sendTelegramMessage(
      chatId,
      "Сілтеме жарамсыз немесе мерзімі өткен. AI-Sana сайтынан қайта қосылып көріңіз.",
    );
    return null;
  }

  await sendTelegramMessage(
    chatId,
    [
      "Сіз AI-Sana ата-ана есебіне қосылдыңыз ✅",
      "Енді балаңыз AI-Sana платформасын қолдана алады және апталық есептер Telegram арқылы келеді.",
    ].join("\n"),
  );

  return account;
}

function isPlainStart(text: string) {
  return text.trim().toLowerCase() === "/start";
}

function extractStartParentInviteCode(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText.toLowerCase().startsWith("/start")) {
    return "";
  }

  const [, payload] = trimmedText.split(/\s+/, 2);

  if (!payload?.toLowerCase().startsWith("parent_")) {
    return "";
  }

  return normalizeInviteCode(payload.replace(/^parent_/i, ""));
}

function extractManualInviteCode(text: string) {
  return normalizeInviteCode(text);
}

function normalizeInviteCode(value: string) {
  const code = value.trim().toUpperCase();

  if (!/^[A-Z0-9]{6,10}$/.test(code)) {
    return "";
  }

  return code;
}
