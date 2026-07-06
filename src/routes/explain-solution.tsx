import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/explain-solution")({
  head: () => ({
    meta: [
      { title: "Explain Your Solution — AI-Sana" },
      { name: "description", content: "AI-Sana analyzes a pupil's solution explanation." },
    ],
  }),
  component: ExplainSolution,
});

function ExplainSolution() {
  const { language } = useLanguage();
  const c = copy[language];
  const [question, setQuestion] = useState("");
  const [correctSolution, setCorrectSolution] = useState("");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const response = await fetch("/api/explain-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, question, correctSolution, transcript }),
      });
      const data = (await response.json()) as { feedback?: string; error?: string };
      if (!response.ok || !data.feedback) throw new Error(data.error ?? "Request failed");
      setFeedback(data.feedback);
    } catch {
      setError(c.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-container-padding-mobile py-stack-lg md:px-container-padding-desktop">
        <section className="border border-outline-variant bg-surface-container-lowest p-7 shadow-[12px_12px_0_var(--secondary-container)]">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            AI-Sana
          </p>
          <h1 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
            {c.title}
          </h1>
          <p className="mt-4 max-w-2xl text-on-surface-variant">{c.desc}</p>
        </section>

        <section className="mt-stack-lg grid gap-5">
          <Field label={c.question} value={question} onChange={setQuestion} />
          <Field label={c.solution} value={correctSolution} onChange={setCorrectSolution} />
          <Field label={c.transcript} value={transcript} onChange={setTranscript} />
          <div className="border border-outline-variant bg-surface p-4 text-on-surface-variant">
            {/* TODO: Replace this placeholder with real speech-to-text upload/transcription. */}
            {c.voiceTodo}
          </div>
          <button
            className="w-fit bg-secondary px-6 py-3 text-on-secondary disabled:opacity-50"
            disabled={loading || !question || !correctSolution || !transcript}
            onClick={submit}
            type="button"
          >
            {loading ? c.loading : c.submit}
          </button>
          {error ? <p className="text-red-700">{error}</p> : null}
          {feedback ? (
            <div className="whitespace-pre-wrap border border-secondary bg-secondary-container p-5 text-on-surface">
              {feedback}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="font-title-md text-title-md text-primary">{label}</span>
      <textarea
        className="mt-3 min-h-28 w-full border border-outline-variant bg-surface p-4 outline-none focus:border-secondary"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

const copy = {
  EN: {
    title: "Explain your solution",
    desc: "Write how you solved a task. AI-Sana will analyze your thinking step by step.",
    question: "Question",
    solution: "Correct solution",
    transcript: "Your explanation",
    voiceTodo: "Voice input placeholder: speech-to-text will fill this explanation field later.",
    submit: "Analyze explanation",
    loading: "Analyzing...",
    error: "AI-Sana could not analyze this explanation right now.",
  },
  KZ: {
    title: "Шешу жолыңды түсіндір",
    desc: "Есепті қалай шығарғаныңды жаз. AI-Sana ойлау жолыңды қадам-қадаммен талдайды.",
    question: "Сұрақ",
    solution: "Дұрыс шешім",
    transcript: "Сенің түсіндіруің",
    voiceTodo: "Дауыс placeholder: кейін speech-to-text осы өрісті автоматты толтырады.",
    submit: "Түсіндіруді талдау",
    loading: "Талданып жатыр...",
    error: "AI-Sana қазір бұл түсіндіруді талдай алмады.",
  },
  RU: {
    title: "Объясни ход решения",
    desc: "Напишите, как вы решили задачу. AI-Sana разберёт ход мысли по шагам.",
    question: "Вопрос",
    solution: "Правильное решение",
    transcript: "Ваше объяснение",
    voiceTodo: "Placeholder для голоса: позже speech-to-text будет заполнять это поле автоматически.",
    submit: "Разобрать объяснение",
    loading: "Анализируем...",
    error: "AI-Sana сейчас не смогла разобрать объяснение.",
  },
};
