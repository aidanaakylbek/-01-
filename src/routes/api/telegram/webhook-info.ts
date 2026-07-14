import { createFileRoute } from "@tanstack/react-router";

import { getTelegramWebhookInfo } from "@/lib/telegram.server";

export const Route = createFileRoute("/api/telegram/webhook-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = authorizeAdminRequest(request);

        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error }, { status: 401 });
        }

        const result = await getTelegramWebhookInfo();

        return Response.json({
          telegram: result,
        });
      },
    },
  },
});

function authorizeAdminRequest(request: Request) {
  const expectedSecret = process.env.CRON_SECRET ?? "";

  if (!expectedSecret) {
    return { ok: false, error: "CRON_SECRET is not configured." };
  }

  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") ?? "";

  if (secret !== expectedSecret) {
    return { ok: false, error: "Unauthorized." };
  }

  return { ok: true };
}
