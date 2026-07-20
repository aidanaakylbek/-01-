import { getDashboardAccount } from "./account-store.server";

export type VocabularyLanguage = "KZ" | "RU" | "EN";
export type VocabularyDifficulty = "beginner" | "intermediate" | "mixed";
export type VocabularyWordDifficulty = "beginner" | "intermediate";
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
  state: "not_started" | "in_progress" | "completed";
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
};

export type VocabularyQuestion = {
  id: string;
  topicId: string;
  wordId: string;
  partOfSpeech: VocabularyPartOfSpeech;
  questionType: VocabularyQuestionType;
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
const familyTopicId = "vocab-topic-family";
const todayActivityByUser = new Map<string, DailyActivity>();
const progressByUser = new Map<string, Map<string, VocabularyWordProgress>>();
const favoritesByUser = new Map<string, Set<string>>();
const testAttempts = new Map<string, VocabularyTestAttempt>();
const gameSessions = new Map<string, VocabularyGameSession>();
const rewardedKeysByUser = new Map<string, Set<string>>();

const topics = new Map<string, VocabularyTopic>([
  [
    "family",
    {
      id: familyTopicId,
      slug: "family",
      title_en: "Family",
      title_kk: "Отбасы",
      title_ru: "Семья",
      description_en: "Useful everyday words about family and home.",
      description_kk: "Отбасы мен үй туралы күнделікті қажет сөздер.",
      description_ru: "Полезные слова о семье и доме.",
      icon: "family_restroom",
      difficulty: "mixed",
      order_index: 1,
      is_published: true,
      is_featured: true,
      created_at: now,
      updated_at: now,
    },
  ],
]);

const words = new Map<string, VocabularyWord>();

seedFamilyWords();

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

  const progressMap = getUserProgressMap(userId);
  const previous = progressMap.get(input.wordId) ?? newProgress(input.wordId);
  const next = updateProgress(previous, input.action);
  progressMap.set(input.wordId, next);
  updateDailyActivity(userId, input.wordId, input.action);
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
  const sectionWords = getTopicWords(topic.id).filter((word) => word.part_of_speech === input.partOfSpeech);
  if (sectionWords.length !== 15) throw new Error("SECTION_NOT_READY");

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
  const topicWords = getTopicWords(topic.id);
  const questions = shuffle([
    ...buildSectionQuestions(topic.id, topicWords.filter((word) => word.part_of_speech === "verb"), "verb").slice(0, 5),
    ...buildSectionQuestions(
      topic.id,
      topicWords.filter((word) => word.part_of_speech === "adjective"),
      "adjective",
    ).slice(0, 5),
    ...buildSectionQuestions(topic.id, topicWords.filter((word) => word.part_of_speech === "noun"), "noun").slice(0, 5),
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
}) {
  const userId = await getCurrentUserId();
  const attempt = getOwnedAttempt(userId, input.attemptId);
  if (attempt.status !== "in_progress") throw new Error("ATTEMPT_COMPLETED");
  const question = attempt.questions.find((item) => item.id === input.questionId);
  if (!question) throw new Error("QUESTION_NOT_FOUND");
  if (attempt.answers.some((answer) => answer.questionId === question.id)) {
    return attempt;
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
  const topic = topicSlug ? topics.get(topicSlug) : topics.get("family");
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
  const topic = topics.get(input.topicSlug ?? "family");
  if (!topic) throw new Error("TOPIC_NOT_FOUND");
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
  const topic = input.topicSlug ? topics.get(input.topicSlug) : topics.get("family");
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
    .filter((topic) => topic.is_published && isTopicPublishable(topic.id).canPublish)
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
  const templates: VocabularyQuestionType[] =
    partOfSpeech === "verb"
      ? ["translation_choice", "sentence_completion", "listening_choice", "type_word", "context_choice"]
      : partOfSpeech === "adjective"
        ? ["translation_choice", "sentence_completion", "antonym_choice", "type_word", "listening_choice"]
        : ["translation_choice", "sentence_completion", "type_word", "listening_choice", "context_choice"];
  const picked = shuffle(sectionWords).slice(0, 10);
  return picked.map((word, index) => buildQuestion(topicId, word, templates[index % templates.length]!, sectionWords));
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
  const sentence = word.example_en || `I use the word ${word.word_en}.`;
  const blankSentence = sentence.replace(new RegExp(`\\b${escapeRegExp(word.word_en)}\\b`, "i"), "_____");
  const questionText =
    questionType === "type_word"
      ? {
          KZ: `"${translationKk}" сөзін ағылшынша жаз.`,
          RU: `Напиши по-английски слово "${translationRu}".`,
          EN: `Type the English word for "${translationKk}".`,
        }
      : questionType === "sentence_completion"
        ? {
            KZ: `Сөйлемді толықтыр: ${blankSentence}`,
            RU: `Заполни пропуск: ${blankSentence}`,
            EN: `Complete the sentence: ${blankSentence}`,
          }
        : questionType === "listening_choice"
          ? {
              KZ: "Тыңдап, дұрыс сөзді таңда.",
              RU: "Послушай и выбери правильное слово.",
              EN: "Listen and choose the correct word.",
            }
          : questionType === "antonym_choice"
            ? {
                KZ: `"${word.word_en}" сөзіне ең жақын мағынаны таңда.`,
                RU: `Выбери значение слова "${word.word_en}".`,
                EN: `Choose the meaning of "${word.word_en}".`,
              }
            : questionType === "context_choice"
              ? {
                  KZ: `Қай сөз осы жағдайға сәйкес келеді: ${word.example_kk ?? translationKk}`,
                  RU: `Какое слово подходит к ситуации: ${word.example_ru ?? translationRu}`,
                  EN: `Which word fits this situation: ${sentence}`,
                }
              : {
                  KZ: `"${word.word_en}" сөзінің дұрыс аудармасын таңда.`,
                  RU: `Выбери правильный перевод слова "${word.word_en}".`,
                  EN: `Choose the correct translation for "${word.word_en}".`,
                };
  const correctAnswer = questionType === "type_word" || questionType === "listening_choice" ? word.word_en : translationKk;
  return {
    id: createId("vocab-question"),
    topicId,
    wordId: word.id,
    partOfSpeech: word.part_of_speech,
    questionType,
    questionText,
    options: questionType === "type_word" ? [] : questionType === "listening_choice" ? options.map((item) => item.word_en) : options.map((item) => item.translation_kk),
    correctAnswer,
    explanation: {
      KZ: `Дұрыс жауап: ${word.word_en}. Мағынасы: ${translationKk}.`,
      RU: `Правильный ответ: ${word.word_en}. Значение: ${translationRu}.`,
      EN: `Correct answer: ${word.word_en}. Meaning: ${translationKk}.`,
    },
    promptAudioText: questionType === "listening_choice" ? word.word_en : undefined,
    promptImageUrl: questionType === "image_choice" ? word.image_url : undefined,
  };
}

function buildOptions(word: VocabularyWord, pool: VocabularyWord[]) {
  const distractors = shuffle(pool.filter((item) => item.id !== word.id)).slice(0, 3);
  return shuffle([word, ...distractors]);
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
  if (attempt.testType === "mixed_topic") return attempt.percentage >= 90 ? 60 : attempt.percentage >= 70 ? 40 : 10;
  return attempt.percentage >= 90 ? 30 : attempt.percentage >= 70 ? 20 : 5;
}

function resultState(percentage: number): VocabularyTestResult["resultState"] {
  if (percentage >= 90) return "excellent";
  if (percentage >= 70) return "passed";
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
  const passedMixed = attempts.some((attempt) => attempt.testType === "mixed_topic" && attempt.status === "completed" && attempt.percentage >= 70);
  const parts: VocabularyPartOfSpeech[] = ["verb", "adjective", "noun"];
  const passedParts = parts.every((part) =>
    attempts.some((attempt) => attempt.partOfSpeech === part && attempt.status === "completed" && attempt.percentage >= 70),
  );
  return passedMixed && passedParts;
}

function isTopicMastered(topicId: string, userId: string) {
  const attempts = [...testAttempts.values()].filter((attempt) => attempt.userId === userId && attempt.topicId === topicId);
  const mixed90 = attempts.some((attempt) => attempt.testType === "mixed_topic" && attempt.status === "completed" && attempt.percentage >= 90);
  const highConfidence = getTopicWords(topicId).every((word) => (getUserProgressMap(userId).get(word.id)?.confidenceLevel ?? 0) >= 4);
  return mixed90 && highConfidence;
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
  const completionPercentage = Math.round((totalKnown / 45) * 100);
  return {
    knownVerbs,
    knownAdjectives,
    knownNouns,
    totalKnown,
    completionPercentage,
    state: totalKnown === 0 ? "not_started" : totalKnown >= 45 ? "completed" : "in_progress",
  };
}

function withState(word: VocabularyWord, userId: string): VocabularyWordWithState {
  return {
    ...word,
    progress: getUserProgressMap(userId).get(word.id) ?? newProgress(word.id),
    favorite: getUserFavorites(userId).has(word.id),
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

function seedFamilyWords() {
  const verbData = [
    ["love", "жақсы көру", "любить", "beginner", "I love my family.", "Мен отбасымды жақсы көремін.", "Я люблю свою семью."],
    ["help", "көмектесу", "помогать", "beginner", "I help my mother at home.", "Мен анама үйде көмектесемін.", "Я помогаю маме дома."],
    ["live", "тұру", "жить", "beginner", "We live with our parents.", "Біз ата-анамызбен бірге тұрамыз.", "Мы живем с родителями."],
    ["visit", "қонаққа бару", "навещать", "beginner", "We visit our grandparents on Sunday.", "Біз жексенбіде ата-әжемізге барамыз.", "Мы навещаем бабушку и дедушку в воскресенье."],
    ["care", "қамқор болу", "заботиться", "intermediate", "Parents care for their children.", "Ата-аналар балаларына қамқор болады.", "Родители заботятся о своих детях."],
    ["support", "қолдау", "поддерживать", "intermediate", "My brother supports me.", "Ағам мені қолдайды.", "Мой брат поддерживает меня."],
    ["talk", "сөйлесу", "разговаривать", "beginner", "I talk with my sister every day.", "Мен әпкеммен күн сайын сөйлесемін.", "Я разговариваю с сестрой каждый день."],
    ["listen", "тыңдау", "слушать", "beginner", "I listen to my father.", "Мен әкемді тыңдаймын.", "Я слушаю папу."],
    ["share", "бөлісу", "делиться", "intermediate", "We share food at home.", "Біз үйде тамақты бөлісеміз.", "Мы делимся едой дома."],
    ["respect", "құрметтеу", "уважать", "intermediate", "Children respect their parents.", "Балалар ата-анасын құрметтейді.", "Дети уважают родителей."],
    ["protect", "қорғау", "защищать", "intermediate", "My family protects me.", "Отбасым мені қорғайды.", "Моя семья защищает меня."],
    ["celebrate", "атап өту", "праздновать", "beginner", "We celebrate birthdays together.", "Біз туған күндерді бірге атап өтеміз.", "Мы празднуем дни рождения вместе."],
    ["grow", "өсу", "расти", "beginner", "Children grow fast.", "Балалар тез өседі.", "Дети быстро растут."],
    ["remember", "есте сақтау", "помнить", "beginner", "I remember my grandmother's stories.", "Мен әжемнің әңгімелерін есте сақтаймын.", "Я помню рассказы бабушки."],
    ["meet", "кездесу", "встречаться", "beginner", "We meet our cousins in summer.", "Біз жазда немере туыстарымызбен кездесеміз.", "Летом мы встречаемся с двоюродными родственниками."],
  ] as const;

  const adjectiveData = [
    ["kind", "мейірімді", "добрый", "beginner", "My sister is very kind.", "Менің әпкем өте мейірімді.", "Моя сестра очень добрая."],
    ["caring", "қамқор", "заботливый", "intermediate", "My mother is caring.", "Менің анам қамқор.", "Моя мама заботливая."],
    ["friendly", "достық пейілді", "дружелюбный", "beginner", "My cousin is friendly.", "Менің немере туысым достық пейілді.", "Мой двоюродный брат дружелюбный."],
    ["young", "жас", "молодой", "beginner", "My brother is young.", "Менің інім жас.", "Мой брат молодой."],
    ["old", "қарт / үлкен", "старый", "beginner", "My grandfather is old.", "Менің атам қарт.", "Мой дедушка старый."],
    ["happy", "бақытты", "счастливый", "beginner", "Our family is happy.", "Біздің отбасымыз бақытты.", "Наша семья счастливая."],
    ["close", "жақын", "близкий", "beginner", "I am close to my sister.", "Мен әпкеме жақынмын.", "Я близок к своей сестре."],
    ["helpful", "көмекшіл", "готовый помочь", "intermediate", "My uncle is helpful.", "Менің көкем көмекшіл.", "Мой дядя готов помочь."],
    ["strict", "қатал", "строгий", "beginner", "My father can be strict.", "Менің әкем кейде қатал болады.", "Мой отец иногда строгий."],
    ["funny", "көңілді / күлкілі", "смешной", "beginner", "My aunt is funny.", "Менің татем көңілді.", "Моя тетя смешная."],
    ["quiet", "тыныш", "тихий", "beginner", "My baby brother is quiet.", "Менің кішкентай інім тыныш.", "Мой младший брат тихий."],
    ["busy", "бос емес", "занятый", "beginner", "My parents are busy today.", "Ата-анам бүгін бос емес.", "Мои родители сегодня заняты."],
    ["loving", "сүйіспеншілікке толы", "любящий", "intermediate", "I have a loving family.", "Менің отбасым сүйіспеншілікке толы.", "У меня любящая семья."],
    ["responsible", "жауапты", "ответственный", "intermediate", "My older brother is responsible.", "Менің ағам жауапты.", "Мой старший брат ответственный."],
    ["patient", "сабырлы", "терпеливый", "intermediate", "My grandmother is patient.", "Менің әжем сабырлы.", "Моя бабушка терпеливая."],
  ] as const;

  const nounData = [
    ["family", "отбасы", "семья", "beginner", "I have a big family.", "Менің отбасым үлкен.", "У меня большая семья."],
    ["mother", "ана", "мама", "beginner", "My mother cooks dinner.", "Менің анам кешкі ас дайындайды.", "Моя мама готовит ужин."],
    ["father", "әке", "папа", "beginner", "My father helps me.", "Менің әкем маған көмектеседі.", "Мой папа помогает мне."],
    ["parents", "ата-ана", "родители", "beginner", "My parents support me.", "Ата-анам мені қолдайды.", "Мои родители поддерживают меня."],
    ["sister", "әпке / сіңлі / қарындас", "сестра", "beginner", "My sister likes books.", "Менің әпкем кітаптарды ұнатады.", "Моя сестра любит книги."],
    ["brother", "аға / іні", "брат", "beginner", "My brother plays football.", "Менің ағам футбол ойнайды.", "Мой брат играет в футбол."],
    ["grandmother", "әже", "бабушка", "beginner", "My grandmother tells stories.", "Менің әжем әңгіме айтады.", "Моя бабушка рассказывает истории."],
    ["grandfather", "ата", "дедушка", "beginner", "My grandfather has a garden.", "Менің атамның бағы бар.", "У моего дедушки есть сад."],
    ["child", "бала", "ребёнок", "beginner", "The child is happy.", "Бала бақытты.", "Ребёнок счастлив."],
    ["children", "балалар", "дети", "beginner", "The children play together.", "Балалар бірге ойнайды.", "Дети играют вместе."],
    ["cousin", "немере туыс", "двоюродный брат / двоюродная сестра", "intermediate", "My cousin lives nearby.", "Менің немере туысым жақын жерде тұрады.", "Мой двоюродный родственник живет рядом."],
    ["uncle", "көке / нағашы / ағай", "дядя", "intermediate", "My uncle visits us.", "Менің көкем бізге қонаққа келеді.", "Мой дядя навещает нас."],
    ["aunt", "тәте / апай", "тётя", "intermediate", "My aunt is kind.", "Менің татем мейірімді.", "Моя тетя добрая."],
    ["home", "үй", "дом", "beginner", "Our home is warm.", "Біздің үйіміз жылы.", "Наш дом теплый."],
    ["relationship", "қарым-қатынас", "отношения", "intermediate", "Good relationships make a family strong.", "Жақсы қарым-қатынас отбасын мықты етеді.", "Хорошие отношения делают семью крепкой."],
  ] as const;

  addSeedWords("verb", verbData);
  addSeedWords("adjective", adjectiveData);
  addSeedWords("noun", nounData);
}

function addSeedWords(
  part: VocabularyPartOfSpeech,
  data: readonly (readonly [string, string, string, VocabularyWordDifficulty, string, string, string])[],
) {
  data.forEach(([word_en, translation_kk, translation_ru, difficulty, example_en, example_kk, example_ru], index) => {
    const word: VocabularyWord = {
      id: `family-${part}-${index + 1}`,
      topic_id: familyTopicId,
      word_en,
      translation_kk,
      translation_ru,
      part_of_speech: part,
      pronunciation: `/${word_en}/`,
      phonetic_ipa: undefined,
      example_en,
      example_kk,
      example_ru,
      difficulty,
      order_index: index + 1,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    words.set(word.id, word);
  });
}
