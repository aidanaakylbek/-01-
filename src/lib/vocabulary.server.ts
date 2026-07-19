import { getDashboardAccount } from "./account-store.server";

export type VocabularyLanguage = "KZ" | "RU" | "EN";
export type VocabularyDifficulty = "beginner" | "intermediate" | "mixed";
export type VocabularyWordDifficulty = "beginner" | "intermediate";
export type VocabularyPartOfSpeech = "verb" | "adjective" | "noun";
export type VocabularyProgressStatus = "new" | "learning" | "review" | "known";

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
