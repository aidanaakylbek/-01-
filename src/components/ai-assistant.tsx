import { useEffect, useRef, useState } from "react";
import { AibiMark } from "@/components/aibi-mark";

type SpeechRecognitionEventResult = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionEventResult>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your AI-Sana AI Tutor. Ask me about math, logic, reading, languages, study plans, or NIS/BIL/NSPM exam preparation.",
};

const FRIENDLY_ERROR =
  "I could not answer right now, but do not worry. Please try again in a moment, or ask your teacher if it is urgent.";
const CONFIG_ERROR =
  "AI Tutor is connected to the app, but the Google AI key is not added yet. Add GOOGLE_API_KEY to the server .env file and restart the app.";
const VOICE_UNSUPPORTED =
  "Voice input is not available in this browser yet. You can still type your question here.";
const VOICE_ERROR =
  "I could not hear that clearly. Please try the microphone again or type your question.";
const CLOUD_VOICE_ERROR =
  "AI-Sana voice is not ready yet. I will keep the answer on screen instead of using the robotic browser voice.";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    };
  }, []);

  const speakText = async (text: string) => {
    const playedCloudVoice = await playCloudVoice(text);

    if (playedCloudVoice) {
      return;
    }

    setVoiceStatus(CLOUD_VOICE_ERROR);
  };

  const playCloudVoice = async (text: string) => {
    try {
      setVoiceStatus("Preparing a warmer AI-Sana voice...");
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await response.json()) as {
        audio?: string;
        mimeType?: string;
      };

      if (!response.ok || !data.audio) {
        setVoiceStatus(CLOUD_VOICE_ERROR);
        return false;
      }

      audioRef.current?.pause();
      const audio = new Audio(`data:${data.mimeType ?? "audio/wav"};base64,${data.audio}`);
      audioRef.current = audio;
      audio.onended = () => setVoiceStatus("");
      await audio.play();
      return true;
    } catch {
      setVoiceStatus(CLOUD_VOICE_ERROR);
      return false;
    }
  };

  const sendMessage = async (messageText: string, options?: { speakAnswer?: boolean }) => {
    const trimmedInput = messageText.trim();

    if (!trimmedInput || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedInput }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setVoiceStatus("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.filter((message) => message !== INITIAL_MESSAGE).slice(-12),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string; code?: string };

      if (!response.ok || !data.reply) {
        const message =
          data.code === "missing_google_key" ? CONFIG_ERROR : (data.error ?? FRIENDLY_ERROR);
        setMessages((prev) => [...prev, { role: "assistant", content: message }]);
        if (options?.speakAnswer) {
          void speakText(message);
        }
        return;
      }

      const reply = data.reply ?? FRIENDLY_ERROR;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (options?.speakAnswer) {
        void speakText(reply);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: FRIENDLY_ERROR }]);
      if (options?.speakAnswer) {
        void speakText(FRIENDLY_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const startVoiceInput = () => {
    if (isLoading || isListening) {
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceStatus(VOICE_UNSUPPORTED);
      return;
    }

    const recognition = new Recognition();
    let finalTranscript = "";

    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "kk-KZ";
    setIsListening(true);
    setVoiceStatus("Listening...");

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInput(`${finalTranscript} ${interimTranscript}`.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus(VOICE_ERROR);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;

      const question = finalTranscript.trim();
      if (!question) {
        setVoiceStatus((current) => current || VOICE_ERROR);
        return;
      }

      void sendMessage(question, { speakAnswer: true });
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <>
      <button
        aria-label="Open AI Tutor"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-lg hover:shadow-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center btn-squish border border-secondary"
        onClick={() => setIsOpen(true)}
      >
        <AibiMark
          className="border-0 shadow-none"
          label="Open AI-Sana Tutor"
          shape="circle"
          size="lg"
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            aria-label="Close AI Tutor"
            className="absolute inset-0 bg-black/75"
            onClick={() => setIsOpen(false)}
            type="button"
          />

          <section className="absolute inset-x-0 bottom-0 top-[max(0.75rem,env(safe-area-inset-top))] sm:top-auto sm:h-[85dvh] overflow-hidden flex flex-col rounded-t-[10px] border border-outline-variant bg-background shadow-2xl">
            <div className="mx-auto mt-3 h-1.5 w-[92px] rounded-full bg-muted shrink-0" />
            <header className="shrink-0 border-b border-outline-variant px-4 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                <AibiMark shape="circle" size="md" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-headline-md text-title-lg sm:text-headline-md">
                    AI-Sana AI Tutor
                  </h2>
                  <p className="text-xs text-on-surface-variant line-clamp-1">
                    Voice and text help for exams and study plans
                  </p>
                </div>
                <button
                  aria-label="Close AI Tutor"
                  className="w-10 h-10 border border-outline-variant rounded-full flex items-center justify-center bg-surface hover:bg-surface-container transition-colors shrink-0"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 sm:py-4 space-y-4 bg-background">
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(86vw,760px)] sm:max-w-[min(88vw,760px)] rounded-2xl px-4 py-3 font-body-md text-body-md ${
                      msg.role === "user"
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container-high text-on-surface border border-outline-variant"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <button
                        aria-label="Read AI-Sana answer aloud"
                        className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-secondary hover:bg-secondary hover:text-on-secondary transition-colors"
                        onClick={() => void speakText(msg.content)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">volume_up</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-high text-on-surface rounded-2xl px-4 py-3 border border-outline-variant">
                    <div className="flex gap-2 items-center" aria-live="polite">
                      <span className="text-sm text-on-surface-variant mr-1">Thinking...</span>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="shrink-0 border-t border-outline-variant bg-surface px-3 sm:px-4 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2"
              onSubmit={handleSendMessage}
            >
              <div className="min-w-0 flex-1">
                <input
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full font-body-md text-sm sm:text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Speak now..." : "Ask by voice or text..."}
                  type="text"
                  value={input}
                />
                {voiceStatus ? (
                  <p className="mt-1 px-3 text-xs text-on-surface-variant" aria-live="polite">
                    {voiceStatus}
                  </p>
                ) : null}
              </div>
              <button
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed btn-squish border ${
                  isListening
                    ? "bg-error text-on-error border-error"
                    : "bg-surface text-secondary border-secondary hover:bg-secondary hover:text-on-secondary"
                }`}
                disabled={isLoading}
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">
                  {isListening ? "stop" : "mic"}
                </span>
              </button>
              <button
                aria-label="Send message"
                className="w-10 h-10 bg-secondary text-on-secondary rounded-full hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed btn-squish border border-secondary"
                disabled={isLoading || !input.trim()}
                type="submit"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
