import { createFileRoute } from "@tanstack/react-router";

import { createTelegramVerificationInvite, getDashboardAccount } from "@/lib/account-store.server";
import {
  buildParentTelegramInviteLink,
  buildTelegramWebhookUrl,
  getTelegramWebhookInfo,
  setTelegramWebhook,
} from "@/lib/telegram.server";

export const Route = createFileRoute("/api/parent/create-invite")({
  server: {
    handlers: {
      GET: async ({ request }) => handleCreateInvite(request),
      POST: async ({ request }) => handleCreateInvite(request),
    },
  },
});

async function handleCreateInvite(request: Request) {
  try {
    return Response.json(await createParentInviteResponse(request));
  } catch (error) {
    console.error("[parent:create-invite] failed", error);

    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return Response.json(
        { error: "AUTH_REQUIRED", message: "Алдымен аккаунтқа кіріңіз." },
        { status: 401 },
      );
    }

    return Response.json(
      {
        error: "INVITE_CREATION_FAILED",
        message: "Telegram кодын жасау сәтсіз аяқталды. Сәл кейін қайта көріңіз.",
      },
      { status: 500 },
    );
  }
}

async function createParentInviteResponse(request: Request) {
  const dashboard = await getDashboardAccount();
  const invite = await createTelegramVerificationInvite("student_verification");
  const telegramLink = buildParentTelegramInviteLink(invite.token);
  const webhookStatus = await ensureTelegramWebhook(request);

  return {
    expiresAt: invite.expiresAt,
    parentName: invite.parentName,
    status: getParentStatus(dashboard.account),
    telegramConfigured: Boolean(telegramLink),
    telegramLink,
    webhookStatus,
  };
}

async function ensureTelegramWebhook(request: Request) {
  const webhookUrl = buildTelegramWebhookUrl(request);
  const info = await getTelegramWebhookInfo();

  if (info.ok && info.webhookUrl === webhookUrl && !info.lastErrorMessage) {
    return {
      connected: true,
      pendingUpdateCount: info.pendingUpdateCount,
      webhookUrl,
    };
  }

  const result = await setTelegramWebhook(webhookUrl);

  if (!result.ok) {
    return {
      connected: false,
      error: result.detail,
      webhookUrl,
    };
  }

  return {
    connected: true,
    pendingUpdateCount: info.ok ? info.pendingUpdateCount : 0,
    previousError: info.ok ? info.lastErrorMessage : undefined,
    webhookUrl,
  };
}

function getParentStatus(account: Awaited<ReturnType<typeof getDashboardAccount>>["account"]) {
  return {
    lastReportSentAt: account.parentLastReportSentAt ?? null,
    phoneVerified: account.parentPhoneVerified,
    telegramConnected: account.parentTelegramConnected,
    telegramVerifiedAt: account.parentTelegramVerifiedAt ?? null,
    verified: account.parentPhoneVerified && account.parentTelegramConnected,
  };
}
