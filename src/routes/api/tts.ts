import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { z } from "zod";

const ttsRequestSchema = z.object({
  language: z.enum(["EN", "KZ", "RU"]).optional(),
  text: z.string().trim().min(1).max(2400),
});

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;

        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = ttsRequestSchema.safeParse(body);

        if (!parsed.success) {
          return Response.json({ error: "Please send valid text." }, { status: 400 });
        }

        try {
          const text = prepareSpeechText(parsed.data.text);
          const speechLanguage = getSpeechLanguage(parsed.data.language, text);
          const edgeAudio = await generateEdgeVoice(text, speechLanguage);

          if (edgeAudio) {
            return Response.json(edgeAudio);
          }

          if (!process.env.GOOGLE_API_KEY) {
            return Response.json(
              {
                code: "missing_google_key",
                error: "Voice fallback is not configured yet.",
              },
              { status: 500 },
            );
          }

          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
          let audio: AudioPart | null = null;
          let lastError: unknown;

          for (const model of getTtsModels()) {
            for (const voiceName of getTtsVoices()) {
              try {
                const response = await ai.models.generateContent({
                  model,
                  contents: `${speechLanguage.instruction} Text: ${text}`,
                  config: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                      voiceConfig: {
                        prebuiltVoiceConfig: {
                          voiceName,
                        },
                      },
                    },
                  },
                });
                audio = extractAudio(response);

                if (audio?.data) {
                  break;
                }
              } catch (error) {
                lastError = error;
              }
            }

            if (audio?.data) {
              break;
            }
          }

          if (!audio?.data) {
            if (lastError) {
              console.error("AI-Sana TTS model fallback failed", lastError);
            }
            const fallbackAudio = await generateTranslateVoice(text, speechLanguage.translateCode);

            if (fallbackAudio) {
              return Response.json(fallbackAudio);
            }

            return Response.json(
              { error: "Voice could not be generated. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({
            audio: normalizeAudioBase64(audio.data, audio.mimeType),
            mimeType: audio.mimeType?.includes("wav") ? audio.mimeType : "audio/wav",
          });
        } catch (error) {
          console.error("AI-Sana TTS error", error);
          return Response.json(
            {
              code: "tts_error",
              error: "Voice could not be generated right now.",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});

type AudioPart = {
  data: string;
  mimeType?: string;
};

type SpeechLanguage = {
  code: string;
  translateCode: string;
  edgeVoice: string;
  edgeRate: number;
  edgePitch: string;
  instruction: string;
};

function getTtsModels() {
  return [
    process.env.GEMINI_TTS_MODEL,
    "gemini-2.5-flash-preview-tts",
    "gemini-2.5-pro-preview-tts",
  ].filter((model): model is string => Boolean(model));
}

function getTtsVoices() {
  return [
    process.env.GEMINI_TTS_VOICE,
    "Kore",
    "Zephyr",
    "Puck",
    "Leda",
  ].filter((voice): voice is string => Boolean(voice));
}

function extractAudio(response: unknown): AudioPart | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const candidates = (response as { candidates?: unknown }).candidates;

  if (!Array.isArray(candidates)) {
    return null;
  }

  for (const candidate of candidates) {
    const content = candidate && typeof candidate === "object"
      ? (candidate as { content?: unknown }).content
      : null;
    const parts = content && typeof content === "object"
      ? (content as { parts?: unknown }).parts
      : null;

    if (!Array.isArray(parts)) {
      continue;
    }

    for (const part of parts) {
      const inlineData = part && typeof part === "object"
        ? (part as { inlineData?: unknown }).inlineData
        : null;

      if (!inlineData || typeof inlineData !== "object") {
        continue;
      }

      const data = (inlineData as { data?: unknown }).data;
      const mimeType = (inlineData as { mimeType?: unknown }).mimeType;

      if (typeof data === "string" && data.length > 0) {
        return {
          data,
          mimeType: typeof mimeType === "string" ? mimeType : undefined,
        };
      }
    }
  }

  return null;
}

function normalizeAudioBase64(audio: string, mimeType?: string) {
  if (mimeType?.includes("wav")) {
    return audio;
  }

  return pcmBase64ToWavBase64(audio);
}

function prepareSpeechText(text: string) {
  return text
    .replace(/[😀-🙏🌀-🗿🚀-🛿]/gu, "")
    .replace(/\*\*/g, "")
    .replace(/[`#>_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSpeechLanguage(language: "EN" | "KZ" | "RU" | undefined, text: string): SpeechLanguage {
  const detectedLanguage = detectTextLanguage(text, language);

  if (detectedLanguage === "KZ") {
    return {
      code: "kk-KZ",
      translateCode: "kk",
      edgeVoice: "kk-KZ-AigulNeural",
      edgeRate: -12,
      edgePitch: "+22Hz",
      instruction:
        "Мәтінді AI-Sana атынан қазақ тілінде оқы. Дауысың көңілді, жылы, балаға түсінікті, мейірімді жас репетитор сияқты болсын. Сөздерді қазақша табиғи айт. Робот сияқты сөйлеме.",
    };
  }

  if (detectedLanguage === "RU") {
    return {
      code: "ru-RU",
      translateCode: "ru",
      edgeVoice: "ru-RU-SvetlanaNeural",
      edgeRate: -10,
      edgePitch: "+18Hz",
      instruction:
        "Прочитай текст от имени AI-Sana на русском языке. Голос должен быть живым, добрым, дружелюбным и подходящим для детей. Произноси русские слова естественно, без казахского или английского акцента. Не говори как робот.",
    };
  }

  return {
    code: "en-US",
    translateCode: "en",
    edgeVoice: "en-US-AvaNeural",
    edgeRate: -8,
    edgePitch: "+16Hz",
    instruction:
      "Read this as AI-Sana in English: a cheerful, warm, friendly tutor for a 10-14 year old pupil. Speak naturally, brightly, and clearly. Do not sound robotic.",
  };
}

async function generateEdgeVoice(text: string, speechLanguage: SpeechLanguage) {
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(speechLanguage.edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(escapeSsmlText(text), {
      rate: speechLanguage.edgeRate,
      pitch: speechLanguage.edgePitch,
    });
    const chunks = await readStreamChunks(audioStream);

    if (!chunks.length) {
      return null;
    }

    return {
      audio: Buffer.concat(chunks).toString("base64"),
      mimeType: "audio/mpeg",
    };
  } catch (error) {
    console.error("AI-Sana Edge TTS fallback failed", error);
    return null;
  }
}

function readStreamChunks(stream: NodeJS.ReadableStream) {
  return new Promise<Buffer[]>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let settled = false;
    let idleTimer: NodeJS.Timeout | null = null;
    const maxTimer = setTimeout(() => finish(), 15_000);
    const finish = () => {
      if (!settled) {
        settled = true;
        if (idleTimer) {
          clearTimeout(idleTimer);
        }
        clearTimeout(maxTimer);
        resolve(chunks);
      }
    };

    stream.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => finish(), 800);
    });
    stream.on("end", finish);
    stream.on("close", finish);
    stream.on("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
  });
}

function escapeSsmlText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateTranslateVoice(text: string, languageCode: string) {
  const chunks = splitSpeechText(text, 180);
  const audioBuffers: Buffer[] = [];
  let mimeType = "audio/mpeg";

  for (const chunk of chunks) {
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", languageCode);
    url.searchParams.set("q", chunk);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("audio/")) {
      return null;
    }

    mimeType = contentType.split(";")[0] || mimeType;
    audioBuffers.push(Buffer.from(await response.arrayBuffer()));
  }

  if (!audioBuffers.length) {
    return null;
  }

  return {
    audio: Buffer.concat(audioBuffers).toString("base64"),
    mimeType,
  };
}

function splitSpeechText(text: string, maxLength: number) {
  const sentences = text.match(/[^.!?。؟…]+[.!?。؟…]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    current = sentence.trim();
  }

  if (current) {
    chunks.push(current.slice(0, maxLength));
  }

  return chunks;
}

function detectTextLanguage(text: string, fallbackLanguage?: "EN" | "KZ" | "RU"): "EN" | "KZ" | "RU" {
  const kazakhSpecificLetters = (text.match(/[әғқңөұүһі]/gi) ?? []).length;
  const cyrillicLetters = (text.match(/[а-яёәғқңөұүһі]/gi) ?? []).length;
  const latinLetters = (text.match(/[a-z]/gi) ?? []).length;

  if (kazakhSpecificLetters > 0) {
    return "KZ";
  }

  if (cyrillicLetters > 0) {
    return "RU";
  }

  if (latinLetters > 0) {
    return "EN";
  }

  return fallbackLanguage ?? "EN";
}

function pcmBase64ToWavBase64(base64Pcm: string) {
  const pcm = Buffer.from(base64Pcm, "base64");
  const header = createWavHeader(pcm.length);

  return Buffer.concat([header, pcm]).toString("base64");
}

function createWavHeader(dataLength: number) {
  const sampleRate = 24000;
  const channelCount = 1;
  const bitsPerSample = 16;
  const blockAlign = (channelCount * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channelCount, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}
