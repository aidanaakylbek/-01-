export type TelegramSendResult =
  | { ok: true; messageId?: number }
  | { ok: false; code: string; detail: string };

export function getTelegramBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || process.env.VITE_TELEGRAM_BOT_USERNAME || "YOUR_BOT_USERNAME";
}

export function buildParentTelegramInviteLink(inviteCode: string) {
  return `https://t.me/${getTelegramBotUsername()}?start=parent_${encodeURIComponent(inviteCode)}`;
}

export async function sendTelegramMessage({
  chatId,
  text,
}: {
  chatId: string;
  text: string;
}): Promise<TelegramSendResult> {
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
