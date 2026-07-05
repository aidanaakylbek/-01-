import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { getTopic } from "@/data/subjects";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/subjects/$subjectId/$topicId")({
  loader: ({ params }) => {
    const data = getTopic(params.subjectId, params.topicId);
    if (!data || !data.topic.lesson) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.topic.title.EN ?? "Lesson"} — AI-Sana` },
      {
        name: "description",
        content: loaderData?.topic.description.EN ?? "AI-Sana lesson and quiz.",
      },
    ],
  }),
  component: TopicLessonPage,
});

function TopicLessonPage() {
  const { subject, module, topic } = Route.useLoaderData();
  const { language } = useLanguage();
  const copy = getLessonCopy(language);
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

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <Link
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md mb-stack-md"
          params={{ subjectId: subject.id }}
          to="/subjects/$subjectId"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {copy.backToSubject}
        </Link>

        <section className="relative overflow-hidden border border-outline-variant bg-surface-container-lowest p-6 md:p-10 shadow-[14px_14px_0_var(--secondary-container)]">
          <div className="absolute right-6 top-6 hidden h-24 w-24 border-r-2 border-t-2 border-secondary md:block" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {subject.exam} · {module.title[language]}
              </p>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-3 max-w-3xl">
                {topic.title[language]}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-3xl">
                {topic.description[language]}
              </p>
            </div>
            <div className="border border-outline-variant bg-surface p-5">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {copy.lessonMap}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat icon="menu_book" label={copy.read} value={lesson.blocks.length} />
                <MiniStat icon="flag" label={copy.goals} value={lesson.goals[language].length} />
                <MiniStat icon="quiz" label={copy.test} value={lesson.quiz.length} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-stack-lg grid gap-gutter lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <article className="space-y-gutter">
            <div className="border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                AI-Sana
              </p>
              <div className="mt-4 space-y-3">
                {lesson.intro[language].map((paragraph) => (
                  <p className="font-body-lg text-body-lg text-on-surface-variant" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="border border-outline-variant bg-surface p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined">checklist</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary">
                  {copy.lessonGoals}
                </h2>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {lesson.goals[language].map((goal) => (
                  <div
                    className="border border-outline-variant bg-surface-container-lowest p-4"
                    key={goal}
                  >
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            {lesson.blocks.map((block, index) => (
              <section
                className="group border border-outline-variant bg-surface-container-lowest p-5 md:p-6 transition-all hover:border-secondary"
                key={block.title[language]}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-secondary-container font-title-lg text-title-lg text-secondary">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-primary">
                      {block.title[language]}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {block.body[language].map((paragraph) => (
                        <p
                          className="font-body-lg text-body-lg text-on-surface-variant"
                          key={paragraph}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </article>

          <aside className="lg:sticky lg:top-28">
            <div className="border border-secondary bg-surface-container-lowest p-5 shadow-[10px_10px_0_var(--secondary-container)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                    {copy.checkUnderstanding}
                  </p>
                  <h2 className="font-title-lg text-title-lg text-primary mt-2">
                    {copy.quizTitle}
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined">quiz</span>
                </div>
              </div>

              {submitted ? (
                <div className="mt-4 border border-outline-variant bg-surface p-4">
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    {copy.result}
                  </p>
                  <p className="font-headline-md text-headline-md text-primary mt-1">
                    {score}/{lesson.quiz.length} {copy.correct}
                  </p>
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {lesson.quiz.map((question, questionIndex) => {
                  const selected = answers[questionIndex];

                  return (
                    <div
                      className="border border-outline-variant bg-surface p-4"
                      key={question.question[language]}
                    >
                      <p className="font-title-md text-title-md text-primary">
                        {questionIndex + 1}. {question.question[language]}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {question.options[language].map((option, optionIndex) => {
                          const isCorrect = submitted && optionIndex === question.answerIndex;
                          const isWrong =
                            submitted &&
                            selected === optionIndex &&
                            optionIndex !== question.answerIndex;

                          return (
                            <button
                              className={`border px-3 py-2 text-left font-body-md text-body-md transition-colors ${
                                isCorrect
                                  ? "border-secondary bg-secondary/10 text-primary"
                                  : isWrong
                                    ? "border-error bg-error-container text-error"
                                    : selected === optionIndex
                                      ? "border-secondary text-primary"
                                      : "border-outline-variant text-on-surface-variant hover:border-primary"
                              }`}
                              key={option}
                              onClick={() => {
                                setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
                              }}
                              type="button"
                            >
                              {String.fromCharCode(65 + optionIndex)}) {option}
                            </button>
                          );
                        })}
                      </div>
                      {submitted ? (
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
                          {copy.answer}: {String.fromCharCode(65 + question.answerIndex)}.{" "}
                          {question.explanation[language]}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <button
                className="mt-5 w-full border border-primary bg-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-primary hover:bg-secondary transition-colors"
                onClick={() => {
                  if (submitted) {
                    setAnswers({});
                    setSubmitted(false);
                    return;
                  }
                  setSubmitted(true);
                }}
                type="button"
              >
                {submitted ? copy.retryTest : copy.checkTest}
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="border border-outline-variant bg-surface-container-lowest p-3 text-center">
      <span className="material-symbols-outlined text-secondary text-lg">{icon}</span>
      <p className="font-title-md text-title-md text-primary mt-1">{value}</p>
      <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
    </div>
  );
}

function getLessonCopy(language: "EN" | "KZ" | "RU") {
  if (language === "KZ") {
    return {
      backToSubject: "Математикаға оралу",
      lessonMap: "Сабақ картасы",
      read: "бөлім",
      goals: "мақсат",
      test: "сұрақ",
      lessonGoals: "Бүгін сен не үйренесің?",
      checkUnderstanding: "Тақырыпты түсінгеніңді тексер",
      quizTitle: "Қысқа тест",
      result: "Нәтиже",
      correct: "дұрыс",
      answer: "Жауап",
      checkTest: "Жауаптарды тексеру",
      retryTest: "Қайта тапсыру",
    };
  }

  if (language === "RU") {
    return {
      backToSubject: "Вернуться к математике",
      lessonMap: "Карта урока",
      read: "блоков",
      goals: "целей",
      test: "вопросов",
      lessonGoals: "Что ты изучишь сегодня?",
      checkUnderstanding: "Проверь понимание темы",
      quizTitle: "Короткий тест",
      result: "Результат",
      correct: "правильно",
      answer: "Ответ",
      checkTest: "Проверить ответы",
      retryTest: "Пройти снова",
    };
  }

  return {
    backToSubject: "Back to mathematics",
    lessonMap: "Lesson map",
    read: "blocks",
    goals: "goals",
    test: "questions",
    lessonGoals: "What will you learn today?",
    checkUnderstanding: "Check your understanding",
    quizTitle: "Short quiz",
    result: "Result",
    correct: "correct",
    answer: "Answer",
    checkTest: "Check answers",
    retryTest: "Try again",
  };
}
