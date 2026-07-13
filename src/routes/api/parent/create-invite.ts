import { createFileRoute } from "@tanstack/react-router";

import { createOrReturnParentInvite, getDashboardAccount } from "@/lib/account-store.server";
import { buildParentTelegramInviteLink } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/parent/create-invite")({
  server: {
    handlers: {
      GET: async () => {
        const dashboard = getDashboardAccount();
        const invite = createOrReturnParentInvite();

        return Response.json({
          inviteCode: invite.inviteCode,
          parentName: invite.parentName,
          status: getParentStatus(dashboard.account),
          telegramLink: buildParentTelegramInviteLink(invite.inviteCode),
        });
      },
      POST: async () => {
        const dashboard = getDashboardAccount();
        const invite = createOrReturnParentInvite();

        return Response.json({
          inviteCode: invite.inviteCode,
          parentName: invite.parentName,
          status: getParentStatus(dashboard.account),
          telegramLink: buildParentTelegramInviteLink(invite.inviteCode),
        });
      },
    },
  },
});

function getParentStatus(account: ReturnType<typeof getDashboardAccount>["account"]) {
  return {
    lastReportSentAt: account.parentLastReportSentAt ?? null,
    phoneVerified: account.parentPhoneVerified,
    telegramConnected: account.parentTelegramConnected,
    telegramVerifiedAt: account.parentTelegramVerifiedAt ?? null,
    verified: account.parentPhoneVerified && account.parentTelegramConnected,
  };
}
