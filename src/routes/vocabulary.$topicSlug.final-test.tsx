import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { GameCard, GameLayout } from "@/components/gamified-platform";
import { VocabularyTestResultCard, VocabularyTestRunner } from "@/components/vocabulary-ui";
import { useLanguage } from "@/hooks/use-language";
import {
  answerVocabularyTestFn,
  completeVocabularyTestFn,
  startVocabularyMixedTestFn,
} from "@/lib/api/vocabulary.functions";
import type { VocabularyLanguage, VocabularyQuestion, VocabularyTestAttempt, VocabularyTestResult } from "@/lib/vocabulary.server";

export const Route = createFileRoute("/vocabulary/$topicSlug/final-test")({
  loader: async ({ params }) => startVocabularyMixedTestFn({ data: { topicSlug: params.topicSlug } }),
  head: () => ({ meta: [{ title: "Mixed Vocabulary Test — AI-Sana" }] }),
  component: VocabularyFinalTestPage,
});

function VocabularyFinalTestPage() {
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
        <GameCard className="bg-gradient-to-br from-[#1E1B4B] via-[#6D28D9] to-[#FACC15] text-white">
          <Link to="/vocabulary/$topicSlug" params={{ topicSlug: attempt.topicSlug }} className="font-black text-[#FACC15]">
            ← Тақырыпқа қайту
          </Link>
          <h1 className="mt-4 text-5xl font-black">Mixed Topic Test</h1>
          <p className="mt-2 font-bold text-[#EDE9FE]">15 сұрақ: 5 verb, 5 adjective, 5 noun.</p>
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
