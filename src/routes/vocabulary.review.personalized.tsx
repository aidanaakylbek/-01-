import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { VocabularyAudioButton, vocabularyCopy } from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import { startPersonalizedVocabularyReviewFn } from "@/lib/api/vocabulary.functions";
import type { VocabularyLanguage, VocabularyWordWithState } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary/review/personalized")({
  loader: async () => startPersonalizedVocabularyReviewFn({ data: { size: 10 } }),
  head: () => ({ meta: [{ title: "Personalized Review — AI-Sana" }] }),
  component: PersonalizedReviewPage,
});

function PersonalizedReviewPage() {
  const initial = Route.useLoaderData();
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const c = vocabularyCopy[lang];
  const [words] = useState<VocabularyWordWithState[]>(initial.words);

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <Link to="/vocabulary" className="font-black text-[#FACC15]">← Сөздік</Link>
          <h1 className="mt-4 text-5xl font-black">{c.reviewSession}</h1>
          <p className="mt-2 font-bold text-[#EDE9FE]">
            {initial.plan.weak} қиын сөз · {initial.plan.review} қайталау сөзі
          </p>
        </GameCard>
        <div className="grid gap-4 md:grid-cols-2">
          {words.map((word) => (
            <GameCard key={word.id} className="bg-white/95">
              <h2 className="text-3xl font-black text-[#1E1B4B]">{word.word_en}</h2>
              <p className="mt-1 font-bold text-[#6B5E8F]">{word.translation_kk} · {word.translation_ru}</p>
              <p className="mt-3 rounded-3xl bg-[#F5F3FF] p-4 font-bold">{word.example_en}</p>
              <div className="mt-4">
                <VocabularyAudioButton word={word.word_en} audioUrl={word.audio_url} />
              </div>
            </GameCard>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
