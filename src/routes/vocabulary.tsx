import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import {
  DailyGoalCard,
  DailyWordCard,
  VocabularyEmptyState,
  VocabularyHero,
  VocabularyTopicCard,
  vocabularyCopy,
} from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import {
  getVocabularyOverviewFn,
  toggleVocabularyFavoriteFn,
} from "@/lib/api/vocabulary.functions";
import type { VocabularyLanguage } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary")({
  loader: async () => getVocabularyOverviewFn(),
  head: () => ({
    meta: [
      { title: "Vocabulary — AI-Sana" },
      { name: "description", content: "AI-Sana English vocabulary flashcards." },
    ],
  }),
  component: VocabularyPage,
});

function VocabularyPage() {
  const loaderData = Route.useLoaderData();
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const c = vocabularyCopy[lang];
  const [overview, setOverview] = useState(loaderData);
  const dailyLearned = overview.dailyGoal.learnedToday + overview.dailyGoal.reviewedToday;

  const favorite = async (wordId: string) => {
    await toggleVocabularyFavoriteFn({ data: { wordId } });
    setOverview(await getVocabularyOverviewFn());
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <VocabularyHero
          language={lang}
          stats={{
            streak: overview.stats.streak,
            totalLearned: overview.stats.totalLearned,
            xpEarned: overview.stats.xpEarned,
            daily: `${dailyLearned}/${overview.dailyGoal.target}`,
          }}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <DailyWordCard language={lang} word={overview.dailyWord} onFavorite={favorite} />
          <div className="space-y-5">
            <DailyGoalCard
              language={lang}
              learned={dailyLearned}
              target={overview.dailyGoal.target}
              completed={overview.dailyGoal.completed}
              xp={overview.dailyGoal.xpEarned}
            />
            <GameCard className="bg-white/95">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">{c.review}</p>
              {overview.reviewCount > 0 ? (
                <p className="mt-3 text-3xl font-black">{overview.reviewCount} сөз</p>
              ) : (
                <p className="mt-3 font-bold text-[#6B5E8F]">{c.noReview}</p>
              )}
            </GameCard>
          </div>
        </section>

        <GameCard className="bg-white/95">
          <div className="grid gap-4 md:grid-cols-4">
            <VocabularyMetric title="🔥 Streak" value={`${overview.stats.streak}`} />
            <VocabularyMetric title="📚 Learned" value={`${overview.stats.totalLearned}`} />
            <VocabularyMetric title="⭐ XP" value={`${overview.stats.xpEarned}`} />
            <VocabularyMetric title="★ Favorites" value={`${overview.stats.favorites}`} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/vocabulary/games" className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]">
              {c.games}
            </Link>
            <Link to="/vocabulary/weak-words" className="rounded-2xl border-2 border-[#DDD6FE] px-5 py-3 font-black text-[#6D28D9]">
              {c.weakWords}
            </Link>
            <Link
              to="/vocabulary/review/personalized"
              className="rounded-2xl border-2 border-[#DDD6FE] px-5 py-3 font-black text-[#6D28D9]"
            >
              {c.reviewSession}
            </Link>
          </div>
        </GameCard>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">{c.featured}</p>
              <h2 className="text-3xl font-black">{c.allTopics}</h2>
            </div>
          </div>
          {overview.topics.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {overview.topics.map((topic) => (
                <VocabularyTopicCard key={topic.id} language={lang} topic={topic} />
              ))}
            </div>
          ) : (
            <VocabularyEmptyState text={c.noTopics} icon="auto_stories" />
          )}
        </section>
      </div>
    </GameLayout>
  );
}

function VocabularyMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F3FF] p-4">
      <p className="font-black text-[#6B5E8F]">{title}</p>
      <p className="mt-2 text-3xl font-black text-[#6D28D9]">{value}</p>
      <ProgressBar value={Number(value) > 0 ? 100 : 0} />
    </div>
  );
}
