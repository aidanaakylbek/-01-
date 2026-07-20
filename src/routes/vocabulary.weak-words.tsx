import { createFileRoute, Link } from "@tanstack/react-router";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { WeakWordsList, vocabularyCopy } from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import { getVocabularyWeakWordsFn } from "@/lib/api/vocabulary.functions";
import type { VocabularyLanguage } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary/weak-words")({
  loader: async () => getVocabularyWeakWordsFn(),
  head: () => ({ meta: [{ title: "Weak Words — AI-Sana" }] }),
  component: WeakWordsPage,
});

function WeakWordsPage() {
  const words = Route.useLoaderData();
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const c = vocabularyCopy[lang];
  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <Link to="/vocabulary" className="font-black text-[#FACC15]">← Сөздік</Link>
          <h1 className="mt-4 text-5xl font-black">{c.weakWords}</h1>
          <p className="mt-2 font-bold text-[#EDE9FE]">Қосымша қайталау керек сөздер осында жиналады.</p>
        </GameCard>
        <WeakWordsList words={words} language={lang} />
      </div>
    </GameLayout>
  );
}
