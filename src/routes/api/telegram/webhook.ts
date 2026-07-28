import { createFileRoute } from "@tanstack/react-router";

import {
  completeTelegramVerificationFromContact,
  startTelegramVerificationSession,
} from "@/lib/account-store.server";
import {
  getPhoneRequestKeyboard,
  getRemoveKeyboard,
  isValidTelegramWebhookSecret,
  sendTelegramMessage,
} from "@/lib/telegram.server";

type TelegramUpdate = {
  message?: {
    chat?: {
      id?: number | string;
    };
    contact?: {
      phone_number?: string;
      user_id?: number | string;
    };
    from?: {
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
          if (!isValidTelegramWebhookSecret(request)) {
            console.warn("[telegram:webhook] rejected update with invalid secret token");
            return Response.json({ ok: true, rejected: true });
          }

          const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
          const chatId = update?.message?.chat?.id;
          const fromId = update?.message?.from?.id;

          console.log("[telegram:webhook] incoming update", {
            chatId: chatId ? String(chatId) : "",
            hasContact: Boolean(update?.message?.contact),
            hasMessage: Boolean(update?.message),
            hasText: Boolean(update?.message?.text),
          });

          if (!chatId || !fromId) {
            return Response.json({ ok: true, ignored: true });
          }

          const chatIdText = String(chatId);
          const fromIdText = String(fromId);
          const contact = update?.message?.contact;

          if (contact) {
            await handleContact({
              chatId: chatIdText,
              contactTelegramUserId: String(contact.user_id ?? ""),
              fromTelegramUserId: fromIdText,
              phoneNumber: contact.phone_number ?? "",
            });
            return Response.json({ ok: true, handled: "contact" });
          }

          const text = update?.message?.text?.trim() ?? "";
          const startPayload = getStartPayload(text);

          if (startPayload !== null) {
            if (startPayload) {
              await handleStartToken({
                chatId: chatIdText,
                telegramUserId: fromIdText,
                token: startPayload,
              });
              return Response.json({ ok: true, handled: "start_token" });
            }

            await sendTelegramMessage(chatIdText, getPlainStartMessage());
            return Response.json({ ok: true, handled: "plain_start" });
          }

          await sendTelegramMessage(chatIdText, getUnknownMessage());
          return Response.json({ ok: true, handled: "unknown_message" });
        } catch (error) {
          console.error("[telegram:webhook] failed to handle update", error);
          return Response.json({ ok: true, handled: false });
        }
      },
    },
  },
});

async function handleStartToken(input: { chatId: string; telegramUserId: string; token: string }) {
  const result = await startTelegramVerificationSession(input);

  if (result.status === "invalid") {
    await sendTelegramMessage(
      input.chatId,
      "Сілтеме жарамсыз немесе мерзімі өткен. AI-Sana сайтынан қайта қосылып көріңіз.",
    );
    return;
  }

  await sendTelegramMessage(
    input.chatId,
    [
      "AI-Sana растауын аяқтау үшін төмендегі батырманы басып, өз Telegram нөміріңізді жіберіңіз.",
      "Қауіпсіздік үшін тек өз нөміріңіз қабылданады.",
    ].join("\n"),
    { replyMarkup: getPhoneRequestKeyboard() },
  );
}

async function handleContact(input: {
  chatId: string;
  contactTelegramUserId: string;
  fromTelegramUserId: string;
  phoneNumber: string;
}) {
  const result = await completeTelegramVerificationFromContact(input);

  if (result.status === "forged_contact") {
    await sendTelegramMessage(
      input.chatId,
      "Өз Telegram нөміріңізді ғана растауға болады. Батырманы қайта басып көріңіз.",
      { replyMarkup: getPhoneRequestKeyboard() },
    );
    return;
  }

  if (result.status === "telegram_already_connected") {
    await sendTelegramMessage(
      input.chatId,
      "Бұл Telegram аккаунт басқа AI-Sana профиліне қосылған.",
      { replyMarkup: getRemoveKeyboard() },
    );
    return;
  }

  if (result.status === "phone_already_used") {
    await sendTelegramMessage(
      input.chatId,
      "Бұл телефон нөмірі басқа AI-Sana аккаунтында қолданылған.",
      { replyMarkup: getRemoveKeyboard() },
    );
    return;
  }

  if (result.status === "invalid" || result.status === "invalid_phone") {
    await sendTelegramMessage(
      input.chatId,
      "Сілтеме жарамсыз немесе мерзімі өткен. AI-Sana сайтынан қайта қосылып көріңіз.",
      { replyMarkup: getRemoveKeyboard() },
    );
    return;
  }

  await sendTelegramMessage(
    input.chatId,
    [
      "Telegram нөміріңіз сәтті расталды ✅",
      "AI-Sana сайтына қайта оралыңыз. Диагностикалық тест енді ашылады.",
    ].join("\n"),
    { replyMarkup: getRemoveKeyboard() },
  );
}

function getStartPayload(text: string) {
  const match = text.trim().match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+(.+))?$/i);

  if (!match) {
    return null;
  }

  return match[1]?.trim() ?? "";
}

function getPlainStartMessage() {
  return [
    "Сәлеметсіз бе! Бұл AI-Sana боты 🤖",
    "Ата-ана есебін қосу үшін AI-Sana сайтындағы арнайы Telegram сілтемесі арқылы кіріңіз.",
  ].join("\n");
}

function getUnknownMessage() {
  return "Мен AI-Sana ата-ана есебін жіберетін ботпын. Қосылу үшін сайттағы Telegram батырмасын басыңыз.";
}
