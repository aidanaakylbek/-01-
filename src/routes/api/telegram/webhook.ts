import { createFileRoute } from "@tanstack/react-router";

import { startTelegramVerificationSession } from "@/lib/account-store.server";
import { isValidTelegramWebhookSecret, sendTelegramMessage } from "@/lib/telegram.server";

type TelegramUpdate = {
  message?: {
    chat?: {
      id?: number | string;
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
            hasMessage: Boolean(update?.message),
            hasText: Boolean(update?.message?.text),
          });

          if (!chatId || !fromId) {
            return Response.json({ ok: true, ignored: true });
          }

          const chatIdText = String(chatId);
          const fromIdText = String(fromId);
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
      `Растау коды: ${result.code}`,
      "Осы кодты AI-Sana сайтындағы өріске енгізіп, растауды аяқтаңыз.",
      "Код 10 минут ішінде жарамды.",
    ].join("\n"),
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
    "Растау коды алу үшін AI-Sana сайтындағы арнайы Telegram сілтемесі арқылы кіріңіз.",
  ].join("\n");
}

function getUnknownMessage() {
  return "Мен AI-Sana растау ботымын. Растау коды алу үшін сайттағы Telegram батырмасын басыңыз.";
}
