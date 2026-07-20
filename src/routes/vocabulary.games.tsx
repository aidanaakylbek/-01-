import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { VocabularyGamesGrid } from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import {
  completeVocabularyGameFn,
  getVocabularyGamesConfigFn,
  startVocabularyGameFn,
} from "@/lib/api/vocabulary.functions";
import type { VocabularyGameSession, VocabularyGameType, VocabularyLanguage } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary/games")({
  validateSearch: (search: Record<string, unknown>) => ({
    topic: typeof search.topic === "string" && search.topic.trim() ? search.topic : "greetings-polite-words",
  }),
  loader: async ({ location }) => {
    const search = location.search as { topic?: string };
    return getVocabularyGamesConfigFn({ data: { topicSlug: search.topic ?? "greetings-polite-words" } });
  },
  head: () => ({ meta: [{ title: "Vocabulary Games — AI-Sana" }] }),
  component: VocabularyGamesPage,
});

function VocabularyGamesPage() {
  const games = Route.useLoaderData();
  const { topic } = Route.useSearch();
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const [activeSession, setActiveSession] = useState<VocabularyGameSession | undefined>();

  const start = async (gameType: VocabularyGameType) => {
    setActiveSession(await startVocabularyGameFn({ data: { gameType, topicSlug: topic, mode: "normal" } }));
  };

  const complete = async (session: VocabularyGameSession) => {
    setActiveSession(await completeVocabularyGameFn({
      data: {
        sessionId: session.id,
        correctItems: session.totalItems,
        incorrectItems: 0,
        hintsUsed: 0,
      },
    }));
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">AI-Sana Games</p>
          <h1 className="mt-3 text-5xl font-black">Vocabulary Games</h1>
          <p className="mt-2 font-bold text-[#EDE9FE]">Сөздерді ойын арқылы қайтала және XP жина.</p>
        </GameCard>
        <VocabularyGamesGrid language={lang} games={games} activeSession={activeSession} onStart={start} onComplete={complete} />
      </div>
    </GameLayout>
  );
}
