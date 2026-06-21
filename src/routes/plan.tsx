import { createFileRoute } from "@tanstack/react-router";
import { AIReviewPanel } from "@/components/ai-review-panel";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Personalized Study Plan — AI-Sana" },
      {
        name: "description",
        content: "Your weekly AI-Sana study plan, adapted to your strengths and gaps.",
      },
    ],
  }),
  component: Plan,
});

function Plan() {
  const { t, language } = useLanguage();
  const reviewLabel =
    language === "KZ"
      ? "Тапсырмадан кейін AI разбор"
      : language === "RU"
        ? "AI-разбор после задания"
        : "AI review after task";

  return (
    <div className="bg-background text-on-background min-h-screen pb-24">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop mt-stack-md flex flex-col gap-stack-lg">
        <section className="flex flex-col gap-2 mt-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
            {t("plan_header")}
          </h2>
          <p className="text-on-surface-variant font-body-md">{t("plan_subheader")}</p>
        </section>

        <div className="bg-tertiary-fixed/30 border-l-4 border-tertiary-fixed-dim rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <span
            className="material-symbols-outlined text-tertiary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
          <div>
            <h3 className="font-label-md text-label-md text-tertiary-container mb-1">
              {t("plan_insight_title")}
            </h3>
            <p className="font-body-md text-on-surface text-sm">{t("plan_insight_desc")}</p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
          {/* Monday completed */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 relative overflow-hidden bg-surface-container-low">
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-secondary-container/30 flex items-center justify-center border-l border-secondary-container/50">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}
              >
                check_circle
              </span>
            </div>
            <div className="flex justify-between items-start pr-12">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_mon_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_mon_title")}
                </h3>
              </div>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant pr-12">
              {t("plan_mon_desc")}
            </p>
            <div className="mt-auto pr-12">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full w-full" />
              </div>
            </div>
            <div className="pr-12">
              <AIReviewPanel
                buttonLabel={reviewLabel}
                payload={{
                  taskTitle: t("plan_mon_title"),
                  taskType: "task",
                  subject: "NIS Natural Science",
                  score: 90,
                  totalQuestions: 10,
                  correctAnswers: 9,
                  weakTopics:
                    language === "KZ"
                      ? ["Физикадағы өлшем бірліктер"]
                      : language === "RU"
                        ? ["Единицы измерения в физике"]
                        : ["Physics units"],
                  attempts:
                    language === "KZ"
                      ? [
                          {
                            question: "Өсімдіктер фотосинтез кезінде қандай газ бөледі?",
                            userAnswer: "Оттек",
                            correctAnswer: "Оттек",
                            isCorrect: true,
                            topic: "Биология",
                            explanation:
                              "Фотосинтез кезінде өсімдік көмірқышқыл газын пайдаланып, оттек бөледі.",
                          },
                        ]
                      : language === "RU"
                        ? [
                            {
                              question: "Какой газ выделяют растения при фотосинтезе?",
                              userAnswer: "Кислород",
                              correctAnswer: "Кислород",
                              isCorrect: true,
                              topic: "Биология",
                              explanation:
                                "Во время фотосинтеза растение использует углекислый газ и выделяет кислород.",
                            },
                          ]
                        : [
                            {
                              question: "Which gas do plants release during photosynthesis?",
                              userAnswer: "Oxygen",
                              correctAnswer: "Oxygen",
                              isCorrect: true,
                              topic: "Biology",
                              explanation:
                                "During photosynthesis, plants use carbon dioxide and release oxygen.",
                            },
                          ],
                  language,
                }}
              />
            </div>
          </div>

          {/* Tuesday active */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 relative overflow-hidden border-2 border-primary shadow-md bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  {t("plan_tue_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_tue_title")}
                </h3>
              </div>
              <button
                aria-label="Dismiss"
                className="w-8 h-8 rounded-full border-2 border-outline flex items-center justify-center text-outline hover:bg-primary-container hover:border-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">{t("plan_tue_desc")}</p>
            <div className="mt-auto flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-variant"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="30, 100"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <span className="absolute text-[10px] text-primary font-medium">30%</span>
              </div>
              <button className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all ml-auto cursor-pointer">
                {t("plan_btn_continue")}
              </button>
            </div>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle: t("plan_tue_title"),
                taskType: "task",
                subject: "NSPM",
                score: 72,
                totalQuestions: 10,
                correctAnswers: 7,
                weakTopics:
                  language === "KZ"
                    ? ["Логикалық тізбектер", "Қадамды дәлелдеу"]
                    : language === "RU"
                      ? ["Логические последовательности", "Обоснование шагов"]
                      : ["Logic sequences", "Step justification"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "3, 6, 12, 24, ?",
                          userAnswer: "30",
                          correctAnswer: "48",
                          isCorrect: false,
                          topic: "Логикалық тізбектер",
                          explanation: "Әр сан алдыңғысынан 2 есе үлкен.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "3, 6, 12, 24, ?",
                            userAnswer: "30",
                            correctAnswer: "48",
                            isCorrect: false,
                            topic: "Логические последовательности",
                            explanation: "Каждое число в 2 раза больше предыдущего.",
                          },
                        ]
                      : [
                          {
                            question: "3, 6, 12, 24, ?",
                            userAnswer: "30",
                            correctAnswer: "48",
                            isCorrect: false,
                            topic: "Logic sequences",
                            explanation: "Each number is twice the previous number.",
                          },
                        ],
                language,
              }}
            />
          </div>

          {/* Wednesday */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_wed_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_wed_title")}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">{t("plan_wed_desc")}</p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle: t("plan_wed_title"),
                taskType: "task",
                subject: "BIL Reading Literacy",
                score: 80,
                totalQuestions: 10,
                correctAnswers: 8,
                weakTopics:
                  language === "KZ"
                    ? ["Негізгі ойды табу"]
                    : language === "RU"
                      ? ["Определение главной мысли"]
                      : ["Finding the main idea"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "Мәтіндегі негізгі ойды таңдаңыз.",
                          userAnswer: "Күнделікті оқу нәтижені жақсартады",
                          correctAnswer: "Күнделікті оқу нәтижені жақсартады",
                          isCorrect: true,
                          topic: "Оқу сауаттылығы",
                          explanation:
                            "Мәтінде тұрақты оқу мен прогресс арасындағы байланыс көрсетілген.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "Выберите главную мысль текста.",
                            userAnswer: "Ежедневное чтение улучшает результат",
                            correctAnswer: "Ежедневное чтение улучшает результат",
                            isCorrect: true,
                            topic: "Читательская грамотность",
                            explanation:
                              "В тексте показана связь между регулярным чтением и прогрессом.",
                          },
                        ]
                      : [
                          {
                            question: "Choose the main idea of the text.",
                            userAnswer: "Daily reading improves results",
                            correctAnswer: "Daily reading improves results",
                            isCorrect: true,
                            topic: "Reading literacy",
                            explanation: "The text connects regular reading with steady progress.",
                          },
                        ],
                language,
              }}
            />
          </div>

          {/* Thursday English */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {language === "KZ"
                    ? "Бейсенбі • English"
                    : language === "RU"
                      ? "Четверг • English"
                      : "Thursday • English"}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {language === "KZ"
                    ? "Ағылшын тілі"
                    : language === "RU"
                      ? "Английский"
                      : "English"}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {language === "KZ"
                ? "Present Simple, сөздік қор және қысқа мәтіндерді түсіну."
                : language === "RU"
                  ? "Present Simple, словарный запас и понимание коротких текстов."
                  : "Present Simple, vocabulary, and short text comprehension."}
            </p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle:
                  language === "KZ" ? "Ағылшын тілі" : language === "RU" ? "Английский" : "English",
                taskType: "task",
                subject: "English",
                score: 75,
                totalQuestions: 8,
                correctAnswers: 6,
                weakTopics:
                  language === "KZ"
                    ? ["Ағылшын сөйлем құрылымы"]
                    : language === "RU"
                      ? ["Структура английского предложения"]
                      : ["English sentence structure"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "Choose the correct sentence: She go / She goes to school.",
                          userAnswer: "She goes to school.",
                          correctAnswer: "She goes to school.",
                          isCorrect: true,
                          topic: "English grammar",
                          explanation:
                            "He/She/It тұлғаларында Present Simple кезінде етістікке -s жалғанады.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "Choose the correct sentence: She go / She goes to school.",
                            userAnswer: "She goes to school.",
                            correctAnswer: "She goes to school.",
                            isCorrect: true,
                            topic: "English grammar",
                            explanation: "С he/she/it в Present Simple к глаголу добавляется -s.",
                          },
                        ]
                      : [
                          {
                            question: "Choose the correct sentence: She go / She goes to school.",
                            userAnswer: "She goes to school.",
                            correctAnswer: "She goes to school.",
                            isCorrect: true,
                            topic: "English grammar",
                            explanation: "With he/she/it in Present Simple, the verb takes -s.",
                          },
                        ],
                language,
              }}
            />
          </div>

          {/* Thursday Kazakh */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {language === "KZ"
                    ? "Бейсенбі • Қазақ тілі"
                    : language === "RU"
                      ? "Четверг • Казахский"
                      : "Thursday • Kazakh"}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {language === "KZ"
                    ? "Қазақ тілі"
                    : language === "RU"
                      ? "Казахский язык"
                      : "Kazakh"}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {language === "KZ"
                ? "Мәтінді түсіну, негізгі ой және сөз мағынасы."
                : language === "RU"
                  ? "Понимание текста, главная мысль и значение слов."
                  : "Text comprehension, main idea, and word meaning."}
            </p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle:
                  language === "KZ"
                    ? "Қазақ тілі"
                    : language === "RU"
                      ? "Казахский язык"
                      : "Kazakh",
                taskType: "task",
                subject: "Kazakh",
                score: 82,
                totalQuestions: 8,
                correctAnswers: 7,
                weakTopics:
                  language === "KZ"
                    ? ["Негізгі ой"]
                    : language === "RU"
                      ? ["Главная мысль"]
                      : ["Main idea"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "Мәтіндегі негізгі ойды анықтаңыз.",
                          userAnswer: "Автор еңбектің маңызын айтады.",
                          correctAnswer: "Автор еңбектің маңызын айтады.",
                          isCorrect: true,
                          topic: "Мәтінмен жұмыс",
                          explanation:
                            "Жауап дұрыс, себебі мәтіндегі барлық сөйлемдер еңбек пен тұрақты әрекеттің маңызын ашады.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "Определите главную мысль текста на казахском языке.",
                            userAnswer: "Автор говорит о важности труда.",
                            correctAnswer: "Автор говорит о важности труда.",
                            isCorrect: true,
                            topic: "Работа с текстом",
                            explanation:
                              "Ответ верный: все предложения текста раскрывают значение труда и регулярных действий.",
                          },
                        ]
                      : [
                          {
                            question: "Identify the main idea of the Kazakh text.",
                            userAnswer: "The author explains the importance of effort.",
                            correctAnswer: "The author explains the importance of effort.",
                            isCorrect: true,
                            topic: "Text work",
                            explanation:
                              "The answer is correct because the text focuses on effort and consistent action.",
                          },
                        ],
                language,
              }}
            />
          </div>

          {/* Thursday Russian */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {language === "KZ"
                    ? "Бейсенбі • Орыс тілі"
                    : language === "RU"
                      ? "Четверг • Русский"
                      : "Thursday • Russian"}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {language === "KZ" ? "Орыс тілі" : language === "RU" ? "Русский язык" : "Russian"}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {language === "KZ"
                ? "Орыс тіліндегі мәтін, грамматика және сөйлем мағынасы."
                : language === "RU"
                  ? "Текст, грамматика и смысл предложения по русскому языку."
                  : "Russian text, grammar, and sentence meaning."}
            </p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle:
                  language === "KZ" ? "Орыс тілі" : language === "RU" ? "Русский язык" : "Russian",
                taskType: "task",
                subject: "Russian",
                score: 78,
                totalQuestions: 8,
                correctAnswers: 6,
                weakTopics:
                  language === "KZ"
                    ? ["Сөйлемдегі тыныс белгілері"]
                    : language === "RU"
                      ? ["Пунктуация в предложении"]
                      : ["Sentence punctuation"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "Выберите предложение без ошибки: Я люблю читать книги.",
                          userAnswer: "Я люблю читать книги.",
                          correctAnswer: "Я люблю читать книги.",
                          isCorrect: true,
                          topic: "Грамматика",
                          explanation:
                            "Жауап дұрыс: сөйлемде бастауыш, баяндауыш және толықтауыш дұрыс байланысқан.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "Выберите предложение без ошибки: Я люблю читать книги.",
                            userAnswer: "Я люблю читать книги.",
                            correctAnswer: "Я люблю читать книги.",
                            isCorrect: true,
                            topic: "Грамматика",
                            explanation:
                              "Ответ верный: в предложении правильно связаны подлежащее, сказуемое и дополнение.",
                          },
                        ]
                      : [
                          {
                            question:
                              "Choose the sentence without a mistake: Я люблю читать книги.",
                            userAnswer: "Я люблю читать книги.",
                            correctAnswer: "Я люблю читать книги.",
                            isCorrect: true,
                            topic: "Grammar",
                            explanation:
                              "The answer is correct: the subject, verb, and object are connected properly.",
                          },
                        ],
                language,
              }}
            />
          </div>

          {/* Friday */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {t("plan_fri_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  {t("plan_fri_title")}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-variant" />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">{t("plan_fri_desc")}</p>
            <div className="mt-auto">
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: 0 }} />
              </div>
            </div>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle: t("plan_fri_title"),
                taskType: "task",
                subject: "NIS Quantitative",
                score: 70,
                totalQuestions: 10,
                correctAnswers: 7,
                weakTopics:
                  language === "KZ"
                    ? ["Кестедегі деректерді салыстыру"]
                    : language === "RU"
                      ? ["Сравнение данных в таблице"]
                      : ["Comparing table data"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "Егер A = 12 және B = 15 болса, қайсысы үлкен?",
                          userAnswer: "B",
                          correctAnswer: "B",
                          isCorrect: true,
                          topic: "Сандық сипаттамалар",
                          explanation: "15 саны 12-ден үлкен, сондықтан B мәні үлкен.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "Если A = 12 и B = 15, что больше?",
                            userAnswer: "B",
                            correctAnswer: "B",
                            isCorrect: true,
                            topic: "Количественные характеристики",
                            explanation: "15 больше 12, поэтому значение B больше.",
                          },
                        ]
                      : [
                          {
                            question: "If A = 12 and B = 15, which is greater?",
                            userAnswer: "B",
                            correctAnswer: "B",
                            isCorrect: true,
                            topic: "Quantitative characteristics",
                            explanation: "15 is greater than 12, so B is greater.",
                          },
                        ],
                language,
              }}
            />
          </div>

          {/* Weekend */}
          <div className="glass-card rounded-[16px] p-5 flex flex-col gap-4 bg-primary-fixed/40 border border-primary-fixed-dim shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  {t("plan_weekend_track")}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-primary-fixed mt-1">
                  {t("plan_weekend_title")}
                </h3>
              </div>
              <span
                className="material-symbols-outlined text-primary bg-surface p-2 rounded-full shadow-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <p className="font-body-md text-sm text-on-primary-fixed-variant">
              {t("plan_weekend_desc")}
            </p>
            <button className="mt-auto bg-surface text-primary font-label-md px-6 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-surface-container-lowest active:scale-95 transition-all self-start border border-primary-fixed-dim cursor-pointer">
              {t("plan_btn_start")}
            </button>
            <AIReviewPanel
              buttonLabel={reviewLabel}
              payload={{
                taskTitle: t("plan_weekend_title"),
                taskType: "test",
                subject: "NIS/BIL/NSPM",
                score: 68,
                totalQuestions: 30,
                correctAnswers: 20,
                weakTopics:
                  language === "KZ"
                    ? ["Пайыз", "Мәтінді талдау", "Уақытты басқару"]
                    : language === "RU"
                      ? ["Проценты", "Анализ текста", "Управление временем"]
                      : ["Percentages", "Text analysis", "Time management"],
                attempts:
                  language === "KZ"
                    ? [
                        {
                          question: "120 санының 15%-ын тап.",
                          userAnswer: "12",
                          correctAnswer: "18",
                          isCorrect: false,
                          topic: "Пайыз",
                          explanation: "10% = 12, 5% = 6, барлығы 18.",
                        },
                      ]
                    : language === "RU"
                      ? [
                          {
                            question: "Найди 15% от 120.",
                            userAnswer: "12",
                            correctAnswer: "18",
                            isCorrect: false,
                            topic: "Проценты",
                            explanation: "10% = 12, 5% = 6, вместе 18.",
                          },
                        ]
                      : [
                          {
                            question: "Find 15% of 120.",
                            userAnswer: "12",
                            correctAnswer: "18",
                            isCorrect: false,
                            topic: "Percentages",
                            explanation: "10% is 12, 5% is 6, so the total is 18.",
                          },
                        ],
                language,
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
