import { createFileRoute } from "@tanstack/react-router";

import {
  getVerifiedParentReportTargets,
  markWeeklyReportSent,
  wasWeeklyReportSent,
} from "@/lib/account-store.server";
import { sendTelegramMessage } from "@/lib/telegram.server";
import { generateWeeklyReport } from "../whatsapp-weekly-report";

export const Route = createFileRoute("/api/cron/send-weekly-reports")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return Response.json({ error: "Unauthorized weekly report request." }, { status: 401 });
        }

        const weekKey = getWeekKey();
        const targets = getVerifiedParentReportTargets();
        const results = [];

        for (const target of targets) {
          if (wasWeeklyReportSent(target.account.id, weekKey)) {
            results.push({ studentId: target.account.id, status: "skipped_duplicate" });
            continue;
          }

          const result = await sendTelegramMessage({
            chatId: target.telegramChatId,
            text: generateWeeklyReport(target.account.id),
          });

          if (result.ok) {
            markWeeklyReportSent(target.account.id, weekKey);
            results.push({ messageId: result.messageId, studentId: target.account.id, status: "sent" });
          } else {
            results.push({ reason: result, studentId: target.account.id, status: "not_sent" });
          }
        }

        return Response.json({
          sent: results.filter((item) => item.status === "sent").length,
          skipped: results.filter((item) => item.status === "skipped_duplicate").length,
          totalVerifiedParents: targets.length,
          weekKey,
          results,
        });
      },
    },
  },
});

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const urlSecret = new URL(request.url).searchParams.get("secret");

  return authorization === `Bearer ${secret}` || headerSecret === secret || urlSecret === secret;
}

function getWeekKey() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);

  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(
    start.getDate(),
  ).padStart(2, "0")}`;
}
