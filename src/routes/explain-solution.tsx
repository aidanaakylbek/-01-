import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";

import aiSanaHero from "@/assets/ai-sana-hero.jpg";
import { AibiMark } from "@/components/aibi-mark";
import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import { ReadableMathText } from "@/components/readable-math-text";
import { useLanguage } from "@/hooks/use-language";
import { getAccountDashboard } from "@/lib/api/account.functions";
import type { AITutorMessage } from "@/lib/account-store.server";

export const Route = createFileRoute("/explain-solution")({
  head: () => ({ meta: [{ title: "AI Tutor — AI-Sana" }] }),
  component: AITutorPage,
});

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type TutorContext = {
  currentQuestion?: string;
  diagnosticResult?: string;
  examType: string;
  mode: "diagnostic" | "lesson" | "practice" | "general";
  previousMistakes: string[];
  topic: string;
  weakTopic: string;
};

function AITutorPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Сұрағыңды жаз, мен сабақ бойынша түсіндіремін. Қате сұрақ, формула, тест немесе ұқсас есеп бойынша көмектесе аламын.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tutorContext, setTutorContext] = useState<TutorContext>({
    examType: "NIS / BIL / RFMS",
    mode: "lesson",
    previousMistakes: [],
    topic: "",
    weakTopic: "",
  });
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const copy = language === "RU"
    ? {
        title: "AI-Sana Tutor",
        subtitle: "Напиши вопрос по уроку, тесту или ошибке.",
        bubble: "Задай вопрос, я объясню по шагам.",
        input: "Напиши вопрос по уроку...",
        send: "Отправить",
        thinking: "AI-Sana думает...",
        empty: "Сначала напиши вопрос.",
        currentTopic: "Текущая тема",
        topicValue: "Проценты и логика",
        weak: "Слабые темы",
        practice: "Сегодня повтори 5 вопросов по процентам.",
        goal: "Сегодняшняя цель: 3 урока",
        clear: "Очистить чат",
      }
    : {
        title: "AI-Sana Tutor",
        subtitle: "Сабақ, тест немесе қате сұрағыңды жаз.",
        bubble: "Сұрағыңды жаз, мен сабақ бойынша түсіндіремін.",
        input: "Сабақ бойынша сұрағыңды жаз...",
        send: "Жіберу",
        thinking: "AI-Sana ойланып жатыр...",
        empty: "Алдымен сұрағыңды жаз.",
        currentTopic: "Қазіргі тақырып",
        topicValue: "Пайыздар және логика",
        weak: "Әлсіз тақырыптар",
        practice: "Бүгін пайыздардан 5 сұрақ қайтала.",
        goal: "Бүгінгі мақсат: 3 сабақ",
        clear: "Чатты тазалау",
      };

  useEffect(() => {
    let mounted = true;

    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    const mode = params.get("mode");
    const question = params.get("question");
    const diagnosticResult = params.get("diagnosticResult");

    setTutorContext((current) => ({
      ...current,
      currentQuestion: question ?? undefined,
      diagnosticResult: diagnosticResult ?? undefined,
      mode:
        mode === "diagnostic" || mode === "practice" || mode === "general" || mode === "lesson"
          ? mode
          : current.mode,
      topic: topic ?? current.topic,
      weakTopic: topic ?? current.weakTopic,
    }));

    void getAccountDashboard().then((dashboard) => {
      if (!mounted) return;

      const history = dashboard.aiTutorMessages
        .slice(-20)
        .map((message: AITutorMessage) => ({
          id: message.id,
          role: message.role,
          content: message.message,
        }));

      if (history.length > 0) {
        setMessages(history);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) {
      setError(copy.empty);
      return;
    }

    if (loading) return;

    setError("");
    setInput("");
    setLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: tutorContext,
          message: trimmed,
          messages: messages.slice(-8).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "AI Tutor толық қолдану үшін жазылым қажет.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message ?? "Қазір жауап дайын болмады.",
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Қазір AI-Sana жауап бере алмады. Біраздан кейін қайта көріңіз.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
      <GameLayout
        right={
          <TutorSidebar
            copy={copy}
            topic={tutorContext.topic}
          />
        }
      >
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[34px] border-2 border-[#DDD6FE] bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#8B5CF6] p-5 text-white shadow-[0_12px_0_rgba(30,27,75,0.22)] md:p-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#FACC15]">AI-Sana Tutor</p>
              <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">{copy.title}</h1>
              <p className="mt-3 max-w-2xl text-lg font-bold text-[#EDE9FE]">{copy.subtitle}</p>
              <div className="mt-5 inline-flex max-w-xl items-start gap-3 rounded-[24px] border-2 border-white/25 bg-white/15 px-4 py-3 font-bold text-white shadow-[0_6px_0_rgba(30,27,75,0.22)] backdrop-blur">
                <span className="material-symbols-outlined text-[#FACC15]">chat_bubble</span>
                {copy.bubble} 💜
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[240px]">
              <div className="absolute inset-0 rounded-full bg-[#C084FC]/40 blur-2xl" />
              <div className="relative rounded-[34px] border-4 border-white/40 bg-white p-3 shadow-[0_10px_0_rgba(30,27,75,0.25)]">
                <img className="h-56 w-full rounded-[26px] object-cover object-top" src={aiSanaHero} alt="AI-Sana tutor" />
                <div className="absolute -left-5 top-6 rounded-2xl bg-[#FACC15] px-3 py-2 text-sm font-black text-[#1E1B4B] shadow-[0_5px_0_#CA8A04]">
                  AI-Sana
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <GameCard className="flex min-h-[620px] flex-col bg-white/95 p-0">
            <div className="flex items-center justify-between border-b-2 border-[#DDD6FE] p-4">
              <div className="flex items-center gap-3">
                <AibiMark size="md" />
                <div>
                  <h2 className="text-xl font-black text-[#1E1B4B]">AI-Sana</h2>
                  <p className="text-sm font-bold text-[#6B5E8F]">
                    {language === "RU" ? "Объясняет просто, по шагам и с примерами." : "Қарапайым тілмен, қадамдап және мысалмен түсіндіреді."}
                  </p>
                </div>
              </div>
              <button
                className="rounded-2xl border-2 border-[#DDD6FE] px-3 py-2 text-sm font-black text-[#6D28D9]"
                type="button"
                onClick={() => setMessages([])}
              >
                {copy.clear}
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#FAF7FF] p-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {loading ? (
                <div className="max-w-[82%] rounded-[24px] border-2 border-[#DDD6FE] bg-[#EDE9FE] px-4 py-3 font-bold text-[#4C1D95]">
                  {copy.thinking}
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t-2 border-[#DDD6FE] bg-white p-4">
              <form className="flex gap-2" onSubmit={handleSubmit}>
                <input
                  className="min-h-14 flex-1 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 font-semibold text-[#1E1B4B] outline-none transition focus:border-[#8B5CF6]"
                  value={input}
                  disabled={loading}
                  placeholder={copy.input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <button
                  className="min-h-14 rounded-2xl bg-[#6D28D9] px-5 font-black text-white shadow-[0_6px_0_#4C1D95] transition hover:-translate-y-0.5 disabled:opacity-50"
                  disabled={loading}
                  type="submit"
                >
                  {copy.send}
                </button>
              </form>
              {error ? <p className="mt-3 text-sm font-bold text-[#EF4444]">{error}</p> : null}
            </div>
          </GameCard>

        </div>
      </div>
    </GameLayout>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[84%] rounded-[26px] border-2 px-4 py-3 text-base font-semibold leading-relaxed shadow-[0_5px_0_rgba(109,40,217,0.10)] ${
          isUser
            ? "border-[#6D28D9] bg-[#6D28D9] text-white"
            : "border-[#DDD6FE] bg-[#EDE9FE] text-[#1E1B4B]"
        }`}
      >
        <ReadableMathText text={message.content} />
      </div>
    </div>
  );
}

function TutorSidebar({
  copy,
  topic,
}: {
  copy: Record<string, string>;
  topic: string;
}) {
  return (
    <div className="space-y-5">
      <GameCard className="bg-white/95">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">{copy.currentTopic}</p>
        <h2 className="mt-2 text-2xl font-black text-[#1E1B4B]">{topic || "Сұрақ немесе тақырып таңда"}</h2>
        <div className="mt-4 rounded-3xl bg-[#F5F3FF] p-4">
          <p className="font-black text-[#6D28D9]">AI-Sana</p>
          <p className="mt-1 font-semibold text-[#6B5E8F]">Қатеңді қадамдап түсіндіреді, формуланы көрсетеді және ұқсас сұрақ береді.</p>
        </div>
      </GameCard>

      <GameCard className="bg-white/95">
        <h2 className="text-2xl font-black text-[#1E1B4B]">{copy.weak}</h2>
        <p className="mt-4 rounded-3xl bg-[#F5F3FF] p-4 font-black text-[#6B5E8F]">
          Әлсіз тақырыптар диагностика және сабақ нәтижелерінен кейін анықталады.
        </p>
      </GameCard>

      <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FACC15]">Suggested practice</p>
        <h2 className="mt-2 text-2xl font-black">{copy.practice}</h2>
        <p className="mt-3 font-bold text-[#EDE9FE]">{copy.goal}</p>
      </GameCard>

    </div>
  );
}

function WeakTopic({ percent, title }: { percent: number; title: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 font-black text-[#1E1B4B]">
        <span>{title}</span>
        <span className="text-[#EF4444]">{percent}%</span>
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}
