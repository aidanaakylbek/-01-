import { createFileRoute, Link } from "@tanstack/react-router";

import { GameCard, GameLayout, ProgressBar } from "@/components/gamified-platform";
import {
  VocabularyLearningPath,
  VocabularyEmptyState,
  vocabularyCopy,
} from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import { getVocabularyOverviewFn } from "@/lib/api/vocabulary.functions";
import type { VocabularyLanguage, VocabularyPartOfSpeech, VocabularyTopicSummary } from "@/lib/vocabulary.server";

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
  const overview = loaderData;
  const dailyLearned = overview.dailyGoal.learnedToday + overview.dailyGoal.reviewedToday;
  const currentTopic = findCurrentTopic(overview.topics);
  const currentStage = currentTopic ? getCurrentStage(currentTopic, lang) : null;
  const currentTitle = currentTopic ? getTopicTitle(currentTopic, lang) : c.noTopics;

  return (
    <GameLayout>
      <div className="space-y-4">
        <section className="rounded-[32px] border-2 border-[#DDD6FE] bg-white/95 p-5 shadow-[0_8px_0_rgba(109,40,217,0.12)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8B5CF6]">Vocabulary Journey</p>
              <h1 className="mt-2 text-3xl font-black text-[#1E1B4B] md:text-4xl">{lang === "RU" ? "Путь словаря" : "Сөздік жолы"}</h1>
              <p className="mt-2 max-w-2xl font-bold text-[#6B5E8F]">
                {lang === "RU"
                  ? "Проходи темы по очереди и открывай новые английские слова."
                  : "Тақырыптарды бір-бірден аяқтап, жаңа ағылшын сөздерін аш."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CompactStat label="🔥" value={`${overview.stats.streak || 0} ${lang === "RU" ? "дней" : "күн"}`} />
              <CompactStat label="📚" value={`${overview.stats.totalLearned} ${lang === "RU" ? "слов" : "сөз"}`} />
              <CompactStat label="⭐" value={`${overview.stats.xpEarned} XP`} />
              <CompactStat label="🎯" value={`${dailyLearned}/${overview.dailyGoal.target}`} />
            </div>
          </div>
        </section>

        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FACC15]">
                {lang === "RU" ? "Продолжить обучение" : "Оқуды жалғастыру"}
              </p>
              <h2 className="mt-2 text-3xl font-black">{currentTitle}</h2>
              {currentTopic && currentStage ? (
                <div className="mt-3 max-w-xl">
                  <div className="flex items-center justify-between font-black">
                    <span>{currentTopic.progress.totalKnown} / {currentTopic.counts.total || 45} {lang === "RU" ? "слов" : "сөз"}</span>
                    <span>{currentTopic.progress.completionPercentage}%</span>
                  </div>
                  <ProgressBar value={currentTopic.progress.completionPercentage} />
                  <p className="mt-3 font-bold text-[#EDE9FE]">
                    {lang === "RU" ? "Текущий раздел:" : "Қазіргі бөлім:"} {currentStage.label} · {currentStage.known} / 15
                  </p>
                </div>
              ) : (
                <p className="mt-3 font-bold text-[#EDE9FE]">{c.noTopics}</p>
              )}
            </div>
            {currentTopic ? (
              <Link
                to="/vocabulary/$topicSlug"
                params={{ topicSlug: currentTopic.slug }}
                className="inline-flex justify-center rounded-[22px] bg-[#FACC15] px-7 py-4 text-center font-black text-[#1E1B4B] shadow-[0_7px_0_#D97706] transition hover:-translate-y-0.5"
              >
                {currentTopic.progress.state === "available" ? (lang === "RU" ? "Начать обучение" : "Оқуды бастау") : c.continue}
              </Link>
            ) : null}
          </div>
        </GameCard>

        <div className="flex flex-wrap gap-3">
          <Link to="/vocabulary/review/personalized" className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-3 font-black text-[#6D28D9]">
            {c.reviewSession}
          </Link>
          <Link to="/vocabulary/games" className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-3 font-black text-[#6D28D9]">
            {c.games}
          </Link>
          <Link to="/vocabulary/weak-words" className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-3 font-black text-[#6D28D9]">
            {c.weakWords}
          </Link>
        </div>

        {overview.topics.length ? (
          <VocabularyLearningPath language={lang} topics={overview.topics} />
        ) : (
          <VocabularyEmptyState text={c.noTopics} icon="auto_stories" />
        )}
      </div>
    </GameLayout>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border-2 border-[#DDD6FE] bg-[#F5F3FF] px-4 py-2 font-black text-[#1E1B4B]">
      {label} {value}
    </span>
  );
}

function findCurrentTopic(topics: VocabularyTopicSummary[]) {
  return topics.find((topic) => topic.progress.state === "needs_review")
    ?? topics.find((topic) => topic.progress.state === "in_progress")
    ?? topics.find((topic) => topic.progress.state === "available")
    ?? topics.find((topic) => topic.progress.state === "completed")
    ?? topics[0];
}

function getTopicTitle(topic: VocabularyTopicSummary, language: VocabularyLanguage) {
  return language === "RU" ? topic.title_ru : language === "EN" ? topic.title_en : topic.title_kk;
}

function getCurrentStage(topic: VocabularyTopicSummary, language: VocabularyLanguage) {
  const stages: Array<{ part: VocabularyPartOfSpeech; label: string; known: number; passed: boolean }> = [
    { part: "verb", label: language === "RU" ? "Глаголы" : language === "EN" ? "Verbs" : "Етістіктер", known: topic.progress.knownVerbs, passed: topic.progress.tests.verbsPassed },
    { part: "adjective", label: language === "RU" ? "Прилагательные" : language === "EN" ? "Adjectives" : "Сын есімдер", known: topic.progress.knownAdjectives, passed: topic.progress.tests.adjectivesPassed },
    { part: "noun", label: language === "RU" ? "Существительные" : language === "EN" ? "Nouns" : "Зат есімдер", known: topic.progress.knownNouns, passed: topic.progress.tests.nounsPassed },
  ];
  return stages.find((stage) => stage.known < 15 || !stage.passed)
    ?? { part: "noun" as const, label: language === "RU" ? "Итоговый тест" : language === "EN" ? "Mixed test" : "Қорытынды тест", known: 15, passed: topic.progress.tests.mixedPassed };
}
