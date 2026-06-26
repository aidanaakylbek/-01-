import { createFileRoute } from "@tanstack/react-router";

import { getDashboardAccount } from "@/lib/account-store.server";

type WhatsAppSendResult =
  | { ok: true; whatsappMessageId?: string }
  | { ok: false; code: string; detail: string };

const DEFAULT_GRAPH_VERSION = "v21.0";

export const Route = createFileRoute("/api/whatsapp-weekly-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAuthorizedCronRequest(request)) {
          return Response.json({ error: "Unauthorized weekly report request." }, { status: 401 });
        }

        const dashboard = getDashboardAccount();
        const reportText = buildParentWhatsAppReport(dashboard);
        const result = await sendWhatsAppText({
          body: reportText,
          to: dashboard.account.parentWhatsApp,
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
          to: maskPhone(dashboard.account.parentWhatsApp),
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

  return authorization === `Bearer ${secret}` || headerSecret === secret;
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

async function sendWhatsAppText({
  body,
  to,
}: {
  body: string;
  to: string;
}): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION ?? DEFAULT_GRAPH_VERSION;
  const normalizedTo = normalizeWhatsAppPhone(to || process.env.DEMO_PARENT_WHATSAPP || "");
  const missingConfig = [
    !token ? "WHATSAPP_ACCESS_TOKEN" : null,
    !phoneNumberId ? "WHATSAPP_PHONE_NUMBER_ID" : null,
    !normalizedTo ? "parentWhatsApp or DEMO_PARENT_WHATSAPP" : null,
  ].filter(Boolean);

  if (missingConfig.length > 0) {
    return {
      ok: false,
      code: "missing_config",
      detail: `Missing WhatsApp config: ${missingConfig.join(", ")}.`,
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizedTo,
          type: "text",
          text: {
            body,
            preview_url: false,
          },
        }),
      },
    );

    const data = (await response.json().catch(() => null)) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        code: "whatsapp_api_error",
        detail: data?.error?.message ?? `WhatsApp API returned ${response.status}.`,
      };
    }

    return { ok: true, whatsappMessageId: data?.messages?.[0]?.id };
  } catch (error) {
    return {
      ok: false,
      code: "network_error",
      detail: error instanceof Error ? error.message : "Could not reach WhatsApp API.",
    };
  }
}

function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function maskPhone(phone: string) {
  const digits = normalizeWhatsAppPhone(phone);

  if (digits.length < 5) {
    return "configured";
  }

  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}
