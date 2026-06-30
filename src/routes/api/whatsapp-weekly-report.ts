import { createFileRoute } from "@tanstack/react-router";

import { getDashboardAccount } from "@/lib/account-store.server";
import { maskPhone, sendWhatsAppText } from "@/lib/whatsapp.server";

export const Route = createFileRoute("/api/whatsapp-weekly-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return Response.json({ error: "Unauthorized weekly report request." }, { status: 401 });
        }

        const dashboard = getDashboardAccount();
        const recipientPhone = process.env.DEMO_PARENT_WHATSAPP || dashboard.account.parentWhatsApp;
        const reportText = buildParentWhatsAppReport(dashboard);
        const result = await sendWhatsAppText({
          body: reportText,
          to: recipientPhone,
        });

        if (!result.ok) {
          return Response.json(
            {
              status: "not_sent",
              reportPreview: reportText,
              reason: result,
            },
            { status: result.code === "missing_config" ? 200 : 502 },
          );
        }

        return Response.json({
          status: "sent",
          to: maskPhone(recipientPhone),
          whatsappMessageId: result.whatsappMessageId,
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

function buildParentWhatsAppReport(dashboard: ReturnType<typeof getDashboardAccount>) {
  const topRisk = dashboard.risks[0];
  const recommendations = dashboard.recommendations.map((item) => `• ${item}`).join("\n");

  return [
    `AI-Sana: еженедельный отчет для родителей`,
    ``,
    `Ученик: ${dashboard.account.name}, ${dashboard.account.grade} класс`,
    `Готовность: ${dashboard.readiness}%`,
    `Завершено уроков: ${dashboard.completedLessons}/${dashboard.weeklyGoal}`,
    `Время обучения: ${dashboard.studyHours} ч`,
    `Средняя точность: ${dashboard.averageAccuracy}%`,
    ``,
    `Главный риск: ${topRisk.title}`,
    `${topRisk.detail}`,
    ``,
    `Что сделать родителю:`,
    `${dashboard.parentRecommendation}`,
    ``,
    `Рекомендации на неделю:`,
    recommendations,
    ``,
    `Следующий пробный экзамен: ${dashboard.nextExam.day}, ${dashboard.nextExam.time}. ${dashboard.nextExam.description}`,
  ].join("\n");
}
