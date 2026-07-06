import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameCard, GameLayout, MascotCoach, ProgressBar } from "@/components/gamified-platform";
import { getTopic } from "@/data/subjects";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/lesson/$subjectId/$topicId")({
  loader: ({ params }) => {
    const data = getTopic(params.subjectId, params.topicId);
    if (!data || !data.topic.lesson) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.topic.title.EN ?? "Lesson"} — AI-Sana` },
      { name: "description", content: "AI-Sana game lesson." },
    ],
  }),
  component: TopicLessonPage,
});

function TopicLessonPage() {
  const { subject, module, topic } = Route.useLoaderData();
  const { language } = useLanguage();
  const lesson = topic.lesson;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(
    () =>
      lesson.quiz.reduce(
        (sum, question, index) => (answers[index] === question.answerIndex ? sum + 1 : sum),
        0,
      ),
    [answers, lesson.quiz],
  );
  const c =
    language === "RU"
      ? {
          back: "Назад к предмету",
          coach: "Прочитай короткие блоки, потом пройди мини-тест.",
          goals: "После урока ты сможешь",
          quiz: "Проверь понимание",
          submit: "Проверить",
          result: "Результат",
          correct: "правильно",
        }
      : language === "EN"
        ? {
            back: "Back to subject",
            coach: "Read short blocks, then finish the mini test.",
            goals: "By the end you can",
            quiz: "Check understanding",
            submit: "Check",
            result: "Result",
            correct: "correct",
          }
        : {
            back: "Пәнге оралу",
            coach: "Қысқа блоктарды оқы, сосын мини-тесттен өт.",
            goals: "Сабақ соңында сен",
            quiz: "Түсінгеніңді тексер",
            submit: "Тексеру",
            result: "Нәтиже",
            correct: "дұрыс",
          };

  return (
    <GameLayout>
      <div className="space-y-5">
        <Link
          to="/subjects/$subjectId"
          params={{ subjectId: subject.id }}
          className="inline-flex rounded-2xl bg-white px-4 py-3 font-black text-[#6D28D9] shadow-[0_5px_0_rgba(109,40,217,0.12)]"
        >
          ← {c.back}
        </Link>
        <GameCard className="bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FACC15]">
            {subject.exam} · {module.title[language]}
          </p>
          <h1 className="mt-2 text-4xl font-black md:text-6xl">{topic.title[language]}</h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold text-[#EDE9FE]">
            {topic.description[language]}
          </p>
          <ProgressBar value={48} />
        </GameCard>
        <MascotCoach text={c.coach} />

        <section className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
          <article className="space-y-5">
            <GameCard>
              <h2 className="text-2xl font-black">AI-Sana</h2>
              <div className="mt-4 space-y-3">
                {lesson.intro[language].map((paragraph) => (
                  <p key={paragraph} className="text-lg font-semibold leading-8 text-[#4B3D73]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </GameCard>
            <GameCard>
              <h2 className="text-2xl font-black">{c.goals}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {lesson.goals[language].map((goal) => (
                  <div key={goal} className="rounded-2xl bg-[#DCFCE7] p-4 font-bold">
                    ✅ {goal}
                  </div>
                ))}
              </div>
            </GameCard>
            {lesson.blocks.map((block, index) => (
              <GameCard key={block.title[language]}>
                <div className="flex gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#8B5CF6] text-xl font-black text-white shadow-[0_6px_0_#5B21B6]">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{block.title[language]}</h2>
                    <div className="mt-3 space-y-3">
                      {block.body[language].map((paragraph) => (
                        <p key={paragraph} className="text-lg font-semibold leading-8 text-[#4B3D73]">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </GameCard>
            ))}
          </article>

          <aside className="lg:sticky lg:top-20">
            <GameCard className="border-[#8B5CF6]">
              <h2 className="text-2xl font-black">{c.quiz}</h2>
              {submitted ? (
                <div className="mt-4 rounded-2xl bg-[#F5F3FF] p-4">
                  <p className="font-black text-[#8B5CF6]">{c.result}</p>
                  <p className="text-3xl font-black">
                    {score}/{lesson.quiz.length} {c.correct}
                  </p>
                </div>
              ) : null}
              <div className="mt-5 space-y-4">
                {lesson.quiz.map((question, questionIndex) => (
                  <div key={question.question[language]} className="rounded-2xl border-2 border-[#DDD6FE] p-4">
                    <p className="font-black">
                      {questionIndex + 1}. {question.question[language]}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {question.options[language].map((option, optionIndex) => {
                        const selected = answers[questionIndex] === optionIndex;
                        const isCorrect = submitted && optionIndex === question.answerIndex;
                        const isWrong = submitted && selected && !isCorrect;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
                            }
                            className={`rounded-2xl border-2 px-4 py-3 text-left font-bold transition ${
                              isCorrect
                                ? "border-[#22C55E] bg-[#DCFCE7]"
                                : isWrong
                                  ? "border-[#EF4444] bg-[#FEE2E2]"
                                  : selected
                                    ? "border-[#8B5CF6] bg-[#F5F3FF]"
                                    : "border-[#DDD6FE] bg-white"
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}) {option}
                          </button>
                        );
                      })}
                    </div>
                    {submitted ? (
                      <p className="mt-3 text-sm font-semibold text-[#6B5E8F]">
                        AI-Sana: {question.explanation[language]}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="mt-5 w-full rounded-2xl bg-[#6D28D9] px-5 py-4 font-black text-white shadow-[0_6px_0_#4C1D95]"
              >
                {c.submit}
              </button>
            </GameCard>
          </aside>
        </section>
      </div>
    </GameLayout>
  );
}
