import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import {
  createAdminVocabularyTopicFn,
  getAdminVocabularyTopicsFn,
  saveAdminVocabularyWordFn,
} from "@/lib/api/vocabulary.functions";
import type { VocabularyPartOfSpeech, VocabularyWordDifficulty } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/admin/vocabulary")({
  loader: async () => getAdminVocabularyTopicsFn(),
  head: () => ({ meta: [{ title: "Admin Vocabulary — AI-Sana" }] }),
  component: AdminVocabularyPage,
});

function AdminVocabularyPage() {
  const initialTopics = Route.useLoaderData();
  const [topics, setTopics] = useState(initialTopics);
  const [status, setStatus] = useState("");
  const family = topics[0];

  const refresh = async () => setTopics(await getAdminVocabularyTopicsFn());

  const createTopic = async () => {
    setStatus("Creating topic...");
    try {
      await createAdminVocabularyTopicFn({
        data: {
          slug: "school",
          title_en: "School",
          title_kk: "Мектеп",
          title_ru: "Школа",
          difficulty: "mixed",
        },
      });
      await refresh();
      setStatus("Topic created");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create topic");
    }
  };

  const addSampleWord = async () => {
    if (!family) return;
    setStatus("Saving word...");
    try {
      await saveAdminVocabularyWordFn({
        data: {
          topic_id: family.id,
          word_en: "sample",
          translation_kk: "үлгі",
          translation_ru: "пример",
          part_of_speech: "noun" as VocabularyPartOfSpeech,
          pronunciation: "/sample/",
          difficulty: "beginner" as VocabularyWordDifficulty,
          example_en: "This is a sample word.",
          example_kk: "Бұл үлгі сөз.",
          example_ru: "Это пример слова.",
          order_index: 15,
          is_active: true,
        },
      });
      await refresh();
      setStatus("Word saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save word");
    }
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">Admin</p>
          <h1 className="mt-2 text-5xl font-black">Vocabulary management</h1>
          <p className="mt-3 max-w-2xl font-semibold text-[#EDE9FE]">
            Topics can be published only with exactly 15 verbs, 15 adjectives and 15 nouns.
          </p>
        </GameCard>

        <GameCard className="bg-white/95">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Topics</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void createTopic()}
                className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
              >
                Create topic
              </button>
              <button
                type="button"
                onClick={() => void addSampleWord()}
                className="rounded-2xl border-2 border-[#DDD6FE] px-5 py-3 font-black text-[#6D28D9]"
              >
                Test validation
              </button>
            </div>
          </div>
          {status ? <p className="mt-3 font-black text-[#8B5CF6]">{status}</p> : null}
        </GameCard>

        <div className="grid gap-5">
          {topics.map((topic) => (
            <GameCard key={topic.id} className="bg-white/95">
              <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                    {topic.slug} · {topic.difficulty}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{topic.title_en}</h2>
                  <p className="mt-2 font-bold text-[#6B5E8F]">
                    {topic.is_published ? "Published" : "Draft"} · Total {topic.counts.total} / 45
                  </p>
                  <ProgressBar value={Math.round((topic.counts.total / 45) * 100)} />
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Counter label="Verbs" value={topic.counts.verbs} />
                    <Counter label="Adjectives" value={topic.counts.adjectives} />
                    <Counter label="Nouns" value={topic.counts.nouns} />
                  </div>
                </div>
                <div className="rounded-3xl bg-[#F5F3FF] p-5">
                  <p className={`font-black ${topic.validation.canPublish ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {topic.validation.canPublish ? "Ready to publish" : "Publication blocked"}
                  </p>
                  <div className="mt-3 space-y-2 text-sm font-bold text-[#6B5E8F]">
                    {topic.validation.errors.length ? (
                      topic.validation.errors.map((error) => <p key={error}>• {error}</p>)
                    ) : (
                      <p>All required groups contain exactly 15 words.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!topic.validation.canPublish}
                    className="mt-5 w-full rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95] disabled:opacity-50"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </GameCard>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  const good = value === 15;
  return (
    <div className={`rounded-3xl border-2 p-4 ${good ? "border-[#22C55E] bg-[#DCFCE7]" : "border-[#DDD6FE] bg-white"}`}>
      <p className="font-black text-[#6B5E8F]">{label}</p>
      <p className="mt-1 text-3xl font-black">{value} / 15</p>
    </div>
  );
}
