import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type TelegramSendResult =
  | { ok: true; messageId?: number }
  | { ok: false; code: string; detail: string };

export type TelegramWebhookResult =
  | { ok: true; webhookUrl: string; description?: string }
  | { ok: false; code: string; detail: string };

export type TelegramWebhookInfoResult =
  | {
      ok: true;
      webhookUrl: string;
      pendingUpdateCount: number;
      lastErrorDate?: number;
      lastErrorMessage?: string;
    }
  | { ok: false; code: string; detail: string };

export function getTelegramBotUsername() {
  const username = process.env.TELEGRAM_BOT_USERNAME || process.env.VITE_TELEGRAM_BOT_USERNAME || "";
  return username.replace(/^@/, "").trim();
}

export function buildParentTelegramInviteLink(inviteCode: string) {
  const username = getTelegramBotUsername();

  if (!username) {
    return "";
  }

  return `https://t.me/${username}?start=${encodeURIComponent(inviteCode)}`;
}

export function createTelegramStartToken() {
  return randomBytes(32).toString("base64url");
}

export function hashTelegramStartToken(token: string) {
  const secret = process.env.TELEGRAM_TOKEN_SECRET || process.env.TELEGRAM_BOT_TOKEN || "ai-sana-dev";
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidTelegramWebhookSecret(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (!expected) {
    return true;
  }

  const received = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function getAppUrl(request?: Request) {
  const configuredUrl = process.env.APP_URL?.trim().replace(/\/$/, "");

  if (configuredUrl) {
    return configuredUrl;
  }

  if (request) {
    return new URL(request.url).origin;
  }

  return "";
}

export function buildTelegramWebhookUrl(request?: Request) {
  const appUrl = getAppUrl(request);

  if (!appUrl) {
    return "";
  }

  return `${appUrl}/api/telegram/webhook`;
}

export async function sendTelegramMessage(
  chatIdOrInput: string | { chatId: string; text: string },
  maybeText?: string,
  options?: { replyMarkup?: unknown },
): Promise<TelegramSendResult> {
  const chatId = typeof chatIdOrInput === "string" ? chatIdOrInput : chatIdOrInput.chatId;
  const text = typeof chatIdOrInput === "string" ? (maybeText ?? "") : chatIdOrInput.text;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      ok: false,
      code: "missing_config",
      detail: "Missing Telegram config: TELEGRAM_BOT_TOKEN.",
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        disable_web_page_preview: true,
        ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
        text,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      result?: { message_id?: number };
      description?: string;
    } | null;

    if (!response.ok || data?.ok === false) {
      return {
        ok: false,
        code: "telegram_api_error",
        detail: data?.description ?? `Telegram API returned ${response.status}.`,
      };
    }

    return { ok: true, messageId: data?.result?.message_id };
  } catch (error) {
    return {
      ok: false,
      code: "network_error",
      detail: error instanceof Error ? error.message : "Could not reach Telegram API.",
    };
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<TelegramWebhookResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!webhookUrl) {
    return {
      ok: false,
      code: "missing_app_url",
      detail: "Missing APP_URL. Add APP_URL=https://your-project.vercel.app in Vercel.",
    };
  }

  if (!token) {
    return {
      ok: false,
      code: "missing_config",
      detail: "Missing Telegram config: TELEGRAM_BOT_TOKEN.",
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        allowed_updates: ["message"],
        drop_pending_updates: false,
        ...(process.env.TELEGRAM_WEBHOOK_SECRET
          ? { secret_token: process.env.TELEGRAM_WEBHOOK_SECRET }
          : {}),
        url: webhookUrl,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      description?: string;
    } | null;

    if (!response.ok || data?.ok === false) {
      return {
        ok: false,
        code: "telegram_api_error",
        detail: data?.description ?? `Telegram API returned ${response.status}.`,
      };
    }

    return {
      ok: true,
      webhookUrl,
      description: data?.description,
    };
  } catch (error) {
    return {
      ok: false,
      code: "network_error",
      detail: error instanceof Error ? error.message : "Could not reach Telegram API.",
    };
  }
}

export async function getTelegramWebhookInfo(): Promise<TelegramWebhookInfoResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      ok: false,
      code: "missing_config",
      detail: "Missing Telegram config: TELEGRAM_BOT_TOKEN.",
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      result?: {
        last_error_date?: number;
        last_error_message?: string;
        pending_update_count?: number;
        url?: string;
      };
      description?: string;
    } | null;

    if (!response.ok || data?.ok === false) {
      return {
        ok: false,
        code: "telegram_api_error",
        detail: data?.description ?? `Telegram API returned ${response.status}.`,
      };
    }

    return {
      ok: true,
      webhookUrl: data?.result?.url ?? "",
      pendingUpdateCount: data?.result?.pending_update_count ?? 0,
      lastErrorDate: data?.result?.last_error_date,
      lastErrorMessage: data?.result?.last_error_message,
    };
  } catch (error) {
    return {
      ok: false,
      code: "network_error",
      detail: error instanceof Error ? error.message : "Could not reach Telegram API.",
    };
  }
}
