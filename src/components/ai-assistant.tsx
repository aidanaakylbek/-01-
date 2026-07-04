import { useEffect, useRef, useState } from "react";
import { AibiMark } from "@/components/aibi-mark";
import { useLanguage } from "@/hooks/use-language";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your AI-Sana AI Tutor. Ask me about math, logic, reading, languages, study plans, or NIS/BIL/NSPM exam preparation.",
};

export function AIAssistant() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const speakText = async (text: string) => {
    const playedCloudVoice = await playCloudVoice(text);

    if (playedCloudVoice) {
      return;
    }

    setVoiceStatus(getVoiceMessage(language, "unavailable"));
  };

  const playCloudVoice = async (text: string) => {
    try {
      setVoiceStatus(getVoiceMessage(language, "preparing"));
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, text }),
      });
      const data = (await response.json()) as {
        audio?: string;
        mimeType?: string;
      };

      if (!response.ok || !data.audio) {
        setVoiceStatus(getVoiceMessage(language, "deviceFallback"));
        return false;
      }

      audioRef.current?.pause();
      const audio = new Audio(`data:${data.mimeType ?? "audio/wav"};base64,${data.audio}`);
      audioRef.current = audio;
      audio.onended = () => setVoiceStatus("");
      await audio.play();
      return true;
    } catch {
      setVoiceStatus(getVoiceMessage(language, "deviceFallback"));
      return false;
    }
  };

  const sendMessage = async (messageText: string) => {
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
          language,
          messages: nextMessages.filter((message) => message !== INITIAL_MESSAGE).slice(-12),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string; code?: string };

      if (!response.ok || !data.reply) {
        const message = getAssistantRecoveryMessage(language);
        setMessages((prev) => [...prev, { role: "assistant", content: message }]);
        return;
      }

      const reply = data.reply ?? getAssistantRecoveryMessage(language);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: getAssistantRecoveryMessage(language) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
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
                    Text help for exams and study plans
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
                  placeholder="Ask about percentages, logic, English, or study plans..."
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

function getAssistantRecoveryMessage(language: "EN" | "KZ" | "RU") {
  if (language === "KZ") {
    return "Жақсы, жалғастырайық. Сұрағыңды пәнімен және тақырыбымен бірге жаз: мен оны қадам-қадаммен түсіндіремін.";
  }

  if (language === "RU") {
    return "Хорошо, продолжаем. Напиши вопрос вместе с предметом и темой: я объясню его по шагам.";
  }

  return "Good, let us keep going. Send the question with the subject and topic, and I will explain it step by step.";
}

function getVoiceMessage(
  language: "EN" | "KZ" | "RU",
  key: "preparing" | "deviceFallback" | "unavailable" | "playError",
) {
  const messages = {
    KZ: {
      preparing: "AI-Sana дауысын дайындап жатыр...",
      deviceFallback: "Қазір жауап құрылғыңыздың даусымен оқылады.",
      unavailable: "AI-Sana дауысы қазір қосылмады, жауап экранда тұр.",
      playError: "Дауыс ойналмады, бірақ толық жауап экранда тұр.",
    },
    RU: {
      preparing: "Готовлю голос AI-Sana...",
      deviceFallback: "Сейчас ответ будет озвучен голосом вашего устройства.",
      unavailable: "Голос AI-Sana сейчас недоступен, ответ остается на экране.",
      playError: "Голос не воспроизвелся, но полный ответ есть на экране.",
    },
    EN: {
      preparing: "Preparing AI-Sana voice...",
      deviceFallback: "Using your device voice for this answer.",
      unavailable: "AI-Sana voice is not available right now. The answer is still on screen.",
      playError: "Voice could not play, but the full answer is on screen.",
    },
  };

  return messages[language][key];
}
