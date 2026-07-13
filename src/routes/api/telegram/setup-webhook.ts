import { createFileRoute } from "@tanstack/react-router";

import { getTelegramBotUsername, setTelegramWebhook } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/telegram/setup-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const secret = url.searchParams.get("secret") ?? "";
        const expectedSecret = process.env.CRON_SECRET ?? "";

        if (!expectedSecret || secret !== expectedSecret) {
          return Response.json({ error: "Unauthorized Telegram webhook setup request." }, { status: 401 });
        }

        const webhookUrl = new URL("/api/telegram/webhook", url.origin).toString();
        const result = await setTelegramWebhook(webhookUrl);

        if (!result.ok) {
          return Response.json(
            {
              ok: false,
              code: result.code,
              detail: result.detail,
              telegramBotUsername: maskTelegramBotUsername(getTelegramBotUsername()),
            },
            { status: 500 },
          );
        }

        return Response.json({
          ok: true,
          message: "Telegram webhook connected.",
          telegramBotUsername: maskTelegramBotUsername(getTelegramBotUsername()),
          webhookUrl: result.webhookUrl,
        });
      },
    },
  },
});

function maskTelegramBotUsername(username: string) {
  if (!username) {
    return "";
  }

  if (username.length <= 4) {
    return `${username[0] ?? ""}***`;
  }

  return `${username.slice(0, 2)}***${username.slice(-2)}`;
}
