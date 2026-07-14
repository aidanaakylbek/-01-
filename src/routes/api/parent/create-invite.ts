import { createFileRoute } from "@tanstack/react-router";

import { createOrReturnParentInvite, getDashboardAccount } from "@/lib/account-store.server";
import {
  buildParentTelegramInviteLink,
  buildTelegramWebhookUrl,
  getTelegramWebhookInfo,
  setTelegramWebhook,
} from "@/lib/telegram.server";

export const Route = createFileRoute("/api/parent/create-invite")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json(await createParentInviteResponse(request));
      },
      POST: async ({ request }) => {
        return Response.json(await createParentInviteResponse(request));
      },
    },
  },
});

async function createParentInviteResponse(request: Request) {
  const dashboard = getDashboardAccount();
  const invite = createOrReturnParentInvite();
  const telegramLink = buildParentTelegramInviteLink(invite.inviteCode);
  const webhookStatus = await ensureTelegramWebhook(request);

  return {
    inviteCode: invite.inviteCode,
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

function getParentStatus(account: ReturnType<typeof getDashboardAccount>["account"]) {
  return {
    lastReportSentAt: account.parentLastReportSentAt ?? null,
    phoneVerified: account.parentPhoneVerified,
    telegramConnected: account.parentTelegramConnected,
    telegramVerifiedAt: account.parentTelegramVerifiedAt ?? null,
    verified: account.parentPhoneVerified && account.parentTelegramConnected,
  };
}
