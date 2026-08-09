import { createFileRoute, Link, Outlet, notFound, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import {
  VocabularyEmptyState,
  VocabularyAIPanel,
  VocabularyFlashcard,
  VocabularyTabs,
  partLabels,
  vocabularyCopy,
} from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import { useDocumentTitle } from "@/hooks/use-document-title";
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
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title_kk ?? "Тақырып"} — AI-Sana` }],
  }),
  component: VocabularyTopicPage,
});

function VocabularyTopicPage() {
  const initialTopic = Route.useLoaderData();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const c = vocabularyCopy[lang];
  const [topic, setTopic] = useState(initialTopic);
  const [activePart, setActivePart] = useState<VocabularyPartOfSpeech>(() =>
    getInitialPart(initialTopic.categories, initialTopic.progress),
  );
  const [cardIndexByPart, setCardIndexByPart] = useState<Partial<Record<VocabularyPartOfSpeech, number>>>({});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<VocabularyAIResponse | undefined>();

  const title = lang === "RU" ? topic.title_ru : lang === "EN" ? topic.title_en : topic.title_kk;
  useDocumentTitle(`${title} — AI-Sana`);
  const description = lang === "RU" ? topic.description_ru : lang === "EN" ? topic.description_en : topic.description_kk;
  const activeWords = topic.sections[activePart] ?? [];
  const activeIndex = Math.min(cardIndexByPart[activePart] ?? 0, Math.max(0, activeWords.length - 1));
  const activeWord = activeWords[activeIndex];
  const counts = topic.counts.byCategory;
  const sectionKnown = topic.progress.knownByCategory;
  const topicTotalWords = topic.categories.length * 15;
  if (pathname !== `/vocabulary/${topic.slug}`) {
    return <Outlet />;
  }

  const reload = async () => {
    const fresh = await getVocabularyTopicFn({ data: { slug: topic.slug } });
    if (fresh) setTopic(fresh);
  };

  const moveNext = () => {
    setCardIndexByPart((value) => ({
      ...value,
      [activePart]: activeIndex + 1 >= activeWords.length ? 0 : activeIndex + 1,
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
              <p className="font-black">{topic.progress.totalKnown} / {topicTotalWords} сөз</p>
              <ProgressBar value={topic.progress.completionPercentage} />
              <p className="mt-2 font-black text-[#FACC15]">{topic.progress.completionPercentage}%</p>
            </div>
          </div>
        </GameCard>

        <GameCard className="bg-white/95">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                {lang === "RU" ? "Обзор темы" : lang === "EN" ? "Topic overview" : "Тақырыпқа шолу"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#1E1B4B]">{title}</h2>
              <p className="mt-2 font-bold text-[#6B5E8F]">
                {lang === "RU"
                  ? `Цель: выучить ${topicTotalWords} слов и пройти тесты по разделам.`
                  : `Мақсат: ${topicTotalWords} сөзді үйреніп, бөлім тесттерін тапсыру.`}
              </p>
            </div>
            {(sectionKnown[activePart] ?? 0) >= 15 ? (
              <Link
                to="/vocabulary/$topicSlug/test/$partOfSpeech"
                params={{ topicSlug: topic.slug, partOfSpeech: activePart }}
                className="rounded-2xl bg-[#FACC15] px-5 py-3 text-center font-black text-[#1E1B4B] shadow-[0_5px_0_#D97706]"
              >
                {partLabel(activePart, lang)} тесті
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => document.getElementById("vocabulary-flashcards")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="rounded-2xl bg-[#FACC15] px-5 py-3 text-center font-black text-[#1E1B4B] shadow-[0_5px_0_#D97706]"
              >
                {c.continue}
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {topic.categories.map((category) => (
              <SectionStatus
                key={category}
                label={partLabel(category, lang)}
                known={sectionKnown[category] ?? 0}
                passed={Boolean(topic.progress.tests.passedByCategory[category])}
                active={activePart === category}
              />
            ))}
            <div className={`rounded-3xl border-2 p-4 ${topic.progress.tests.mixedPassed ? "border-[#FACC15] bg-[#FFFBEB]" : "border-[#DDD6FE] bg-[#F5F3FF]"}`}>
              <p className="font-black text-[#1E1B4B]">{lang === "RU" ? "Тест на знание слов" : "Сөзді тексеру тесті"}</p>
              <p className="mt-1 text-sm font-black text-[#6B5E8F]">
                {topic.progress.tests.mixedPassed ? "✓ 80%+" : lang === "RU" ? "Для перехода нужно 80%+" : "Келесі бөлім үшін 80%+"}
              </p>
            </div>
          </div>
          {topic.progress.totalKnown >= topicTotalWords ? (
            <Link
              to="/vocabulary/$topicSlug/final-test"
              params={{ topicSlug: topic.slug }}
              className="mt-5 inline-flex rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
            >
              {lang === "RU" ? "Пройти тест на знание слов" : "Сөзді жаттауды тексеру"}
            </Link>
          ) : (
            <p className="mt-5 rounded-2xl bg-[#F5F3FF] px-5 py-3 font-black text-[#6B5E8F]">
              {lang === "RU"
                ? `Тест откроется после изучения всех ${topicTotalWords} слов.`
                : `Тест барлық ${topicTotalWords} сөз оқылғаннан кейін ашылады.`}
            </p>
          )}
        </GameCard>

        <VocabularyTabs
          active={activePart}
          categories={topic.categories}
          counts={counts}
          language={lang}
          onChange={setActivePart}
        />

        <div id="vocabulary-flashcards">
          {activeWord ? (
            <VocabularyFlashcard
              key={activeWord.id}
              language={lang}
              word={activeWord}
              index={activeIndex}
              total={activeWords.length}
              saving={saving}
              onKnown={() => void save("known")}
              onReview={() => void save("review")}
              onFavorite={() => void favorite(activeWord.id)}
              onAskAI={() => void askAI(`Explain the word "${activeWord.word_en}" with simple examples.`)}
            />
          ) : (
            <VocabularyEmptyState text={c.noTopics} icon="style" />
          )}
        </div>

        <GameCard className="bg-white/95">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B5CF6]">
                {lang === "RU" ? "Проверка темы" : "Тақырыпты тексеру"}
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#1E1B4B]">
                {lang === "RU" ? "Тест на запоминание слов" : "Сөзді жаттауды тексеру"}
              </h2>
              <p className="mt-1 font-bold text-[#6B5E8F]">
                {lang === "RU"
                  ? `Чтобы открыть следующий раздел, изучите ${topicTotalWords} слов и наберите 80% или выше.`
                  : `Келесі бөлімді ашу үшін ${topicTotalWords} сөзді оқып, тесттен 80% немесе одан жоғары нәтиже жина.`}
              </p>
            </div>
            {topic.progress.totalKnown >= topicTotalWords ? (
              <Link
                to="/vocabulary/$topicSlug/final-test"
                params={{ topicSlug: topic.slug }}
                className="rounded-2xl bg-[#6D28D9] px-5 py-3 text-center font-black text-white shadow-[0_5px_0_#4C1D95]"
              >
                {lang === "RU" ? "Начать тест" : "Тестті бастау"}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-2xl bg-[#DDD6FE] px-5 py-3 font-black text-[#6B5E8F]"
              >
                {topic.progress.totalKnown} / {topicTotalWords}
              </button>
            )}
          </div>
        </GameCard>

        <VocabularyAIPanel response={aiResponse} loading={aiLoading} onAsk={(message) => void askAI(message)} />
      </div>
    </GameLayout>
  );
}

function partLabel(part: VocabularyPartOfSpeech, language: VocabularyLanguage) {
  return partLabels[part][language];
}

function getInitialPart(
  categories: VocabularyPartOfSpeech[],
  progress: {
    knownByCategory: Partial<Record<VocabularyPartOfSpeech, number>>;
    tests: { passedByCategory: Partial<Record<VocabularyPartOfSpeech, boolean>> };
  },
): VocabularyPartOfSpeech {
  for (const category of categories) {
    const known = progress.knownByCategory[category] ?? 0;
    if (known < 15 || !progress.tests.passedByCategory[category]) return category;
  }
  return categories[categories.length - 1] ?? "noun";
}

function SectionStatus({ label, known, passed, active }: { label: string; known: number; passed: boolean; active: boolean }) {
  return (
    <div className={`rounded-3xl border-2 p-4 ${active ? "border-[#8B5CF6] bg-[#F5F3FF]" : "border-[#DDD6FE] bg-white"}`}>
      <p className="font-black text-[#1E1B4B]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#6B5E8F]">{known} / 15 {passed ? "✓" : ""}</p>
      <ProgressBar value={Math.round((known / 15) * 100)} />
    </div>
  );
}
