import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { getSubject } from "@/data/subjects";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/subjects/$subjectId")({
  loader: ({ params }) => {
    const subject = getSubject(params.subjectId);
    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.subject.title.EN ?? "Subject"} — AI-Sana` },
      {
        name: "description",
        content: loaderData?.subject.description.EN ?? "AI-Sana subject modules and topics.",
      },
    ],
  }),
  component: SubjectPage,
});

const difficultyCopy = {
  basic: { EN: "Basic", KZ: "Бастапқы", RU: "Базовый" },
  medium: { EN: "Medium", KZ: "Орташа", RU: "Средний" },
  advanced: { EN: "Advanced", KZ: "Күрделі", RU: "Сложный" },
};

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { language } = useLanguage();
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const [activeQuizTopicId, setActiveQuizTopicId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submittedQuizId, setSubmittedQuizId] = useState<string | null>(null);
  const copy = getSubjectPageCopy(language);

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
        <Link
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md mb-stack-md"
          to="/subjects"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {copy.back}
        </Link>

        <section className="border border-outline-variant bg-surface-container-highest rounded-tr-[48px] rounded-bl-[48px] p-8 md:p-10 mb-stack-lg">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                {subject.exam}
              </p>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-3">
                {subject.title[language]}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl">
                {subject.description[language]}
              </p>
            </div>
            <div className="w-16 h-16 bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-4xl">{subject.icon}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 mb-stack-md">
            <h2 className="font-headline-md text-headline-md text-primary">{copy.modules}</h2>
            <Link
              className="hidden sm:inline-flex bg-primary text-on-primary px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary transition-colors"
              to="/plan"
            >
              {copy.practice}
            </Link>
          </div>

          <div className="flex flex-col gap-stack-md">
            {subject.modules.map((module, moduleIndex) => (
              <article
                className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8"
                key={module.id}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-outline-variant pb-5 mb-5">
                  <div>
                    <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                      {copy.module} {moduleIndex + 1}
                    </p>
                    <h3 className="font-headline-md text-headline-md text-primary mt-2">
                      {module.title[language]}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                      {module.description[language]}
                    </p>
                  </div>
                  <span className="border border-outline-variant px-3 py-2 font-label-md text-label-md text-on-surface-variant shrink-0">
                    {module.topics.length} {copy.topics}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {module.topics.map((topic) => {
                    const isOpen = openTopicId === topic.id;
                    const isQuizOpen = activeQuizTopicId === topic.id;
                    const isSubmitted = submittedQuizId === topic.id;
                    const score =
                      topic.lesson?.quiz.reduce((sum, question, questionIndex) => {
                        const answerKey = `${topic.id}-${questionIndex}`;
                        return answers[answerKey] === question.answerIndex ? sum + 1 : sum;
                      }, 0) ?? 0;

                    return (
                      <div className="border border-outline-variant bg-surface p-5" key={topic.id}>
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-title-lg text-title-lg text-primary">
                            {topic.title[language]}
                          </h4>
                          <span className="bg-primary-container text-on-primary-container px-3 py-1 font-label-sm text-label-sm whitespace-nowrap">
                            {difficultyCopy[topic.difficulty][language]}
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                          {topic.description[language]}
                        </p>

                        {topic.lesson ? (
                          <>
                            <button
                              className="mt-5 inline-flex items-center gap-2 border border-primary text-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
                              onClick={() => {
                                setOpenTopicId(isOpen ? null : topic.id);
                                if (!isOpen) setActiveQuizTopicId(null);
                              }}
                              type="button"
                            >
                              {isOpen ? copy.hideLesson : copy.openLesson}
                              <span className="material-symbols-outlined text-sm">
                                {isOpen ? "expand_less" : "arrow_forward"}
                              </span>
                            </button>

                            {isOpen ? (
                              <div className="mt-6 border-t border-outline-variant pt-6 lg:col-span-2">
                                <div className="space-y-3">
                                  {topic.lesson.intro[language].map((paragraph) => (
                                    <p
                                      className="font-body-md text-body-md text-on-surface-variant"
                                      key={paragraph}
                                    >
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>

                                <div className="mt-6 border border-outline-variant bg-surface-container-lowest p-4">
                                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                                    {copy.lessonGoals}
                                  </p>
                                  <ul className="mt-3 space-y-2">
                                    {topic.lesson.goals[language].map((goal) => (
                                      <li
                                        className="flex gap-2 font-body-sm text-body-sm text-on-surface-variant"
                                        key={goal}
                                      >
                                        <span className="material-symbols-outlined text-secondary text-base">
                                          check
                                        </span>
                                        {goal}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="mt-6 space-y-5">
                                  {topic.lesson.blocks.map((block) => (
                                    <section
                                      className="border-l-4 border-secondary pl-4"
                                      key={block.title[language]}
                                    >
                                      <h5 className="font-title-lg text-title-lg text-primary">
                                        {block.title[language]}
                                      </h5>
                                      <div className="mt-2 space-y-2">
                                        {block.body[language].map((paragraph) => (
                                          <p
                                            className="font-body-md text-body-md text-on-surface-variant"
                                            key={paragraph}
                                          >
                                            {paragraph}
                                          </p>
                                        ))}
                                      </div>
                                    </section>
                                  ))}
                                </div>

                                <div className="mt-7 border border-secondary bg-secondary/5 p-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
                                        {copy.testIntro}
                                      </p>
                                      {isSubmitted ? (
                                        <p className="font-title-md text-title-md text-primary mt-1">
                                          {copy.result}: {score}/{topic.lesson.quiz.length}{" "}
                                          {copy.correct}
                                        </p>
                                      ) : null}
                                    </div>
                                    <button
                                      className="bg-secondary text-on-secondary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary transition-colors"
                                      onClick={() => {
                                        setActiveQuizTopicId(isQuizOpen ? null : topic.id);
                                        setSubmittedQuizId(null);
                                      }}
                                      type="button"
                                    >
                                      {isQuizOpen ? copy.hideTest : copy.startTest}
                                    </button>
                                  </div>

                                  {isQuizOpen ? (
                                    <div className="mt-5 space-y-4">
                                      {topic.lesson.quiz.map((question, questionIndex) => {
                                        const answerKey = `${topic.id}-${questionIndex}`;
                                        const selected = answers[answerKey];

                                        return (
                                          <div
                                            className="border border-outline-variant bg-surface p-4"
                                            key={question.question[language]}
                                          >
                                            <p className="font-title-md text-title-md text-primary">
                                              {questionIndex + 1}. {question.question[language]}
                                            </p>
                                            <div className="mt-3 grid gap-2">
                                              {question.options[language].map(
                                                (option, optionIndex) => {
                                                  const isCorrect =
                                                    isSubmitted &&
                                                    optionIndex === question.answerIndex;
                                                  const isWrong =
                                                    isSubmitted &&
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
                                                      onClick={() =>
                                                        setAnswers((prev) => ({
                                                          ...prev,
                                                          [answerKey]: optionIndex,
                                                        }))
                                                      }
                                                      type="button"
                                                    >
                                                      {String.fromCharCode(65 + optionIndex)}){" "}
                                                      {option}
                                                    </button>
                                                  );
                                                },
                                              )}
                                            </div>
                                            {isSubmitted ? (
                                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
                                                {copy.answer}:{" "}
                                                {String.fromCharCode(65 + question.answerIndex)}.{" "}
                                                {question.explanation[language]}
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })}

                                      <button
                                        className="w-full border border-primary bg-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-primary hover:bg-secondary transition-colors"
                                        onClick={() => {
                                          if (isSubmitted) {
                                            const cleared = { ...answers };
                                            topic.lesson?.quiz.forEach((_, questionIndex) => {
                                              delete cleared[`${topic.id}-${questionIndex}`];
                                            });
                                            setAnswers(cleared);
                                            setSubmittedQuizId(null);
                                            return;
                                          }

                                          setSubmittedQuizId(topic.id);
                                        }}
                                        type="button"
                                      >
                                        {isSubmitted ? copy.retryTest : copy.checkTest}
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <Link
                            className="mt-5 inline-flex items-center gap-2 border border-primary text-primary px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
                            to="/plan"
                          >
                            {copy.start}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function getSubjectPageCopy(language: "EN" | "KZ" | "RU") {
  if (language === "KZ") {
    return {
      back: "Пәндерге оралу",
      modules: "Модульдер",
      module: "Модуль",
      topics: "тақырып",
      start: "Тақырыпқа кіру",
      openLesson: "Сабақты ашу",
      hideLesson: "Сабақты жабу",
      lessonGoals: "Сабақ соңында сен",
      testIntro: "Тақырыпты түсінгеніңді тексер",
      startTest: "Тестті бастау",
      hideTest: "Тестті жабу",
      checkTest: "Жауаптарды тексеру",
      retryTest: "Қайта тапсыру",
      result: "Нәтиже",
      correct: "дұрыс",
      answer: "Жауап",
      practice: "Жаттығу бастау",
    };
  }

  if (language === "RU") {
    return {
      back: "Назад к предметам",
      modules: "Модули",
      module: "Модуль",
      topics: "тем",
      start: "Открыть тему",
      openLesson: "Открыть урок",
      hideLesson: "Закрыть урок",
      lessonGoals: "После урока ты сможешь",
      testIntro: "Проверь, понял ли ты тему",
      startTest: "Начать тест",
      hideTest: "Закрыть тест",
      checkTest: "Проверить ответы",
      retryTest: "Пройти снова",
      result: "Результат",
      correct: "правильно",
      answer: "Ответ",
      practice: "Начать практику",
    };
  }

  return {
    back: "Back to subjects",
    modules: "Modules",
    module: "Module",
    topics: "topics",
    start: "Open topic",
    openLesson: "Open lesson",
    hideLesson: "Hide lesson",
    lessonGoals: "By the end of this lesson",
    testIntro: "Check your understanding",
    startTest: "Start test",
    hideTest: "Hide test",
    checkTest: "Check answers",
    retryTest: "Try again",
    result: "Result",
    correct: "correct",
    answer: "Answer",
    practice: "Start practice",
  };
}
