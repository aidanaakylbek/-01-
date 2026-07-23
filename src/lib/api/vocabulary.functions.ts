import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createAdminVocabularyTopic,
  answerVocabularyTest,
  completeVocabularyGame,
  completeVocabularyTest,
  getAdminVocabularyTopics,
  getVocabularyAIResponse,
  getVocabularyAnalytics,
  getVocabularyGamesConfig,
  getVocabularyOverview,
  getVocabularyTopic,
  getVocabularyTestResult,
  getVocabularyWeakWords,
  saveAdminVocabularyWord,
  saveVocabularyProgress,
  searchVocabulary,
  startPersonalizedVocabularyReview,
  startVocabularyGame,
  startVocabularyMixedTest,
  startVocabularySectionTest,
  toggleVocabularyFavorite,
} from "../vocabulary.server";

const partOfSpeechSchema = z.enum(["verb", "adjective", "noun"]);
const wordDifficultySchema = z.enum(["A1", "beginner", "intermediate"]);
const gameTypeSchema = z.enum([
  "match_pairs",
  "memory",
  "drag_drop",
  "listen_choose",
  "type_word",
  "unscramble",
  "image_to_word",
  "word_to_image",
  "speed_round",
  "sentence_builder",
]);

export const getVocabularyOverviewFn = createServerFn({ method: "GET" }).handler(async () => {
  return getVocabularyOverview();
});

export const getVocabularyTopicFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return getVocabularyTopic(data.slug);
  });

export const searchVocabularyFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      query: z.string().default(""),
      partOfSpeech: partOfSpeechSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    return searchVocabulary(data.query, data.partOfSpeech);
  });

export const saveVocabularyProgressFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      wordId: z.string().min(1),
      action: z.enum(["known", "review"]),
    }),
  )
  .handler(async ({ data }) => {
    return saveVocabularyProgress(data);
  });

export const toggleVocabularyFavoriteFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ wordId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return toggleVocabularyFavorite(data.wordId);
  });

export const getAdminVocabularyTopicsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getAdminVocabularyTopics();
});

export const createAdminVocabularyTopicFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string().min(2),
      title_en: z.string().min(1),
      title_kk: z.string().min(1),
      title_ru: z.string().min(1),
      difficulty: z.enum(["beginner", "intermediate", "mixed"]),
    }),
  )
  .handler(async ({ data }) => {
    return createAdminVocabularyTopic(data);
  });

export const saveAdminVocabularyWordFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic_id: z.string().min(1),
      word_en: z.string().min(1),
      translation_kk: z.string().min(1),
      translation_ru: z.string().min(1),
      part_of_speech: partOfSpeechSchema,
      pronunciation: z.string().optional(),
      phonetic_ipa: z.string().optional(),
      audio_url: z.string().optional(),
      image_url: z.string().optional(),
      image_prompt: z.string().optional(),
      example_en: z.string().optional(),
      example_kk: z.string().optional(),
      example_ru: z.string().optional(),
      difficulty: wordDifficultySchema,
      order_index: z.number().int().min(1).max(15),
      is_active: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    return saveAdminVocabularyWord(data);
  });

export const startVocabularySectionTestFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ topicSlug: z.string().min(1), partOfSpeech: partOfSpeechSchema }))
  .handler(async ({ data }) => startVocabularySectionTest(data));

export const startVocabularyMixedTestFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ topicSlug: z.string().min(1) }))
  .handler(async ({ data }) => startVocabularyMixedTest(data.topicSlug));

export const answerVocabularyTestFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      attemptId: z.string().min(1),
      questionId: z.string().min(1),
      answer: z.string(),
      responseTimeMs: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => answerVocabularyTest(data));

export const completeVocabularyTestFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ attemptId: z.string().min(1) }))
  .handler(async ({ data }) => completeVocabularyTest(data.attemptId));

export const getVocabularyTestResultFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ attemptId: z.string().min(1) }))
  .handler(async ({ data }) => getVocabularyTestResult(data.attemptId));

export const getVocabularyWeakWordsFn = createServerFn({ method: "GET" }).handler(async () => getVocabularyWeakWords());

export const startPersonalizedVocabularyReviewFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ size: z.number().int().min(5).max(20).default(10) }))
  .handler(async ({ data }) => startPersonalizedVocabularyReview(data.size));

export const getVocabularyGamesConfigFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ topicSlug: z.string().optional() }))
  .handler(async ({ data }) => getVocabularyGamesConfig(data.topicSlug));

export const startVocabularyGameFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      gameType: gameTypeSchema,
      topicSlug: z.string().optional(),
      partOfSpeech: partOfSpeechSchema.optional(),
      mode: z.enum(["easy", "normal", "challenge"]).default("normal"),
    }),
  )
  .handler(async ({ data }) => startVocabularyGame(data));

export const completeVocabularyGameFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sessionId: z.string().min(1),
      correctItems: z.number().int().min(0),
      incorrectItems: z.number().int().min(0),
      hintsUsed: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ data }) => completeVocabularyGame(data.sessionId, data.correctItems, data.incorrectItems, data.hintsUsed));

export const getVocabularyAIResponseFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      message: z.string().min(1),
      topicSlug: z.string().optional(),
      wordId: z.string().optional(),
      partOfSpeech: partOfSpeechSchema.optional(),
    }),
  )
  .handler(async ({ data }) => getVocabularyAIResponse(data));

export const getVocabularyAnalyticsFn = createServerFn({ method: "GET" }).handler(async () => getVocabularyAnalytics());
