import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { VocabularyTestResultCard, VocabularyTestRunner } from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import {
  answerVocabularyTestFn,
  completeVocabularyTestFn,
  startVocabularySectionTestFn,
} from "@/lib/api/vocabulary.functions";
import type {
  VocabularyLanguage,
  VocabularyPartOfSpeech,
  VocabularyQuestion,
  VocabularyTestAttempt,
  VocabularyTestResult,
} from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary/$topicSlug/test/$partOfSpeech")({
  loader: async ({ params }) => {
    return startVocabularySectionTestFn({
      data: {
        topicSlug: params.topicSlug,
        partOfSpeech: params.partOfSpeech as VocabularyPartOfSpeech,
      },
    });
  },
  head: () => ({ meta: [{ title: "Vocabulary Test — AI-Sana" }] }),
  component: VocabularySectionTestPage,
});

function VocabularySectionTestPage() {
  const initialAttempt = Route.useLoaderData();
  const { language } = useLanguage();
  const lang = language as VocabularyLanguage;
  const [attempt, setAttempt] = useState<VocabularyTestAttempt>(initialAttempt);
  const [result, setResult] = useState<VocabularyTestResult | null>(null);
  const [saving, setSaving] = useState(false);

  const answer = async (question: VocabularyQuestion, rawAnswer: string, responseTimeMs: number) => {
    setSaving(true);
    try {
      const response = await answerVocabularyTestFn({
        data: { attemptId: attempt.id, questionId: question.id, answer: rawAnswer, responseTimeMs },
      });
      setAttempt(response.attempt);
      return response;
    } finally {
      setSaving(false);
    }
  };

  const complete = async () => {
    setSaving(true);
    try {
      setResult(await completeVocabularyTestFn({ data: { attemptId: attempt.id } }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GameLayout>
      <div className="space-y-5">
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] to-[#6D28D9] text-white">
          <Link to="/vocabulary/$topicSlug" params={{ topicSlug: attempt.topicSlug }} className="font-black text-[#FACC15]">
            ← Тақырыпқа қайту
          </Link>
          <h1 className="mt-4 text-5xl font-black">Section Test</h1>
          <p className="mt-2 font-bold text-[#EDE9FE]">10 сұрақ · өту балы 80%</p>
        </GameCard>
        {result ? (
          <VocabularyTestResultCard language={lang} result={result} />
        ) : (
          <VocabularyTestRunner
            language={lang}
            attempt={attempt}
            saving={saving}
            onAnswer={answer}
            onComplete={complete}
          />
        )}
      </div>
    </GameLayout>
  );
}
