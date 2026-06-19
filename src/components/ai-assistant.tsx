import { useEffect, useRef, useState } from "react";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your AulBridge AI Tutor. Ask me about math, logic, reading, languages, study plans, or NIS/BIL/NSPM exam preparation.",
};

const FRIENDLY_ERROR =
  "I could not answer right now, but do not worry. Please try again in a moment, or ask your teacher if it is urgent.";
const CONFIG_ERROR =
  "AI Tutor is connected to the app, but the Google AI key is not added yet. Add GOOGLE_API_KEY to the server .env file and restart the app.";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedInput }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

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
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? FRIENDLY_ERROR },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: FRIENDLY_ERROR }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        aria-label="Open AI Tutor"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-lg hover:shadow-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center btn-squish border border-secondary"
        onClick={() => setIsOpen(true)}
      >
        <span className="material-symbols-outlined text-2xl">smart_toy</span>
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[85vh] max-h-[85vh] overflow-hidden">
          <DrawerHeader className="shrink-0 border-b border-outline-variant py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary text-on-secondary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">smart_toy</span>
              </div>
              <div>
                <DrawerTitle className="font-headline-md text-headline-md">
                  AulBridge AI Tutor
                </DrawerTitle>
                <p className="text-xs text-on-surface-variant">
                  Step-by-step help for exams and study plans
                </p>
              </div>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 bg-background">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[min(88vw,760px)] rounded-2xl px-4 py-3 font-body-md text-body-md ${
                    msg.role === "user"
                      ? "bg-secondary text-on-secondary"
                      : "bg-surface-container-high text-on-surface border border-outline-variant"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
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
            className="shrink-0 border-t border-outline-variant bg-surface px-4 py-4 flex gap-2"
            onSubmit={handleSendMessage}
          >
            <input
              className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about percentages, logic, English, or study plans..."
              type="text"
              value={input}
            />
            <button
              aria-label="Send message"
              className="w-10 h-10 bg-secondary text-on-secondary rounded-full hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed btn-squish border border-secondary"
              disabled={isLoading || !input.trim()}
              type="submit"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
