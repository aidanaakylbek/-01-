import { Link } from "@tanstack/react-router";
import { useMemo, useState, type MouseEvent } from "react";

import { GameCard, ProgressBar } from "@/components/gamified-platform";
import type {
  VocabularyLanguage,
  VocabularyPartOfSpeech,
  VocabularyTopicSummary,
  VocabularyWordWithState,
} from "@/lib/vocabulary.server";

export const vocabularyCopy = {
  KZ: {
    title: "Сөздік",
    subtitle: "Күн сайын жаңа ағылшын сөздерін үйрен.",
    dailyWord: "Бүгінгі сөз",
    dailyGoal: "Күндік мақсат",
    review: "Бүгінгі қайталау",
    featured: "Таңдаулы тақырыптар",
    allTopics: "Барлық тақырыптар",
    stats: "Сөздік статистикасы",
    search: "Сөз іздеу...",
    filters: "Сүзгі",
    verbs: "Етістіктер",
    adjectives: "Сын есімдер",
    nouns: "Зат есімдер",
    flashcards: "Flashcards",
    list: "Сөз тізімі",
    know: "Білемін",
    reviewAgain: "Қайталау керек",
    flip: "Мағынасын көру үшін бас",
    start: "Бастау",
    continue: "Жалғастыру",
    favoriteEmpty: "Сіз әлі таңдаулы сөз қоспадыңыз.",
    noReview: "Бүгін қайталайтын сөз жоқ.",
    noTopics: "Қазір сөздік тақырыптары жоқ.",
    noProgress: "Алғашқы сөзіңді үйреніп баста.",
    noSearch: "Сөз табылмады.",
  },
  RU: {
    title: "Словарь",
    subtitle: "Учи новые английские слова каждый день.",
    dailyWord: "Слово дня",
    dailyGoal: "Цель дня",
    review: "Повторение на сегодня",
    featured: "Избранные темы",
    allTopics: "Все темы",
    stats: "Статистика словаря",
    search: "Найти слово...",
    filters: "Фильтр",
    verbs: "Глаголы",
    adjectives: "Прилагательные",
    nouns: "Существительные",
    flashcards: "Карточки",
    list: "Список слов",
    know: "Знаю",
    reviewAgain: "Нужно повторить",
    flip: "Нажми, чтобы увидеть значение",
    start: "Начать",
    continue: "Продолжить",
    favoriteEmpty: "Вы пока не добавили слова в избранное.",
    noReview: "Сегодня нет слов для повторения.",
    noTopics: "Сейчас нет тем словаря.",
    noProgress: "Начни с первого слова.",
    noSearch: "Слово не найдено.",
  },
  EN: {
    title: "Vocabulary",
    subtitle: "Learn useful English words every day.",
    dailyWord: "Word of the Day",
    dailyGoal: "Daily Goal",
    review: "Today’s Review",
    featured: "Featured Topics",
    allTopics: "All Topics",
    stats: "Vocabulary Statistics",
    search: "Search words...",
    filters: "Filter",
    verbs: "Verbs",
    adjectives: "Adjectives",
    nouns: "Nouns",
    flashcards: "Flashcards",
    list: "Word list",
    know: "I know this",
    reviewAgain: "Review again",
    flip: "Tap to flip",
    start: "Start",
    continue: "Continue",
    favoriteEmpty: "You have not added favorite words yet.",
    noReview: "No words to review today.",
    noTopics: "No vocabulary topics yet.",
    noProgress: "Start with your first word.",
    noSearch: "No word found.",
  },
} satisfies Record<VocabularyLanguage, Record<string, string>>;

const partLabels = {
  verb: { KZ: "Етістіктер", RU: "Глаголы", EN: "Verbs" },
  adjective: { KZ: "Сын есімдер", RU: "Прилагательные", EN: "Adjectives" },
  noun: { KZ: "Зат есімдер", RU: "Существительные", EN: "Nouns" },
} satisfies Record<VocabularyPartOfSpeech, Record<VocabularyLanguage, string>>;

export function VocabularyHero({
  language,
  stats,
}: {
  language: VocabularyLanguage;
  stats: { streak: number; totalLearned: number; xpEarned: number; daily: string };
}) {
  const c = vocabularyCopy[language];
  return (
    <GameCard className="overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#8B5CF6] text-white">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">AI-Sana Words</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">{c.title}</h1>
          <p className="mt-3 max-w-2xl text-lg font-semibold text-[#EDE9FE]">{c.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="🔥" value={`${stats.streak} күн`} />
          <MiniStat label="📚" value={`${stats.totalLearned} сөз`} />
          <MiniStat label="⭐" value={`${stats.xpEarned} XP`} />
          <MiniStat label="🎯" value={stats.daily} />
        </div>
      </div>
    </GameCard>
  );
}

export function DailyWordCard({
  language,
  word,
  onFavorite,
}: {
  language: VocabularyLanguage;
  word: VocabularyWordWithState | null;
  onFavorite?: (wordId: string) => void;
}) {
  const c = vocabularyCopy[language];
  if (!word) return <VocabularyEmptyState text={c.noTopics} icon="auto_stories" />;

  return (
    <GameCard className="bg-white/95">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">{c.dailyWord}</p>
          <h2 className="mt-3 text-4xl font-black text-[#1E1B4B]">{word.word_en}</h2>
          <p className="mt-1 font-bold text-[#6B5E8F]">{word.pronunciation}</p>
        </div>
        <FavoriteButton active={word.favorite} onClick={() => onFavorite?.(word.id)} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl bg-[#F5F3FF] p-4">
          <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">{partLabels[word.part_of_speech][language]}</p>
          <p className="mt-2 text-xl font-black">{word.translation_kk}</p>
          <p className="font-bold text-[#6B5E8F]">{word.translation_ru}</p>
        </div>
        <div className="rounded-3xl bg-[#FFFBEB] p-4">
          <p className="font-black text-[#1E1B4B]">{word.example_en}</p>
          <p className="mt-1 text-sm font-semibold text-[#6B5E8F]">{word.example_kk}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <VocabularyAudioButton word={word.word_en} audioUrl={word.audio_url} />
        <Link
          to="/vocabulary/$topicSlug"
          params={{ topicSlug: "family" }}
          className="rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
        >
          Сөзді ашу
        </Link>
      </div>
    </GameCard>
  );
}

export function DailyGoalCard({
  language,
  learned,
  target,
  completed,
  xp,
}: {
  language: VocabularyLanguage;
  learned: number;
  target: number;
  completed: boolean;
  xp: number;
}) {
  const c = vocabularyCopy[language];
  const left = Math.max(0, target - learned);
  return (
    <GameCard className={completed ? "bg-[#DCFCE7]" : "bg-white/95"}>
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8B5CF6]">{c.dailyGoal}</p>
      <div className="mt-3 flex items-center justify-between">
        <h2 className="text-3xl font-black">{learned} / {target} сөз</h2>
        <span className="rounded-2xl bg-[#FACC15] px-4 py-2 font-black text-[#1E1B4B]">+{xp || 20} XP</span>
      </div>
      <ProgressBar value={Math.min(100, Math.round((learned / target) * 100))} />
      <p className="mt-3 font-bold text-[#6B5E8F]">
        {completed ? "Керемет! Күндік мақсатың орындалды." : `Тағы ${left} сөз қалды.`}
      </p>
    </GameCard>
  );
}

export function VocabularyTopicCard({ language, topic }: { language: VocabularyLanguage; topic: VocabularyTopicSummary }) {
  const c = vocabularyCopy[language];
  const title = language === "RU" ? topic.title_ru : language === "EN" ? topic.title_en : topic.title_kk;
  const description =
    language === "RU" ? topic.description_ru : language === "EN" ? topic.description_en : topic.description_kk;
  const button = topic.progress.state === "not_started" ? c.start : c.continue;
  return (
    <GameCard className="bg-white/95 transition hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-[#6D28D9] text-white shadow-[0_6px_0_#4C1D95]">
          <span className="material-symbols-outlined text-3xl">{topic.icon ?? "auto_stories"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">{topic.difficulty}</p>
          <h3 className="mt-1 text-2xl font-black">{title}</h3>
          <p className="mt-1 font-semibold text-[#6B5E8F]">{description}</p>
        </div>
      </div>
      <div className="mt-5 rounded-3xl bg-[#F5F3FF] p-4">
        <div className="flex items-center justify-between font-black">
          <span>{topic.progress.totalKnown} / {topic.counts.total} сөз</span>
          <span className="text-[#6D28D9]">{topic.progress.completionPercentage}%</span>
        </div>
        <ProgressBar value={topic.progress.completionPercentage} />
        <div className="mt-3 grid gap-2 text-sm font-bold text-[#6B5E8F]">
          <span>{c.verbs}: {topic.progress.knownVerbs} / 15</span>
          <span>{c.adjectives}: {topic.progress.knownAdjectives} / 15</span>
          <span>{c.nouns}: {topic.progress.knownNouns} / 15</span>
        </div>
      </div>
      <Link
        to="/vocabulary/$topicSlug"
        params={{ topicSlug: topic.slug }}
        className="mt-5 inline-flex rounded-2xl bg-[#6D28D9] px-5 py-3 font-black text-white shadow-[0_5px_0_#4C1D95]"
      >
        {button}
      </Link>
    </GameCard>
  );
}

export function VocabularyTabs({
  active,
  counts,
  language,
  onChange,
}: {
  active: VocabularyPartOfSpeech;
  counts: Record<VocabularyPartOfSpeech, number>;
  language: VocabularyLanguage;
  onChange: (part: VocabularyPartOfSpeech) => void;
}) {
  return (
    <div className="grid gap-2 rounded-[26px] border-2 border-[#DDD6FE] bg-white p-2 md:grid-cols-3">
      {(["verb", "adjective", "noun"] as VocabularyPartOfSpeech[]).map((part) => (
        <button
          key={part}
          type="button"
          onClick={() => onChange(part)}
          className={`rounded-2xl px-4 py-3 text-left font-black transition ${
            active === part ? "bg-[#6D28D9] text-white shadow-[0_5px_0_#4C1D95]" : "bg-[#F5F3FF] text-[#4B3D73]"
          }`}
        >
          {partLabels[part][language]} {counts[part]}
        </button>
      ))}
    </div>
  );
}

export function VocabularyFlashcard({
  language,
  word,
  index,
  total,
  saving,
  onKnown,
  onReview,
  onFavorite,
}: {
  language: VocabularyLanguage;
  word: VocabularyWordWithState;
  index: number;
  total: number;
  saving: boolean;
  onKnown: () => void;
  onReview: () => void;
  onFavorite: () => void;
}) {
  const c = vocabularyCopy[language];
  const [flipped, setFlipped] = useState(false);
  const status = word.progress.status;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((value) => !value);
          }
        }}
        className="min-h-[360px] w-full rounded-[34px] border-2 border-[#DDD6FE] bg-white p-6 text-left shadow-[0_10px_0_rgba(109,40,217,0.12)] outline-none transition focus:ring-4 focus:ring-[#C084FC] md:p-8"
        aria-label={`${word.word_en} flashcard. ${flipped ? "Back" : "Front"}`}
      >
        {!flipped ? (
          <div className="flex min-h-[300px] flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
                  {partLabels[word.part_of_speech][language]} · {index + 1} / {total}
                </p>
                <h2 className="mt-6 text-6xl font-black text-[#1E1B4B]">{word.word_en}</h2>
                <p className="mt-3 text-xl font-bold text-[#6B5E8F]">{word.pronunciation}</p>
              </div>
              <FavoriteButton active={word.favorite} onClick={(event) => {
                event.stopPropagation();
                onFavorite();
              }} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <VocabularyAudioButton word={word.word_en} audioUrl={word.audio_url} />
              <span className="rounded-full bg-[#F5F3FF] px-4 py-2 font-black text-[#6D28D9]">
                {status}
              </span>
              <span className="font-bold text-[#6B5E8F]">{c.flip}</span>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[300px] gap-5 md:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Meaning</p>
              <h2 className="mt-4 text-4xl font-black text-[#1E1B4B]">{word.translation_kk}</h2>
              <p className="mt-2 text-2xl font-black text-[#6B5E8F]">{word.translation_ru}</p>
            </div>
            <div className="rounded-3xl bg-[#F5F3FF] p-5">
              <p className="font-black text-[#1E1B4B]">{word.example_en}</p>
              <p className="mt-3 font-semibold text-[#6B5E8F]">{word.example_kk}</p>
              <p className="mt-2 font-semibold text-[#6B5E8F]">{word.example_ru}</p>
            </div>
          </div>
        )}
      </button>
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          disabled={saving}
          onClick={onReview}
          className="rounded-2xl border-2 border-[#DDD6FE] bg-white px-5 py-4 font-black text-[#6D28D9] disabled:opacity-60"
        >
          {c.reviewAgain}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onKnown}
          className="rounded-2xl bg-[#22C55E] px-5 py-4 font-black text-white shadow-[0_6px_0_#15803D] disabled:opacity-60"
        >
          {c.know}
        </button>
      </div>
    </div>
  );
}

export function VocabularyWordList({
  words,
  onFavorite,
}: {
  words: VocabularyWordWithState[];
  onFavorite: (wordId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {words.map((word) => (
        <div key={word.id} className="grid gap-3 rounded-[24px] border-2 border-[#DDD6FE] bg-white p-4 md:grid-cols-[1fr_1fr_120px] md:items-center">
          <div>
            <p className="text-xl font-black text-[#1E1B4B]">{word.word_en}</p>
            <p className="font-bold text-[#6B5E8F]">{word.pronunciation}</p>
          </div>
          <div>
            <p className="font-black">{word.translation_kk}</p>
            <p className="font-semibold text-[#6B5E8F]">{word.translation_ru}</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <VocabularyAudioButton word={word.word_en} audioUrl={word.audio_url} compact />
            <FavoriteButton active={word.favorite} onClick={() => onFavorite(word.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VocabularyAudioButton({
  word,
  audioUrl,
  compact,
}: {
  word: string;
  audioUrl?: string;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const speak = async () => {
    setLoading(true);
    try {
      window.speechSynthesis.cancel();
      if (audioUrl) {
        await new Audio(audioUrl).play();
      } else {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        utterance.rate = 0.82;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Keep the card usable even when audio is unavailable.
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={`Play pronunciation for ${word}`}
      onClick={(event) => {
        event.stopPropagation();
        void speak();
      }}
      className={`${compact ? "h-11 w-11" : "px-4 py-3"} rounded-2xl border-2 border-[#DDD6FE] bg-white font-black text-[#6D28D9]`}
    >
      {loading ? "..." : compact ? "🔊" : "🔊 Тыңдау"}
    </button>
  );
}

export function FavoriteButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={onClick}
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 font-black ${
        active ? "border-[#FACC15] bg-[#FACC15] text-[#1E1B4B]" : "border-[#DDD6FE] bg-white text-[#8B5CF6]"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

export function VocabularyEmptyState({ text, icon }: { text: string; icon: string }) {
  return (
    <GameCard className="grid min-h-40 place-items-center bg-white/95 text-center">
      <div>
        <span className="material-symbols-outlined text-5xl text-[#8B5CF6]">{icon}</span>
        <p className="mt-3 font-black text-[#6B5E8F]">{text}</p>
      </div>
    </GameCard>
  );
}

export function VocabularySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-52 animate-pulse rounded-[30px] bg-[#EDE9FE]" />
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white/15 p-4 text-center backdrop-blur">
      <p className="text-2xl">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

export function useFilteredVocabulary(words: VocabularyWordWithState[], query: string, part: VocabularyPartOfSpeech | "all") {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return words.filter((word) => {
      const matchesPart = part === "all" || word.part_of_speech === part;
      const matchesQuery =
        !normalized ||
        word.word_en.toLowerCase().includes(normalized) ||
        word.translation_kk.toLowerCase().includes(normalized) ||
        word.translation_ru.toLowerCase().includes(normalized);
      return matchesPart && matchesQuery;
    });
  }, [part, query, words]);
}
