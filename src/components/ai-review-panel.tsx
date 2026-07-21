import { useState } from "react";

type ReviewLanguage = "KZ" | "RU" | "EN";

type ReviewPayload = {
  taskTitle: string;
  taskType: "task" | "test" | "diagnostic";
  subject: string;
  exam?: string;
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
    <div className="rounded-[28px] border-2 border-[#DDD6FE] bg-white p-5 shadow-[0_8px_0_rgba(109,40,217,0.12)]">
      <button
        className="w-full rounded-2xl bg-[#6D28D9] px-4 py-3 font-black text-white shadow-[0_5px_0_#4C1D95] transition hover:-translate-y-0.5 disabled:opacity-60"
        disabled={isLoading}
        onClick={requestReview}
        type="button"
      >
        {isLoading ? loadingCopy[payload.language] : buttonLabel}
      </button>
      {review && (
        <div className="mt-4 rounded-2xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-4 text-left">
          <div className="mb-3 flex items-center gap-2 text-[#6D28D9]">
            <span className="material-symbols-outlined text-lg">psychology</span>
            <span className="text-sm font-black uppercase tracking-[0.25em]">
              {titleCopy[payload.language]}
            </span>
          </div>
          <p className="whitespace-pre-wrap font-semibold leading-7 text-[#4B3D73]">
            {review}
          </p>
        </div>
      )}
    </div>
  );
}
