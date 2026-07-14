import { createFileRoute } from "@tanstack/react-router";

import { getCurrentParentReportTarget } from "@/lib/account-store.server";
import { sendTelegramMessage } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/parent/send-test-message")({
  server: {
    handlers: {
      POST: async () => {
        const target = await getCurrentParentReportTarget();

        if (!target) {
          return Response.json(
            {
              error: "Parent is not verified through Telegram yet.",
            },
            { status: 403 },
          );
        }

        const result = await sendTelegramMessage({
          chatId: target.telegramChatId,
          text: [
            "AI-Sana тест хабарламасы ✅",
            "",
            `${target.account.name} бойынша апталық есеп Telegram арқылы жіберіледі.`,
          ].join("\n"),
        });

        if (!result.ok) {
          return Response.json({ status: "not_sent", reason: result }, { status: 502 });
        }

        return Response.json({ status: "sent", messageId: result.messageId });
      },
    },
  },
});
