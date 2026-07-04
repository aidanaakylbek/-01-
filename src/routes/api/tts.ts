import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ttsRequestSchema = z.object({
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

        if (!process.env.GOOGLE_API_KEY) {
          return Response.json(
            {
              code: "missing_google_key",
              error: "Voice is not configured yet. Add GOOGLE_API_KEY to the server.",
            },
            { status: 500 },
          );
        }

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
          const text = prepareSpeechText(parsed.data.text);
          const response = await ai.models.generateContent({
            model: process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts",
            contents: `Read this as AI-Sana: a warm, friendly, calm tutor for a 10-14 year old pupil. Speak naturally, softly, and clearly. Do not sound robotic. Text: ${text}`,
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: process.env.GEMINI_TTS_VOICE || "Kore",
                  },
                },
              },
            },
          });
          const audio = response.data;

          if (!audio) {
            return Response.json(
              { error: "Voice could not be generated. Please try again." },
              { status: 502 },
            );
          }

          return Response.json({
            audio: pcmBase64ToWavBase64(audio),
            mimeType: "audio/wav",
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

function prepareSpeechText(text: string) {
  return text
    .replace(/[😀-🙏🌀-🗿🚀-🛿]/gu, "")
    .replace(/\*\*/g, "")
    .replace(/[`#>_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
