import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import {
  VocabularyEmptyState,
  VocabularyAIPanel,
  VocabularyFlashcard,
  VocabularyTabs,
  VocabularyWordList,
  useFilteredVocabulary,
  vocabularyCopy,
} from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import {
  getVocabularyTopicFn,
  getVocabularyAIResponseFn,
  saveVocabularyProgressFn,
  toggleVocabularyFavoriteFn,
} from "@/lib/api/vocabulary.functions";
import type { VocabularyAIResponse, VocabularyLanguage, VocabularyPartOfSpeech } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary/$topicSlug")({
  loader: async ({ params }) => {
    const topic = await getVocabularyTopicFn({ data: { slug: params.topicSlug } });
    if (!topic) throw notFound();
    return topic;
  },
  head: () => ({ meta: [{ title: "Vocabulary Topic — AI-Sana" }] }),
  component: VocabularyTopicPage,
});

function VocabularyTopicPage() {
  const initialTopic = Route.useLoaderData();
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const c = vocabularyCopy[lang];
  const [topic, setTopic] = useState(initialTopic);
  const [activePart, setActivePart] = useState<VocabularyPartOfSpeech>("verb");
  const [cardIndexByPart, setCardIndexByPart] = useState<Record<VocabularyPartOfSpeech, number>>({
    verb: 0,
    adjective: 0,
    noun: 0,
  });
  const [mode, setMode] = useState<"flashcards" | "list">("flashcards");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<VocabularyAIResponse | undefined>();

  const title = lang === "RU" ? topic.title_ru : lang === "EN" ? topic.title_en : topic.title_kk;
  const description = lang === "RU" ? topic.description_ru : lang === "EN" ? topic.description_en : topic.description_kk;
  const activeWords = topic.sections[activePart];
  const activeIndex = Math.min(cardIndexByPart[activePart], Math.max(0, activeWords.length - 1));
  const activeWord = activeWords[activeIndex];
  const filteredWords = useFilteredVocabulary(topic.words, query, mode === "list" ? activePart : "all");
  const counts = useMemo(
    () => ({
      verb: topic.counts.verbs,
      adjective: topic.counts.adjectives,
      noun: topic.counts.nouns,
    }),
    [topic.counts],
  );

  const reload = async () => {
    const fresh = await getVocabularyTopicFn({ data: { slug: topic.slug } });
    if (fresh) setTopic(fresh);
  };

  const moveNext = () => {
    setCardIndexByPart((value) => ({
      ...value,
      [activePart]: Math.min(activeIndex + 1, activeWords.length - 1),
    }));
  };

  const save = async (action: "known" | "review") => {
    if (!activeWord) return;
    setSaving(true);
    try {
      await saveVocabularyProgressFn({ data: { wordId: activeWord.id, action } });
      await reload();
      moveNext();
    } finally {
      setSaving(false);
    }
  };

  const favorite = async (wordId: string) => {
    await toggleVocabularyFavoriteFn({ data: { wordId } });
    await reload();
  };

  const askAI = async (message: string) => {
    setAiLoading(true);
    try {
      setAiResponse(
        await getVocabularyAIResponseFn({
          data: {
            message,
            topicSlug: topic.slug,
            wordId: activeWord?.id,
            partOfSpeech: activePart,
            mentorStyle: "friendly",
          },
        }),
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <Link to="/vocabulary" className="font-black text-[#FACC15]">← Сөздікке қайту</Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">English Vocabulary</p>
              <h1 className="mt-3 text-5xl font-black">{title}</h1>
              <p className="mt-3 max-w-2xl text-lg font-semibold text-[#EDE9FE]">{description}</p>
            </div>
            <div className="rounded-[26px] bg-white/15 p-5">
              <p className="font-black">{topic.progress.totalKnown} / 45 сөз</p>
              <ProgressBar value={topic.progress.completionPercentage} />
              <p className="mt-2 font-black text-[#FACC15]">{topic.progress.completionPercentage}%</p>
            </div>
          </div>
        </GameCard>

        <VocabularyTabs active={activePart} counts={counts} language={lang} onChange={setActivePart} />

        <GameCard className="bg-white/95">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex rounded-[22px] border-2 border-[#DDD6FE] bg-[#F5F3FF] p-1">
              <button
                type="button"
                className={`rounded-2xl px-4 py-2 font-black ${mode === "flashcards" ? "bg-[#6D28D9] text-white" : "text-[#6B5E8F]"}`}
                onClick={() => setMode("flashcards")}
              >
                {c.flashcards}
              </button>
              <button
                type="button"
                className={`rounded-2xl px-4 py-2 font-black ${mode === "list" ? "bg-[#6D28D9] text-white" : "text-[#6B5E8F]"}`}
                onClick={() => setMode("list")}
              >
                {c.list}
              </button>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={c.search}
              className="rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 font-bold outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/vocabulary/$topicSlug/test/$partOfSpeech"
              params={{ topicSlug: topic.slug, partOfSpeech: activePart }}
              className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
            >
              {partLabel(activePart, lang)} тесті
            </Link>
            <Link
              to="/vocabulary/$topicSlug/final-test"
              params={{ topicSlug: topic.slug }}
              className="rounded-2xl bg-[#FACC15] px-5 py-3 font-black text-[#1E1B4B] shadow-[0_5px_0_#D97706]"
            >
              Mixed Topic Test
            </Link>
            <Link to="/vocabulary/games" className="rounded-2xl border-2 border-[#DDD6FE] px-5 py-3 font-black text-[#6D28D9]">
              Ойындар
            </Link>
          </div>
        </GameCard>

        {mode === "flashcards" ? (
          activeWord ? (
            <VocabularyFlashcard
              language={lang}
              word={activeWord}
              index={activeIndex}
              total={activeWords.length}
              saving={saving}
              onKnown={() => void save("known")}
              onReview={() => void save("review")}
              onFavorite={() => void favorite(activeWord.id)}
            />
          ) : (
            <VocabularyEmptyState text={c.noTopics} icon="style" />
          )
        ) : filteredWords.length ? (
          <VocabularyWordList words={filteredWords} onFavorite={(wordId) => void favorite(wordId)} />
        ) : (
          <VocabularyEmptyState text={c.noSearch} icon="search_off" />
        )}

        <VocabularyAIPanel response={aiResponse} loading={aiLoading} onAsk={(message) => void askAI(message)} />
      </div>
    </GameLayout>
  );
}

function partLabel(part: VocabularyPartOfSpeech, language: VocabularyLanguage) {
  const labels = {
    verb: { KZ: "Етістіктер", RU: "Глаголы", EN: "Verbs" },
    adjective: { KZ: "Сын есімдер", RU: "Прилагательные", EN: "Adjectives" },
    noun: { KZ: "Зат есімдер", RU: "Существительные", EN: "Nouns" },
  } satisfies Record<VocabularyPartOfSpeech, Record<VocabularyLanguage, string>>;
  return labels[part][language];
}
