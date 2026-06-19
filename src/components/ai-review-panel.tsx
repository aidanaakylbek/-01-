import { useState } from "react";

type ReviewLanguage = "KZ" | "RU" | "EN";

type ReviewPayload = {
  taskTitle: string;
  taskType: "task" | "test" | "diagnostic";
  subject: string;
  score: number;
  totalQuestions?: number;
  correctAnswers?: number;
  weakTopics?: string[];
  attempts?: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    topic?: string;
    explanation?: string;
  }[];
  language: ReviewLanguage;
};

type AIReviewPanelProps = {
  buttonLabel: string;
  payload: ReviewPayload;
};

const errorCopy = {
  KZ: "AI разбор қазір қолжетімсіз. Біраздан кейін қайталап көріңіз.",
  RU: "AI-разбор сейчас недоступен. Попробуйте еще раз чуть позже.",
  EN: "AI review is not available right now. Please try again soon.",
};

const loadingCopy = {
  KZ: "AI талдап жатыр...",
  RU: "AI анализирует...",
  EN: "AI analyzing...",
};

const titleCopy = {
  KZ: "AI разбор",
  RU: "AI-разбор",
  EN: "AI Review",
};

export function AIReviewPanel({ buttonLabel, payload }: AIReviewPanelProps) {
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestReview = async () => {
    setIsLoading(true);
    setReview("");

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { review?: string; error?: string };

      if (!response.ok || !data.review) {
        throw new Error(data.error ?? "AI review request failed");
      }

      setReview(data.review);
    } catch (error) {
      console.error(error);
      setReview(errorCopy[payload.language]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 border border-outline-variant bg-surface-container-lowest p-4">
      <button
        className="w-full bg-secondary text-on-secondary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-60"
        disabled={isLoading}
        onClick={requestReview}
        type="button"
      >
        {isLoading ? loadingCopy[payload.language] : buttonLabel}
      </button>
      {review && (
        <div className="mt-4 border-l-4 border-secondary bg-surface p-4 text-left">
          <div className="flex items-center gap-2 text-secondary mb-3">
            <span className="material-symbols-outlined text-lg">psychology</span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest">
              {titleCopy[payload.language]}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">
            {review}
          </p>
        </div>
      )}
    </div>
  );
}
