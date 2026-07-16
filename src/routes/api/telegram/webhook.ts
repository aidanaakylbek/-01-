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
          const startPayload = getStartPayload(text);

          if (startPayload !== null) {
            const startInviteCode = extractParentInviteCodeFromPayload(startPayload);

            if (startInviteCode) {
              await verifyParentOrSendInvalidMessage(chatIdText, startInviteCode);
              return Response.json({ ok: true, handled: "parent_start" });
            }

            await sendTelegramMessage(chatIdText, getPlainStartMessage());
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
  const result = await verifyParentTelegramInvite(inviteCode, chatId);

  if (result.status === "telegram_already_connected") {
    await sendTelegramMessage(
      chatId,
      "Бұл Telegram аккаунт басқа AI-Sana профиліне қосылған. Бір Telegram аккаунт тек бір оқушыға ғана қолданылады.",
    );
    return null;
  }

  if (result.status === "already_verified") {
    await sendTelegramMessage(chatId, "Сіз AI-Sana ата-ана есебіне бұрын қосылғансыз ✅");
    return result.account;
  }

  if (result.status === "invalid") {
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

  return result.account;
}

function extractParentInviteCodeFromPayload(payload: string) {
  if (!payload.toLowerCase().startsWith("parent_")) {
    return "";
  }

  return normalizeInviteCode(payload.replace(/^parent_/i, ""));
}

function getStartPayload(text: string) {
  const match = text.trim().match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+(.+))?$/i);

  if (!match) {
    return null;
  }

  return match[1]?.trim() ?? "";
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

function getPlainStartMessage() {
  return [
    "Сәлеметсіз бе! Бұл AI-Sana боты 🤖",
    "Ата-ана есебін қосу үшін AI-Sana сайтындағы арнайы Telegram сілтемесі арқылы кіріңіз.",
    "",
    "Егер сізде invite code болса, оны осы чатқа бөлек жібере аласыз.",
  ].join("\n");
}
