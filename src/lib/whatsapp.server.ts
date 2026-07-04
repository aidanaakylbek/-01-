export type WhatsAppSendResult =
  | { ok: true; whatsappMessageId?: string }
  | { ok: false; code: string; detail: string };

const DEFAULT_GRAPH_VERSION = "v21.0";

export async function sendWhatsAppText({
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

export async function sendWhatsAppTemplate({
  languageCode = "en_US",
  name,
  to,
}: {
  languageCode?: string;
  name: string;
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
          type: "template",
          template: {
            name,
            language: {
              code: languageCode,
            },
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

export function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function maskPhone(phone: string) {
  const digits = normalizeWhatsAppPhone(phone);

  if (digits.length < 5) {
    return "configured";
  }

  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}
