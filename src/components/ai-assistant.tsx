import { useEffect, useRef, useState } from "react";
import { AibiMark } from "@/components/aibi-mark";
import { ReadableMathText } from "@/components/readable-math-text";
import { useLanguage } from "@/hooks/use-language";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: string[];
};

export function AIAssistant() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage(language)]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ dataUrl: string; name: string } | null>(
    null,
  );
  const [voiceStatus, setVoiceStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && isInitialAssistantMessage(prev[0])) {
        return [getInitialMessage(language)];
      }

      return prev;
    });
  }, [language]);

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
    const image = selectedImage;

    if ((!trimmedInput && !image) || isLoading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: trimmedInput || getImageOnlyPrompt(language),
        images: image ? [image.dataUrl] : undefined,
      },
    ];
    setMessages(nextMessages);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);
    setVoiceStatus("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          messages: nextMessages
            .filter((message) => !isInitialAssistantMessage(message))
            .slice(-12),
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: getAssistantRecoveryMessage(language) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setVoiceStatus(getUploadMessage(language, "invalid"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setVoiceStatus(getUploadMessage(language, "large"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        setSelectedImage({ dataUrl: result, name: file.name });
        setVoiceStatus("");
      }
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
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
                    {getChatCopy(language).subtitle}
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
                    {msg.images?.length ? (
                      <div className="mb-2 grid gap-2">
                        {msg.images.map((image, imageIdx) => (
                          <img
                            alt="Attached task"
                            className="max-h-56 w-full rounded-xl border border-outline-variant object-contain bg-surface"
                            key={`${idx}-image-${imageIdx}`}
                            src={image}
                          />
                        ))}
                      </div>
                    ) : null}
                    <p>
                      <ReadableMathText text={msg.content} />
                    </p>
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
                      <span className="text-sm text-on-surface-variant mr-1">
                        {getChatCopy(language).thinking}
                      </span>
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
                {selectedImage ? (
                  <div className="mb-2 flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-2">
                    <img
                      alt={selectedImage.name}
                      className="h-14 w-14 rounded-xl object-cover border border-outline-variant"
                      src={selectedImage.dataUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-on-surface">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {getUploadMessage(language, "ready")}
                      </p>
                    </div>
                    <button
                      aria-label="Remove attached image"
                      className="h-9 w-9 rounded-full border border-outline-variant bg-surface hover:bg-surface-container transition-colors"
                      onClick={() => setSelectedImage(null)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ) : null}
                <input
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full font-body-md text-sm sm:text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getChatCopy(language).placeholder}
                  type="text"
                  value={input}
                />
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={isLoading}
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  type="file"
                />
                {voiceStatus ? (
                  <p className="mt-1 px-3 text-xs text-on-surface-variant" aria-live="polite">
                    {voiceStatus}
                  </p>
                ) : null}
              </div>
              <button
                aria-label="Attach task image"
                className="w-10 h-10 border border-outline-variant text-secondary bg-surface rounded-full hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed btn-squish"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
              </button>
              <button
                aria-label="Send message"
                className="w-10 h-10 bg-secondary text-on-secondary rounded-full hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed btn-squish border border-secondary"
                disabled={isLoading || (!input.trim() && !selectedImage)}
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

function getInitialMessage(language: "EN" | "KZ" | "RU"): ChatMessage {
  return {
    role: "assistant",
    content: getChatCopy(language).initial,
  };
}

function isInitialAssistantMessage(message: ChatMessage) {
  const initialMessages = [
    getChatCopy("EN").initial,
    getChatCopy("KZ").initial,
    getChatCopy("RU").initial,
  ];

  return message.role === "assistant" && initialMessages.includes(message.content);
}

function getChatCopy(language: "EN" | "KZ" | "RU") {
  const copy = {
    KZ: {
      initial:
        "Сәлем! Мен AI-Sana AI көмекшісімін. Математика, логика, оқу сауаттылығы, тілдер, оқу жоспары немесе НЗМ/БИЛ/РФММ дайындығы туралы сұрай аласың.",
      subtitle: "Емтихан мен оқу жоспарына мәтіндік көмек",
      thinking: "Ойланып жатыр...",
      placeholder: "Пайыз, логика, ағылшын немесе оқу жоспары туралы сұра...",
    },
    RU: {
      initial:
        "Привет! Я AI-Sana, твой AI-помощник. Спрашивай про математику, логику, чтение, языки, учебный план или подготовку к НИШ/БИЛ/РФМШ.",
      subtitle: "Текстовая помощь для экзаменов и учебных планов",
      thinking: "Думаю...",
      placeholder: "Спроси про проценты, логику, английский или учебный план...",
    },
    EN: {
      initial:
        "Hello! I'm your AI-Sana AI Tutor. Ask me about math, logic, reading, languages, study plans, or NIS/BIL/NSPM exam preparation.",
      subtitle: "Text help for exams and study plans",
      thinking: "Thinking...",
      placeholder: "Ask about percentages, logic, English, or study plans...",
    },
  };

  return copy[language];
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

function getImageOnlyPrompt(language: "EN" | "KZ" | "RU") {
  if (language === "KZ") {
    return "Мына суреттегі тапсырманы оқып, қадам-қадаммен түсіндіріп бер.";
  }

  if (language === "RU") {
    return "Прочитай задание на изображении и объясни решение пошагово.";
  }

  return "Read the task in this image and explain the solution step by step.";
}

function getUploadMessage(language: "EN" | "KZ" | "RU", key: "invalid" | "large" | "ready") {
  const messages = {
    KZ: {
      invalid: "Тек сурет файлын таңда.",
      large: "Сурет тым үлкен. 5 MB-тан кіші сурет таңда.",
      ready: "Сурет дайын. Жіберсең, AI-Sana тапсырманы оқиды.",
    },
    RU: {
      invalid: "Выберите файл изображения.",
      large: "Изображение слишком большое. Выберите файл меньше 5 MB.",
      ready: "Изображение готово. Отправьте, и AI-Sana прочитает задание.",
    },
    EN: {
      invalid: "Choose an image file.",
      large: "The image is too large. Choose an image under 5 MB.",
      ready: "Image ready. Send it, and AI-Sana will read the task.",
    },
  };

  return messages[language][key];
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
