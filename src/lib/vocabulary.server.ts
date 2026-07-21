import { getDashboardAccount } from "./account-store.server";
import { a1VocabularyTopics, type A1VocabularyWordSeed } from "./a1-vocabulary-content";

export type VocabularyLanguage = "KZ" | "RU" | "EN";
export type VocabularyDifficulty = "beginner" | "intermediate" | "mixed";
export type VocabularyWordDifficulty = "A1" | "beginner" | "intermediate";
export type VocabularyPartOfSpeech = "verb" | "adjective" | "noun";
export type VocabularyProgressStatus = "new" | "learning" | "review" | "known";
export type VocabularyQuestionType =
  | "translation_choice"
  | "sentence_completion"
  | "listening_choice"
  | "type_word"
  | "image_choice"
  | "matching"
  | "antonym_choice"
  | "context_choice"
  | "word_order"
  | "true_false";
export type VocabularyTestType =
  | "verb_section"
  | "adjective_section"
  | "noun_section"
  | "mixed_topic"
  | "ai_generated"
  | "weak_words";
export type VocabularyTestStatus = "in_progress" | "completed" | "abandoned";
export type VocabularyGameType =
  | "match_pairs"
  | "memory"
  | "drag_drop"
  | "listen_choose"
  | "type_word"
  | "unscramble"
  | "image_to_word"
  | "word_to_image"
  | "speed_round"
  | "sentence_builder";

const FIRST_A1_TOPIC_SLUG = "greetings-polite-words";

export type VocabularyTopic = {
  id: string;
  slug: string;
  title_en: string;
  title_kk: string;
  title_ru: string;
  description_en?: string;
  description_kk?: string;
  description_ru?: string;
  icon?: string;
  cover_image_url?: string;
  difficulty: VocabularyDifficulty;
  order_index: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type VocabularyWord = {
  id: string;
  topic_id: string;
  word_en: string;
  translation_kk: string;
  translation_ru: string;
  part_of_speech: VocabularyPartOfSpeech;
  pronunciation?: string;
  phonetic_ipa?: string;
  audio_url?: string;
  image_url?: string;
  image_prompt?: string;
  example_en?: string;
  example_kk?: string;
  example_ru?: string;
  difficulty: VocabularyWordDifficulty;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VocabularyWordProgress = {
  wordId: string;
  status: VocabularyProgressStatus;
  confidenceLevel: number;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  firstLearnedAt?: string;
  masteredAt?: string;
};

export type VocabularyTopicSummary = VocabularyTopic & {
  counts: VocabularyCounts;
  progress: VocabularyTopicProgress;
};

export type VocabularyCounts = {
  verbs: number;
  adjectives: number;
  nouns: number;
  total: number;
};

export type VocabularyTopicProgress = {
  knownVerbs: number;
  knownAdjectives: number;
  knownNouns: number;
  totalKnown: number;
  completionPercentage: number;
  state: "locked" | "available" | "in_progress" | "completed" | "mastered" | "needs_review";
  unlocked: boolean;
  lockedReason?: string;
  tests: {
    verbsPassed: boolean;
    adjectivesPassed: boolean;
    nounsPassed: boolean;
    mixedPassed: boolean;
  };
  rewards?: {
    xp: number;
    coins: number;
    badge: string;
  };
};

export type VocabularyValidationResult = {
  canPublish: boolean;
  counts: VocabularyCounts;
  errors: string[];
  warnings: string[];
};

export type VocabularyDailyGoal = {
  target: number;
  learnedToday: number;
  reviewedToday: number;
  cardsViewed: number;
  completed: boolean;
  xpEarned: number;
};

export type VocabularyOverview = {
  topics: VocabularyTopicSummary[];
  featuredTopics: VocabularyTopicSummary[];
  dailyWord: VocabularyWordWithState | null;
  dailyGoal: VocabularyDailyGoal;
  reviewCount: number;
  stats: {
    streak: number;
    totalLearned: number;
    xpEarned: number;
    favorites: number;
  };
};

export type VocabularyTopicDetail = VocabularyTopicSummary & {
  words: VocabularyWordWithState[];
  sections: Record<VocabularyPartOfSpeech, VocabularyWordWithState[]>;
};

export type VocabularyWordWithState = VocabularyWord & {
  progress: VocabularyWordProgress;
  favorite: boolean;
  topicSlug: string;
};

export type VocabularyQuestion = {
  id: string;
  topicId: string;
  wordId: string;
  partOfSpeech: VocabularyPartOfSpeech;
  questionType: VocabularyQuestionType;
  promptLanguage: VocabularyLanguage;
  answerLanguage: VocabularyLanguage;
  taskLabel: Record<VocabularyLanguage, string>;
  targetText: Record<VocabularyLanguage, string>;
  targetWord: {
    id: string;
    word_en: string;
    translation_kk: string;
    translation_ru: string;
    part_of_speech: VocabularyPartOfSpeech;
    example_en?: string;
  };
  questionText: Record<VocabularyLanguage, string>;
  options: string[];
  correctAnswer: string;
  explanation: Record<VocabularyLanguage, string>;
  promptAudioText?: string;
  promptImageUrl?: string;
};

export type VocabularyTestAttempt = {
  id: string;
  userId: string;
  topicId: string;
  topicSlug: string;
  partOfSpeech?: VocabularyPartOfSpeech;
  testType: VocabularyTestType;
  questions: VocabularyQuestion[];
  answers: VocabularyTestAnswer[];
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  status: VocabularyTestStatus;
  startedAt: string;
  completedAt?: string;
  xpEarned: number;
};

export type VocabularyTestAnswer = {
  questionId: string;
  wordId: string;
  selectedAnswer?: string;
  typedAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs?: number;
  answeredAt: string;
};

export type VocabularyAnswerFeedback = {
  correct: boolean;
  correctAnswer: string;
  explanation: Record<VocabularyLanguage, string>;
  almostCorrect: boolean;
};

export type VocabularyAnswerResponse = {
  attempt: VocabularyTestAttempt;
  feedback: VocabularyAnswerFeedback;
};

export type VocabularyTestResult = {
  attempt: VocabularyTestAttempt;
  resultState: "needs_review" | "almost_there" | "passed" | "excellent";
  weakWords: VocabularyWordWithState[];
  categoryScores: Record<VocabularyPartOfSpeech, { correct: number; total: number; percentage: number }>;
  strongestCategory?: VocabularyPartOfSpeech;
  weakestCategory?: VocabularyPartOfSpeech;
  topicCompleted: boolean;
  topicMastered: boolean;
};

export type VocabularyGameConfig = {
  gameType: VocabularyGameType;
  title: Record<VocabularyLanguage, string>;
  description: Record<VocabularyLanguage, string>;
  enabled: boolean;
  reason?: string;
};

export type VocabularyGameSession = {
  id: string;
  userId: string;
  topicId?: string;
  partOfSpeech?: VocabularyPartOfSpeech;
  gameType: VocabularyGameType;
  mode: "easy" | "normal" | "challenge";
  items: Array<{ id: string; word: string; match: string; imageUrl?: string }>;
  totalItems: number;
  correctItems: number;
  incorrectItems: number;
  hintsUsed: number;
  score: number;
  xpEarned: number;
  completedAt?: string;
  createdAt: string;
};

export type VocabularyAIResponse = {
  answer: string;
  suggestions: string[];
};

export type VocabularyAnalytics = {
  learnedWords: number;
  weakWords: number;
  testAttempts: number;
  gameSessions: number;
  averageAccuracy: number;
  strongestPart: VocabularyPartOfSpeech;
  weakestPart: VocabularyPartOfSpeech;
};

type DailyActivity = VocabularyDailyGoal & {
  date: string;
  countedWordIds: Set<string>;
  rewardGranted: boolean;
};

const now = new Date("2026-07-20T00:00:00.000Z").toISOString();
const todayActivityByUser = new Map<string, DailyActivity>();
const progressByUser = new Map<string, Map<string, VocabularyWordProgress>>();
const favoritesByUser = new Map<string, Set<string>>();
const testAttempts = new Map<string, VocabularyTestAttempt>();
const gameSessions = new Map<string, VocabularyGameSession>();
const rewardedKeysByUser = new Map<string, Set<string>>();

const topics = new Map<string, VocabularyTopic>();
const words = new Map<string, VocabularyWord>();

seedA1VocabularyModule();

export async function getVocabularyOverview(): Promise<VocabularyOverview> {
  const userId = await getCurrentUserId();
  const publishedTopics = getPublishedTopicSummaries(userId);
  const activeWords = getPublishedActiveWords();
  const dailyWord = pickDailyWord(activeWords, userId);
  const progress = getUserProgressMap(userId);
  const favorites = getUserFavorites(userId);
  const today = getDailyActivity(userId);
  const reviewCount = [...progress.values()].filter((item) => item.status === "review").length;
  const totalLearned = [...progress.values()].filter((item) => item.status === "known").length;

  return {
    topics: publishedTopics,
    featuredTopics: publishedTopics.filter((topic) => topic.is_featured),
    dailyWord: dailyWord ? withState(dailyWord, userId) : null,
    dailyGoal: publicDailyGoal(today),
    reviewCount,
    stats: {
      streak: totalLearned > 0 ? 1 : 0,
      totalLearned,
      xpEarned: today.xpEarned,
      favorites: favorites.size,
    },
  };
}

export async function getVocabularyTopic(slug: string): Promise<VocabularyTopicDetail | null> {
  const userId = await getCurrentUserId();
  const topic = topics.get(slug);
  if (!topic || !topic.is_published) return null;
  assertTopicUnlocked(topic, userId);

  const topicWords = getTopicWords(topic.id).map((word) => withState(word, userId));

  if (!isTopicPublishable(topic.id).canPublish) {
    return null;
  }

  return {
    ...topic,
    counts: countTopicWords(topic.id),
    progress: calculateTopicProgress(topic.id, userId),
    words: topicWords,
    sections: {
      verb: topicWords.filter((word) => word.part_of_speech === "verb"),
      adjective: topicWords.filter((word) => word.part_of_speech === "adjective"),
      noun: topicWords.filter((word) => word.part_of_speech === "noun"),
    },
  };
}

export async function searchVocabulary(query: string, partOfSpeech?: VocabularyPartOfSpeech) {
  const userId = await getCurrentUserId();
  const normalized = normalizeWord(query);
  return getPublishedActiveWords()
    .filter((word) => {
      const matchesQuery =
        !normalized ||
        normalizeWord(word.word_en).includes(normalized) ||
        word.translation_kk.toLowerCase().includes(normalized) ||
        word.translation_ru.toLowerCase().includes(normalized);
      const matchesPart = !partOfSpeech || word.part_of_speech === partOfSpeech;
      return matchesQuery && matchesPart;
    })
    .slice(0, 50)
    .map((word) => withState(word, userId));
}

export async function saveVocabularyProgress(input: {
  wordId: string;
  action: "known" | "review";
}) {
  const userId = await getCurrentUserId();
  const word = words.get(input.wordId);
  if (!word || !word.is_active) {
    throw new Error("WORD_NOT_FOUND");
  }
  const topic = topicsById(word.topic_id);
  if (!topic) throw new Error("TOPIC_NOT_FOUND");
  assertTopicUnlocked(topic, userId);

  const progressMap = getUserProgressMap(userId);
  const previous = progressMap.get(input.wordId) ?? newProgress(input.wordId);
  const next = updateProgress(previous, input.action);
  progressMap.set(input.wordId, next);
  updateDailyActivity(userId, input.wordId, input.action);
  syncTopicUnlocks(userId, word.topic_id);
  return withState(word, userId);
}

export async function toggleVocabularyFavorite(wordId: string) {
  const userId = await getCurrentUserId();
  if (!words.has(wordId)) throw new Error("WORD_NOT_FOUND");
  const favorites = getUserFavorites(userId);
  if (favorites.has(wordId)) {
    favorites.delete(wordId);
  } else {
    favorites.add(wordId);
  }
  return { favorite: favorites.has(wordId) };
}

export async function getAdminVocabularyTopics() {
  return [...topics.values()]
    .sort((a, b) => a.order_index - b.order_index)
    .map((topic) => ({
      ...topic,
      counts: countTopicWords(topic.id),
      validation: isTopicPublishable(topic.id),
    }));
}

export async function createAdminVocabularyTopic(input: {
  slug: string;
  title_en: string;
  title_kk: string;
  title_ru: string;
  difficulty: VocabularyDifficulty;
}) {
  await requireAdmin();
  const slug = normalizeSlug(input.slug);
  if (topics.has(slug)) throw new Error("TOPIC_SLUG_EXISTS");
  const topic: VocabularyTopic = {
    id: `vocab-topic-${slug}`,
    slug,
    title_en: input.title_en.trim(),
    title_kk: input.title_kk.trim(),
    title_ru: input.title_ru.trim(),
    difficulty: input.difficulty,
    order_index: topics.size + 1,
    is_published: false,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  topics.set(slug, topic);
  return topic;
}

export async function saveAdminVocabularyWord(input: Omit<VocabularyWord, "id" | "created_at" | "updated_at">) {
  await requireAdmin();
  const validation = validateWordInput(input);
  if (validation) throw new Error(validation);

  const duplicate = getTopicWords(input.topic_id).find(
    (word) =>
      normalizeWord(word.word_en) === normalizeWord(input.word_en) &&
      word.part_of_speech === input.part_of_speech,
  );

  if (duplicate) throw new Error("WORD_DUPLICATE");

  const groupCount = getTopicWords(input.topic_id).filter(
    (word) => word.part_of_speech === input.part_of_speech && word.is_active,
  ).length;

  if (input.is_active && groupCount >= 15) {
    throw new Error(`GROUP_FULL_${input.part_of_speech.toUpperCase()}`);
  }

  const word: VocabularyWord = {
    ...input,
    id: `vocab-word-${input.topic_id}-${input.part_of_speech}-${normalizeWord(input.word_en).replace(/\s+/g, "-")}`,
    word_en: input.word_en.trim(),
    translation_kk: input.translation_kk.trim(),
    translation_ru: input.translation_ru.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  words.set(word.id, word);
  return word;
}

export function validateTopicForPublication(topicId: string) {
  return isTopicPublishable(topicId);
}

export async function startVocabularySectionTest(input: {
  topicSlug: string;
  partOfSpeech: VocabularyPartOfSpeech;
}) {
  const userId = await getCurrentUserId();
  const topic = topics.get(input.topicSlug);
  if (!topic || !topic.is_published) throw new Error("TOPIC_NOT_FOUND");
  assertTopicUnlocked(topic, userId);
  const sectionWords = getTopicWords(topic.id).filter((word) => word.is_active && word.part_of_speech === input.partOfSpeech);
  validateSectionPool(topic.id, sectionWords, input.partOfSpeech);

  const questions = buildSectionQuestions(topic.id, sectionWords, input.partOfSpeech);
  const attempt = createAttempt({
    userId,
    topic,
    partOfSpeech: input.partOfSpeech,
    testType: `${input.partOfSpeech}_section` as VocabularyTestType,
    questions,
  });
  testAttempts.set(attempt.id, attempt);
  return attempt;
}

export async function startVocabularyMixedTest(topicSlug: string) {
  const userId = await getCurrentUserId();
  const topic = topics.get(topicSlug);
  if (!topic || !topic.is_published) throw new Error("TOPIC_NOT_FOUND");
  assertTopicUnlocked(topic, userId);
  const topicWords = getTopicWords(topic.id);
  validateSectionPool(topic.id, topicWords.filter((word) => word.is_active && word.part_of_speech === "verb"), "verb");
  validateSectionPool(topic.id, topicWords.filter((word) => word.is_active && word.part_of_speech === "adjective"), "adjective");
  validateSectionPool(topic.id, topicWords.filter((word) => word.is_active && word.part_of_speech === "noun"), "noun");
  const questions = shuffle([
    ...buildSectionQuestions(topic.id, topicWords.filter((word) => word.is_active && word.part_of_speech === "verb"), "verb").slice(0, 5),
    ...buildSectionQuestions(
      topic.id,
      topicWords.filter((word) => word.is_active && word.part_of_speech === "adjective"),
      "adjective",
    ).slice(0, 5),
    ...buildSectionQuestions(topic.id, topicWords.filter((word) => word.is_active && word.part_of_speech === "noun"), "noun").slice(0, 5),
  ]);
  const attempt = createAttempt({
    userId,
    topic,
    testType: "mixed_topic",
    questions,
  });
  testAttempts.set(attempt.id, attempt);
  return attempt;
}

export async function answerVocabularyTest(input: {
  attemptId: string;
  questionId: string;
  answer: string;
  responseTimeMs?: number;
}): Promise<VocabularyAnswerResponse> {
  const userId = await getCurrentUserId();
  const attempt = getOwnedAttempt(userId, input.attemptId);
  if (attempt.status !== "in_progress") throw new Error("ATTEMPT_COMPLETED");
  const question = attempt.questions.find((item) => item.id === input.questionId);
  if (!question) throw new Error("QUESTION_NOT_FOUND");
  if (attempt.answers.some((answer) => answer.questionId === question.id)) {
    const previousAnswer = attempt.answers.find((answer) => answer.questionId === question.id)!;
    return {
      attempt,
      feedback: {
        correct: previousAnswer.isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        almostCorrect: false,
      },
    };
  }

  const evaluation = evaluateAnswer(question, input.answer);
  const answer: VocabularyTestAnswer = {
    questionId: question.id,
    wordId: question.wordId,
    selectedAnswer: question.questionType === "type_word" ? undefined : input.answer,
    typedAnswer: question.questionType === "type_word" ? input.answer : undefined,
    correctAnswer: question.correctAnswer,
    isCorrect: evaluation.correct,
    responseTimeMs: input.responseTimeMs,
    answeredAt: new Date().toISOString(),
  };
  attempt.answers.push(answer);
  recalculateAttempt(attempt);
  updateWordMetricsFromAnswer(userId, question.wordId, evaluation.correct, input.responseTimeMs);
  return {
    attempt,
    feedback: {
      correct: evaluation.correct,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      almostCorrect: evaluation.almostCorrect,
    },
  };
}

export async function completeVocabularyTest(attemptId: string) {
  const userId = await getCurrentUserId();
  const attempt = getOwnedAttempt(userId, attemptId);
  if (attempt.status === "completed") return getVocabularyTestResult(attemptId);
  attempt.status = "completed";
  attempt.completedAt = new Date().toISOString();
  recalculateAttempt(attempt);
  attempt.xpEarned = calculateTestXp(attempt);
  grantRewardOnce(userId, `vocabulary:test:${attempt.id}:completed`, attempt.xpEarned);
  syncTopicUnlocks(userId, attempt.topicId);
  return getVocabularyTestResult(attemptId);
}

export async function getVocabularyTestResult(attemptId: string): Promise<VocabularyTestResult> {
  const userId = await getCurrentUserId();
  const attempt = getOwnedAttempt(userId, attemptId);
  const weakWordIds = new Set(attempt.answers.filter((answer) => !answer.isCorrect).map((answer) => answer.wordId));
  const weakWords = [...weakWordIds].map((wordId) => words.get(wordId)).filter(Boolean).map((word) => withState(word!, userId));
  const categoryScores = buildCategoryScores(attempt);
  const scoredParts = Object.entries(categoryScores).filter(([, value]) => value.total > 0) as Array<
    [VocabularyPartOfSpeech, { correct: number; total: number; percentage: number }]
  >;
  const strongestCategory = scoredParts.sort((a, b) => b[1].percentage - a[1].percentage)[0]?.[0];
  const weakestCategory = scoredParts.sort((a, b) => a[1].percentage - b[1].percentage)[0]?.[0];

  return {
    attempt,
    resultState: resultState(attempt.percentage),
    weakWords,
    categoryScores,
    strongestCategory,
    weakestCategory,
    topicCompleted: isTopicCompleted(attempt.topicId, userId),
    topicMastered: isTopicMastered(attempt.topicId, userId),
  };
}

export async function getVocabularyWeakWords() {
  const userId = await getCurrentUserId();
  return getPublishedActiveWords()
    .map((word) => withState(word, userId))
    .filter((word) => word.progress.timesIncorrect >= 1 || word.progress.status === "review")
    .sort((a, b) => b.progress.timesIncorrect - a.progress.timesIncorrect)
    .slice(0, 30);
}

export async function startPersonalizedVocabularyReview(size = 10) {
  const userId = await getCurrentUserId();
  const weak = await getVocabularyWeakWords();
  const due = getPublishedActiveWords()
    .map((word) => withState(word, userId))
    .filter((word) => word.progress.status === "review");
  const retention = getPublishedActiveWords()
    .map((word) => withState(word, userId))
    .filter((word) => word.progress.status === "known");
  const picked = uniqueWords([...weak.slice(0, Math.ceil(size * 0.5)), ...due, ...retention]).slice(0, size);
  return {
    words: picked,
    plan: {
      total: picked.length,
      weak: picked.filter((word) => word.progress.timesIncorrect > 0).length,
      review: picked.filter((word) => word.progress.status === "review").length,
    },
  };
}

export async function getVocabularyGamesConfig(topicSlug?: string): Promise<VocabularyGameConfig[]> {
  const topic = topicSlug ? topics.get(topicSlug) : topics.get(FIRST_A1_TOPIC_SLUG);
  const imageCount = topic ? getTopicWords(topic.id).filter((word) => word.image_url).length : 0;
  return [
    gameConfig("match_pairs", "Match Pairs", "Жұптарды сәйкестендір", "Соедини пары", true),
    gameConfig("memory", "Memory Cards", "Есте сақтау карталары", "Карточки памяти", true),
    gameConfig("drag_drop", "Drag and Drop", "Сүйреп сәйкестендір", "Перетащи и сопоставь", true),
    gameConfig("listen_choose", "Listen and Choose", "Тыңдап таңда", "Слушай и выбирай", true),
    gameConfig("type_word", "Type the Word", "Сөзді жаз", "Напиши слово", true),
    gameConfig("unscramble", "Unscramble", "Әріптерді ретте", "Собери слово", true),
    gameConfig(
      "image_to_word",
      "Image to Word",
      "Суреттен сөз тап",
      "Слово по картинке",
      imageCount >= 4,
      imageCount >= 4 ? undefined : "Бұл ойын үшін кемінде 4 суреті бар сөз керек.",
    ),
    gameConfig(
      "word_to_image",
      "Word to Image",
      "Сөзге сурет таңда",
      "Картинка по слову",
      imageCount >= 4,
      imageCount >= 4 ? undefined : "Бұл ойын үшін кемінде 4 суреті бар сөз керек.",
    ),
    gameConfig("speed_round", "Speed Round", "Жылдам раунд", "Быстрый раунд", true),
    gameConfig("sentence_builder", "Sentence Builder", "Сөйлем құрастыр", "Собери предложение", true),
  ];
}

export async function startVocabularyGame(input: {
  gameType: VocabularyGameType;
  topicSlug?: string;
  partOfSpeech?: VocabularyPartOfSpeech;
  mode?: "easy" | "normal" | "challenge";
}) {
  const userId = await getCurrentUserId();
  const topic = topics.get(input.topicSlug ?? FIRST_A1_TOPIC_SLUG);
  if (!topic) throw new Error("TOPIC_NOT_FOUND");
  assertTopicUnlocked(topic, userId);
  const pairCount = input.mode === "challenge" ? 8 : input.mode === "easy" ? 4 : 6;
  const sourceWords = getTopicWords(topic.id).filter((word) => !input.partOfSpeech || word.part_of_speech === input.partOfSpeech);
  const picked = shuffle(sourceWords).slice(0, pairCount);
  const session: VocabularyGameSession = {
    id: createId("vocab-game"),
    userId,
    topicId: topic.id,
    partOfSpeech: input.partOfSpeech,
    gameType: input.gameType,
    mode: input.mode ?? "normal",
    items: picked.map((word) => ({
      id: word.id,
      word: word.word_en,
      match: word.translation_kk,
      imageUrl: word.image_url,
    })),
    totalItems: picked.length,
    correctItems: 0,
    incorrectItems: 0,
    hintsUsed: 0,
    score: 0,
    xpEarned: 0,
    createdAt: new Date().toISOString(),
  };
  gameSessions.set(session.id, session);
  return session;
}

export async function completeVocabularyGame(sessionId: string, correctItems: number, incorrectItems: number, hintsUsed = 0) {
  const userId = await getCurrentUserId();
  const session = gameSessions.get(sessionId);
  if (!session || session.userId !== userId) throw new Error("GAME_NOT_FOUND");
  if (session.completedAt) return session;
  session.correctItems = Math.max(0, Math.min(correctItems, session.totalItems));
  session.incorrectItems = Math.max(0, incorrectItems);
  session.hintsUsed = Math.max(0, hintsUsed);
  session.score = Math.round((session.correctItems / Math.max(1, session.totalItems)) * 100);
  session.xpEarned = session.score >= 70 ? 10 : 5;
  session.completedAt = new Date().toISOString();
  grantRewardOnce(userId, `vocabulary:game:${session.id}:completed`, session.xpEarned);
  return session;
}

export async function getVocabularyAIResponse(input: {
  message: string;
  topicSlug?: string;
  wordId?: string;
  partOfSpeech?: VocabularyPartOfSpeech;
  mentorStyle?: string;
}) {
  const topic = input.topicSlug ? topics.get(input.topicSlug) : topics.get(FIRST_A1_TOPIC_SLUG);
  const word = input.wordId ? words.get(input.wordId) : undefined;
  const focus = word ?? (topic ? getTopicWords(topic.id).find((item) => item.part_of_speech === input.partOfSpeech) : undefined);
  const answer = buildLocalVocabularyAIAnswer(input.message, focus);
  return {
    answer,
    suggestions: ["Сөйлем құр", "Қарапайым түсіндір", "Диалог жаса", "Қысқа story құрастыр"],
  } satisfies VocabularyAIResponse;
}

export async function getVocabularyAnalytics(): Promise<VocabularyAnalytics> {
  const userId = await getCurrentUserId();
  const progress = [...getUserProgressMap(userId).values()];
  const attempts = [...testAttempts.values()].filter((attempt) => attempt.userId === userId);
  const games = [...gameSessions.values()].filter((session) => session.userId === userId);
  const categoryScores = ["verb", "adjective", "noun"].map((part) => {
    const partWords = getPublishedActiveWords().filter((word) => word.part_of_speech === part);
    const correct = partWords.reduce((sum, word) => sum + (getUserProgressMap(userId).get(word.id)?.timesCorrect ?? 0), 0);
    const incorrect = partWords.reduce((sum, word) => sum + (getUserProgressMap(userId).get(word.id)?.timesIncorrect ?? 0), 0);
    return { part: part as VocabularyPartOfSpeech, percentage: Math.round((correct / Math.max(1, correct + incorrect)) * 100) };
  });
  return {
    learnedWords: progress.filter((item) => item.status === "known").length,
    weakWords: (await getVocabularyWeakWords()).length,
    testAttempts: attempts.length,
    gameSessions: games.length,
    averageAccuracy: Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / Math.max(1, attempts.length)),
    strongestPart: categoryScores.sort((a, b) => b.percentage - a.percentage)[0]?.part ?? "noun",
    weakestPart: categoryScores.sort((a, b) => a.percentage - b.percentage)[0]?.part ?? "verb",
  };
}

function getPublishedTopicSummaries(userId: string) {
  return [...topics.values()]
    .filter((topic) => topic.is_published)
    .sort((a, b) => a.order_index - b.order_index)
    .map((topic) => ({
      ...topic,
      counts: countTopicWords(topic.id),
      progress: calculateTopicProgress(topic.id, userId),
    }));
}

function createAttempt(input: {
  userId: string;
  topic: VocabularyTopic;
  partOfSpeech?: VocabularyPartOfSpeech;
  testType: VocabularyTestType;
  questions: VocabularyQuestion[];
}): VocabularyTestAttempt {
  return {
    id: createId("vocab-test"),
    userId: input.userId,
    topicId: input.topic.id,
    topicSlug: input.topic.slug,
    partOfSpeech: input.partOfSpeech,
    testType: input.testType,
    questions: input.questions,
    answers: [],
    totalQuestions: input.questions.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    percentage: 0,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    xpEarned: 0,
  };
}

function buildSectionQuestions(
  topicId: string,
  sectionWords: VocabularyWord[],
  partOfSpeech: VocabularyPartOfSpeech,
): VocabularyQuestion[] {
  validateSectionPool(topicId, sectionWords, partOfSpeech);
  const picked = shuffle(sectionWords).slice(0, 10);
  return picked.map((word) => buildQuestion(topicId, word, "translation_choice", sectionWords));
}

function buildQuestion(
  topicId: string,
  word: VocabularyWord,
  questionType: VocabularyQuestionType,
  sectionWords: VocabularyWord[],
): VocabularyQuestion {
  const options = buildOptions(word, sectionWords);
  const translationKk = word.translation_kk;
  const translationRu = word.translation_ru;
  const targetWord = {
    id: word.id,
    word_en: word.word_en,
    translation_kk: translationKk,
    translation_ru: translationRu,
    part_of_speech: word.part_of_speech,
    example_en: word.example_en,
  };
  const question: VocabularyQuestion = {
    id: createId("vocab-question"),
    topicId,
    wordId: word.id,
    partOfSpeech: word.part_of_speech,
    questionType: "translation_choice",
    promptLanguage: "KZ",
    answerLanguage: "EN",
    taskLabel: {
      KZ: "Choose the correct English word",
      RU: "Choose the correct English word",
      EN: "Choose the correct meaning",
    },
    targetText: {
      KZ: translationKk,
      RU: translationRu,
      EN: translationKk,
    },
    targetWord,
    questionText: {
      KZ: `"${translationKk}" сөзінің ағылшынша аудармасын таңдаңыз.`,
      RU: `Выберите английский перевод слова "${translationRu}".`,
      EN: `Choose the meaning of "${word.word_en}".`,
    },
    options: {
      KZ: options.map((item) => item.word_en),
      RU: options.map((item) => item.word_en),
      EN: options.map((item) => item.translation_kk),
    }.KZ,
    correctAnswer: word.word_en,
    explanation: {
      KZ: `${capitalizeWord(word.word_en)} — ${translationKk}. Сөз табы: ${partLabel(word.part_of_speech, "KZ")}.${word.example_en ? ` Мысал: ${word.example_en}` : ""}`,
      RU: `${capitalizeWord(word.word_en)} — ${translationRu}. Часть речи: ${partLabel(word.part_of_speech, "RU")}.${word.example_en ? ` Пример: ${word.example_en}` : ""}`,
      EN: `${capitalizeWord(word.word_en)} — ${translationKk}. Part of speech: ${partLabel(word.part_of_speech, "EN")}.${word.example_en ? ` Example: ${word.example_en}` : ""}`,
    },
    promptAudioText: undefined,
    promptImageUrl: undefined,
  };

  question.answerLanguage = "EN";

  assertValidQuestionSnapshot(question, sectionWords);
  return question;
}

function buildOptions(word: VocabularyWord, pool: VocabularyWord[]) {
  const distractors = shuffle(
    pool.filter(
      (item) =>
        item.is_active &&
        item.id !== word.id &&
        item.topic_id === word.topic_id &&
        item.part_of_speech === word.part_of_speech &&
        normalizeTypedAnswer(item.word_en) !== normalizeTypedAnswer(word.word_en) &&
        normalizeTypedAnswer(item.translation_kk) !== normalizeTypedAnswer(word.translation_kk) &&
        normalizeTypedAnswer(item.translation_ru) !== normalizeTypedAnswer(word.translation_ru),
    ),
  ).slice(0, 3);
  const picked = shuffle([word, ...distractors]);
  if (picked.length !== 4) throw new Error("QUESTION_OPTIONS_NOT_READY");
  return picked;
}

function validateSectionPool(
  topicId: string,
  sectionWords: VocabularyWord[],
  partOfSpeech: VocabularyPartOfSpeech,
) {
  const activeWords = sectionWords.filter((word) => word.is_active);
  const invalidWords = activeWords.filter((word) => word.topic_id !== topicId || word.part_of_speech !== partOfSpeech);

  if (activeWords.length !== 15 || invalidWords.length > 0) {
    console.error("Vocabulary section validation failed", {
      topicId,
      partOfSpeech,
      activeCount: activeWords.length,
      invalidWordIds: invalidWords.map((word) => word.id),
    });
    throw new Error("SECTION_NOT_READY");
  }
}

function assertValidQuestionSnapshot(question: VocabularyQuestion, pool: VocabularyWord[]) {
  const target = words.get(question.wordId);
  const optionSet = new Set(question.options.map(normalizeTypedAnswer));

  if (!target) throw new Error("QUESTION_TARGET_NOT_FOUND");
  if (target.topic_id !== question.topicId) throw new Error("QUESTION_TOPIC_MISMATCH");
  if (target.part_of_speech !== question.partOfSpeech) throw new Error("QUESTION_PART_MISMATCH");
  if (question.targetWord.id !== target.id) throw new Error("QUESTION_SNAPSHOT_MISMATCH");
  if (optionSet.size !== question.options.length) throw new Error("QUESTION_DUPLICATE_OPTIONS");
  if (!optionSet.has(normalizeTypedAnswer(question.correctAnswer))) throw new Error("QUESTION_CORRECT_OPTION_MISSING");

  const correctCount = question.options.filter((option) => normalizeTypedAnswer(option) === normalizeTypedAnswer(question.correctAnswer)).length;
  if (correctCount !== 1) throw new Error("QUESTION_CORRECT_OPTION_DUPLICATED");

  const allowedAnswers = new Set(pool.map((word) => normalizeTypedAnswer(word.word_en)));
  for (const option of question.options) {
    if (!allowedAnswers.has(normalizeTypedAnswer(option))) throw new Error("QUESTION_OPTION_OUTSIDE_SECTION");
  }
}

function partLabel(partOfSpeech: VocabularyPartOfSpeech, language: VocabularyLanguage) {
  const labels = {
    verb: { KZ: "Етістік", RU: "Глагол", EN: "Verb" },
    adjective: { KZ: "Сын есім", RU: "Прилагательное", EN: "Adjective" },
    noun: { KZ: "Зат есім", RU: "Существительное", EN: "Noun" },
  } satisfies Record<VocabularyPartOfSpeech, Record<VocabularyLanguage, string>>;
  return labels[partOfSpeech][language];
}

function capitalizeWord(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getOwnedAttempt(userId: string, attemptId: string) {
  const attempt = testAttempts.get(attemptId);
  if (!attempt || attempt.userId !== userId) throw new Error("ATTEMPT_NOT_FOUND");
  return attempt;
}

function evaluateAnswer(question: VocabularyQuestion, rawAnswer: string) {
  const answer = normalizeTypedAnswer(rawAnswer);
  const correct = normalizeTypedAnswer(question.correctAnswer);
  if (answer === correct) return { correct: true, almostCorrect: false };
  if (question.questionType === "type_word" && editDistance(answer, correct) === 1) {
    return { correct: false, almostCorrect: true };
  }
  return { correct: false, almostCorrect: false };
}

function recalculateAttempt(attempt: VocabularyTestAttempt) {
  attempt.correctAnswers = attempt.answers.filter((answer) => answer.isCorrect).length;
  attempt.incorrectAnswers = attempt.answers.filter((answer) => !answer.isCorrect).length;
  attempt.percentage = Math.round((attempt.correctAnswers / Math.max(1, attempt.totalQuestions)) * 100);
}

function updateWordMetricsFromAnswer(userId: string, wordId: string, correct: boolean, responseTimeMs?: number) {
  const progressMap = getUserProgressMap(userId);
  const previous = progressMap.get(wordId) ?? newProgress(wordId);
  const action = correct ? "known" : "review";
  const next = updateProgress(previous, action);
  const slowPenalty = responseTimeMs && responseTimeMs > 15000 ? 1 : 0;
  progressMap.set(wordId, {
    ...next,
    confidenceLevel: correct ? next.confidenceLevel : Math.max(0, next.confidenceLevel - slowPenalty),
  });
}

function calculateTestXp(attempt: VocabularyTestAttempt) {
  if (attempt.testType === "mixed_topic") return attempt.percentage >= 90 ? 60 : attempt.percentage >= 80 ? 40 : 10;
  return attempt.percentage >= 90 ? 30 : attempt.percentage >= 80 ? 20 : 5;
}

function resultState(percentage: number): VocabularyTestResult["resultState"] {
  if (percentage >= 90) return "excellent";
  if (percentage >= 80) return "passed";
  if (percentage >= 50) return "almost_there";
  return "needs_review";
}

function buildCategoryScores(attempt: VocabularyTestAttempt): VocabularyTestResult["categoryScores"] {
  return {
    verb: scorePart(attempt, "verb"),
    adjective: scorePart(attempt, "adjective"),
    noun: scorePart(attempt, "noun"),
  };
}

function scorePart(attempt: VocabularyTestAttempt, part: VocabularyPartOfSpeech) {
  const questions = attempt.questions.filter((question) => question.partOfSpeech === part);
  const correct = questions.filter((question) => attempt.answers.find((answer) => answer.questionId === question.id)?.isCorrect).length;
  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / Math.max(1, questions.length)) * 100),
  };
}

function isTopicCompleted(topicId: string, userId: string) {
  const attempts = [...testAttempts.values()].filter((attempt) => attempt.userId === userId && attempt.topicId === topicId);
  const wordsLearned = getTopicWords(topicId).every((word) => getUserProgressMap(userId).get(word.id)?.status === "known");
  const passedMixed = attempts.some((attempt) => attempt.testType === "mixed_topic" && attempt.status === "completed" && attempt.percentage >= 80);
  const parts: VocabularyPartOfSpeech[] = ["verb", "adjective", "noun"];
  const passedParts = parts.every((part) =>
    attempts.some((attempt) => attempt.partOfSpeech === part && attempt.status === "completed" && attempt.percentage >= 80),
  );
  return wordsLearned && passedMixed && passedParts;
}

function isTopicMastered(topicId: string, userId: string) {
  return isTopicCompleted(topicId, userId);
}

function grantRewardOnce(userId: string, key: string, xp: number) {
  if (!rewardedKeysByUser.has(userId)) rewardedKeysByUser.set(userId, new Set());
  const keys = rewardedKeysByUser.get(userId)!;
  if (keys.has(key)) return 0;
  keys.add(key);
  const activity = getDailyActivity(userId);
  activity.xpEarned += xp;
  return xp;
}

function gameConfig(
  gameType: VocabularyGameType,
  en: string,
  kk: string,
  ru: string,
  enabled: boolean,
  reason?: string,
): VocabularyGameConfig {
  return {
    gameType,
    title: { EN: en, KZ: kk, RU: ru },
    description: {
      EN: enabled ? "Short practice game with your vocabulary words." : (reason ?? "Not available yet."),
      KZ: enabled ? "Сөздерді ойын арқылы қысқа қайталау." : (reason ?? "Әзірге қолжетімді емес."),
      RU: enabled ? "Короткая игра для повторения слов." : (reason ?? "Пока недоступно."),
    },
    enabled,
    reason,
  };
}

function uniqueWords(items: VocabularyWordWithState[]) {
  const seen = new Set<string>();
  return items.filter((word) => {
    if (seen.has(word.id)) return false;
    seen.add(word.id);
    return true;
  });
}

function buildLocalVocabularyAIAnswer(message: string, word?: VocabularyWord) {
  const clean = message.trim();
  if (!word) {
    return "Мен AI-Sana сөздік көмекшісімін. Қай сөзді түсіндіріп берейін? Сөзді немесе сөйлемді жазсаң, мағынасын, қолданылуын және мысалын көрсетемін.";
  }
  if (/dialog|диалог|сөйлесу/i.test(clean)) {
    return `Қысқа диалог:\nA: Do you ${word.word_en} your family?\nB: Yes, I do. ${word.example_en ?? ""}\nМағынасы: ${word.translation_kk}.`;
  }
  if (/story|әңгіме|история/i.test(clean)) {
    return `Mini story: My family is important to me. I learn the word "${word.word_en}" today. ${word.example_en ?? ""}\nБұл сөздің мағынасы: ${word.translation_kk}.`;
  }
  return `"${word.word_en}" сөзі ${word.part_of_speech} түріне жатады. Қазақша мағынасы: ${word.translation_kk}. Орысша: ${word.translation_ru}. Мысал: ${word.example_en ?? `I use ${word.word_en} in a sentence.`}`;
}

function normalizeTypedAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}

function editDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0]![j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return matrix[a.length]![b.length]!;
}

function shuffle<T>(items: T[]) {
  return [...items].sort((a, b) => stableHash(JSON.stringify(a)) - stableHash(JSON.stringify(b)));
}

function stableHash(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTopicWords(topicId: string) {
  return [...words.values()]
    .filter((word) => word.topic_id === topicId && word.is_active)
    .sort((a, b) =>
      a.part_of_speech === b.part_of_speech
        ? a.order_index - b.order_index
        : partOrder(a.part_of_speech) - partOrder(b.part_of_speech),
    );
}

function getPublishedActiveWords() {
  const publishedIds = new Set(
    [...topics.values()].filter((topic) => topic.is_published).map((topic) => topic.id),
  );
  return [...words.values()].filter((word) => word.is_active && publishedIds.has(word.topic_id));
}

function countTopicWords(topicId: string): VocabularyCounts {
  const topicWords = getTopicWords(topicId);
  return {
    verbs: topicWords.filter((word) => word.part_of_speech === "verb").length,
    adjectives: topicWords.filter((word) => word.part_of_speech === "adjective").length,
    nouns: topicWords.filter((word) => word.part_of_speech === "noun").length,
    total: topicWords.length,
  };
}

function isTopicPublishable(topicId: string): VocabularyValidationResult {
  const counts = countTopicWords(topicId);
  const errors: string[] = [];
  if (counts.verbs !== 15) errors.push(`Verbs must be exactly 15. Current: ${counts.verbs}.`);
  if (counts.adjectives !== 15) errors.push(`Adjectives must be exactly 15. Current: ${counts.adjectives}.`);
  if (counts.nouns !== 15) errors.push(`Nouns must be exactly 15. Current: ${counts.nouns}.`);
  if (counts.total !== 45) errors.push(`Topic must contain exactly 45 active words. Current: ${counts.total}.`);
  return {
    canPublish: errors.length === 0,
    counts,
    errors,
    warnings: getTopicWords(topicId)
      .filter((word) => !word.audio_url || !word.image_url)
      .slice(0, 6)
      .map((word) => `${word.word_en} has optional media missing.`),
  };
}

function calculateTopicProgress(topicId: string, userId: string): VocabularyTopicProgress {
  const progress = getUserProgressMap(userId);
  const knownWords = getTopicWords(topicId).filter((word) => progress.get(word.id)?.status === "known");
  const knownVerbs = knownWords.filter((word) => word.part_of_speech === "verb").length;
  const knownAdjectives = knownWords.filter((word) => word.part_of_speech === "adjective").length;
  const knownNouns = knownWords.filter((word) => word.part_of_speech === "noun").length;
  const totalKnown = knownWords.length;
  const tests = getTopicTestStatus(topicId, userId);
  const passedCount = [
    tests.verbsPassed,
    tests.adjectivesPassed,
    tests.nounsPassed,
    tests.mixedPassed,
  ].filter(Boolean).length;
  const completionPercentage = Math.round(((totalKnown + passedCount) / 49) * 100);
  const unlocked = isTopicUnlocked(topicId, userId);
  const completed = isTopicCompleted(topicId, userId);
  const mastered = isTopicMastered(topicId, userId);
  const needsReview = completed && getTopicWords(topicId).some((word) => progress.get(word.id)?.status === "review");
  const hasStarted =
    totalKnown > 0 ||
    [...testAttempts.values()].some((attempt) => attempt.userId === userId && attempt.topicId === topicId);
  return {
    knownVerbs,
    knownAdjectives,
    knownNouns,
    totalKnown,
    completionPercentage: Math.max(0, Math.min(100, completionPercentage)),
    state: !unlocked
      ? "locked"
      : mastered
        ? "mastered"
        : needsReview
          ? "needs_review"
          : completed
            ? "completed"
            : hasStarted
              ? "in_progress"
              : "available",
    unlocked,
    lockedReason: unlocked ? undefined : "Master the previous topic with at least 80% to unlock this one.",
    tests,
    rewards: completed || mastered ? { xp: 40, coins: 20, badge: "Topic Completed" } : undefined,
  };
}

function getTopicTestStatus(topicId: string, userId: string) {
  const attempts = [...testAttempts.values()].filter((attempt) => attempt.userId === userId && attempt.topicId === topicId);
  return {
    verbsPassed: attempts.some((attempt) => attempt.partOfSpeech === "verb" && attempt.status === "completed" && attempt.percentage >= 80),
    adjectivesPassed: attempts.some((attempt) => attempt.partOfSpeech === "adjective" && attempt.status === "completed" && attempt.percentage >= 80),
    nounsPassed: attempts.some((attempt) => attempt.partOfSpeech === "noun" && attempt.status === "completed" && attempt.percentage >= 80),
    mixedPassed: attempts.some((attempt) => attempt.testType === "mixed_topic" && attempt.status === "completed" && attempt.percentage >= 80),
  };
}

function isTopicUnlocked(topicId: string, userId: string) {
  const ordered = orderedVocabularyTopics();
  const index = ordered.findIndex((topic) => topic.id === topicId);
  if (index <= 0) return true;
  const previous = ordered[index - 1];
  return previous ? isTopicMastered(previous.id, userId) : false;
}

function assertTopicUnlocked(topic: VocabularyTopic, userId: string) {
  if (isTopicUnlocked(topic.id, userId)) return;
  const error = new Error("VOCABULARY_TOPIC_LOCKED");
  error.message = "Previous topic not completed.";
  throw error;
}

function syncTopicUnlocks(userId: string, topicId: string) {
  if (!isTopicMastered(topicId, userId)) return;
  const topic = topicsById(topicId);
  if (!topic) return;
  grantRewardOnce(userId, `vocabulary:topic:${topic.id}:completed`, 40);
}

function orderedVocabularyTopics() {
  return [...topics.values()]
    .filter((topic) => topic.is_published)
    .sort((a, b) => a.order_index - b.order_index);
}

function withState(word: VocabularyWord, userId: string): VocabularyWordWithState {
  return {
    ...word,
    progress: getUserProgressMap(userId).get(word.id) ?? newProgress(word.id),
    favorite: getUserFavorites(userId).has(word.id),
    topicSlug: topicsById(word.topic_id)?.slug ?? FIRST_A1_TOPIC_SLUG,
  };
}

function updateProgress(progress: VocabularyWordProgress, action: "known" | "review"): VocabularyWordProgress {
  const confidenceLevel =
    action === "known"
      ? Math.min(5, progress.confidenceLevel + 1)
      : Math.max(0, progress.confidenceLevel - 1);
  const nowDate = new Date();
  return {
    ...progress,
    status: action === "known" && confidenceLevel >= 3 ? "known" : action === "known" ? "learning" : "review",
    confidenceLevel,
    timesSeen: progress.timesSeen + 1,
    timesCorrect: progress.timesCorrect + (action === "known" ? 1 : 0),
    timesIncorrect: progress.timesIncorrect + (action === "review" ? 1 : 0),
    firstLearnedAt: progress.firstLearnedAt ?? nowDate.toISOString(),
    masteredAt: action === "known" && confidenceLevel >= 3 ? nowDate.toISOString() : progress.masteredAt,
    lastReviewedAt: nowDate.toISOString(),
    nextReviewAt: addDays(nowDate, reviewIntervalDays(confidenceLevel)).toISOString(),
  };
}

function updateDailyActivity(userId: string, wordId: string, action: "known" | "review") {
  const activity = getDailyActivity(userId);
  activity.cardsViewed += 1;
  if (!activity.countedWordIds.has(wordId)) {
    activity.countedWordIds.add(wordId);
    if (action === "known") activity.learnedToday += 1;
    if (action === "review") activity.reviewedToday += 1;
  }
  activity.completed = activity.learnedToday + activity.reviewedToday >= activity.target;
  if (activity.completed && !activity.rewardGranted) {
    activity.xpEarned += 20;
    activity.rewardGranted = true;
  }
}

function pickDailyWord(activeWords: VocabularyWord[], userId: string) {
  if (!activeWords.length) return null;
  const dateKey = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const seed = [...dateKey].reduce((sum, char) => sum + char.charCodeAt(0), userId.length);
  return activeWords[seed % activeWords.length] ?? activeWords[0];
}

async function getCurrentUserId() {
  const dashboard = await getDashboardAccount();
  return dashboard.account.id || "guest";
}

async function requireAdmin() {
  const dashboard = await getDashboardAccount();
  if (dashboard.account.role !== "admin") throw new Error("ADMIN_REQUIRED");
}

function getUserProgressMap(userId: string) {
  if (!progressByUser.has(userId)) {
    progressByUser.set(userId, new Map());
  }
  return progressByUser.get(userId)!;
}

function getUserFavorites(userId: string) {
  if (!favoritesByUser.has(userId)) {
    favoritesByUser.set(userId, new Set());
  }
  return favoritesByUser.get(userId)!;
}

function getDailyActivity(userId: string) {
  const date = new Date().toISOString().slice(0, 10);
  const key = `${userId}:${date}`;
  if (!todayActivityByUser.has(key)) {
    todayActivityByUser.set(key, {
      date,
      target: 10,
      learnedToday: 0,
      reviewedToday: 0,
      cardsViewed: 0,
      completed: false,
      xpEarned: 0,
      countedWordIds: new Set(),
      rewardGranted: false,
    });
  }
  return todayActivityByUser.get(key)!;
}

function publicDailyGoal(activity: DailyActivity): VocabularyDailyGoal {
  return {
    target: activity.target,
    learnedToday: activity.learnedToday,
    reviewedToday: activity.reviewedToday,
    cardsViewed: activity.cardsViewed,
    completed: activity.completed,
    xpEarned: activity.xpEarned,
  };
}

function newProgress(wordId: string): VocabularyWordProgress {
  return {
    wordId,
    status: "new",
    confidenceLevel: 0,
    timesSeen: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
  };
}

function reviewIntervalDays(confidenceLevel: number) {
  return [0, 1, 3, 7, 14, 30][confidenceLevel] ?? 0;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeWord(word: string) {
  return word.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function partOrder(part: VocabularyPartOfSpeech) {
  return part === "verb" ? 1 : part === "adjective" ? 2 : 3;
}

function validateWordInput(input: Omit<VocabularyWord, "id" | "created_at" | "updated_at">) {
  if (!topicsById(input.topic_id)) return "TOPIC_NOT_FOUND";
  if (!input.word_en.trim()) return "WORD_REQUIRED";
  if (!input.translation_kk.trim()) return "TRANSLATION_KK_REQUIRED";
  if (!input.translation_ru.trim()) return "TRANSLATION_RU_REQUIRED";
  if (!["verb", "adjective", "noun"].includes(input.part_of_speech)) return "INVALID_PART_OF_SPEECH";
  if (input.order_index < 1 || input.order_index > 15) return "ORDER_INDEX_INVALID";
  return null;
}

function topicsById(topicId: string) {
  return [...topics.values()].find((topic) => topic.id === topicId);
}

function seedA1VocabularyModule() {
  a1VocabularyTopics.forEach((topic, topicIndex) => {
    topics.set(topic.slug, {
      id: `vocab-topic-${topic.slug}`,
      slug: topic.slug,
      title_en: topic.title_en,
      title_kk: topic.title_kk,
      title_ru: topic.title_ru,
      description_en: topic.description_en,
      description_kk: topic.description_kk,
      description_ru: topic.description_ru,
      icon: topic.icon,
      difficulty: "beginner",
      order_index: topicIndex + 1,
      is_published: true,
      is_featured: topicIndex < 3,
      created_at: now,
      updated_at: now,
    });

    seedA1Words(topic.slug, "verb", topic.verbs);
    seedA1Words(topic.slug, "adjective", topic.adjectives);
    seedA1Words(topic.slug, "noun", topic.nouns);
  });
}

function seedA1Words(topicSlug: string, part: VocabularyPartOfSpeech, data: A1VocabularyWordSeed[]) {
  const topic = topics.get(topicSlug);
  if (!topic) return;

  data.forEach((item, index) => {
    const wordId = `a1-${topic.slug}-${part}-${index + 1}`;
    const word: VocabularyWord = {
      id: wordId,
      topic_id: topic.id,
      word_en: item.en,
      translation_kk: item.kk,
      translation_ru: item.ru,
      part_of_speech: part,
      pronunciation: undefined,
      phonetic_ipa: undefined,
      example_en: buildA1Example(item.en, part),
      example_kk: buildA1KazakhExample(item.kk),
      example_ru: buildA1RussianExample(item.ru),
      difficulty: "A1",
      order_index: index + 1,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    words.set(word.id, word);
  });
}

function buildA1Example(word: string, part: VocabularyPartOfSpeech) {
  if (part === "verb") return `I learn how to use the action word "${word}" today.`;
  if (part === "adjective") return `The word "${word}" helps me describe something.`;
  return `I learn the word "${word}" in my English lesson.`;
}

function buildA1KazakhExample(translation: string) {
  return `Бұл сөздің мағынасы: ${translation}.`;
}

function buildA1RussianExample(translation: string) {
  return `Значение этого слова: ${translation}.`;
}
