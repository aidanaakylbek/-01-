import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createAdminVocabularyTopic,
  getAdminVocabularyTopics,
  getVocabularyOverview,
  getVocabularyTopic,
  saveAdminVocabularyWord,
  saveVocabularyProgress,
  searchVocabulary,
  toggleVocabularyFavorite,
} from "../vocabulary.server";

const partOfSpeechSchema = z.enum(["verb", "adjective", "noun"]);
const wordDifficultySchema = z.enum(["beginner", "intermediate"]);

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
