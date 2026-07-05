import type { Lang } from "@/hooks/use-language";

export type Topic = {
  id: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  difficulty: "basic" | "medium" | "advanced";
  lesson?: {
    intro: Record<Lang, string[]>;
    goals: Record<Lang, string[]>;
    blocks: Array<{
      title: Record<Lang, string>;
      body: Record<Lang, string[]>;
    }>;
    quiz: Array<{
      question: Record<Lang, string>;
      options: Record<Lang, string[]>;
      answerIndex: number;
      explanation: Record<Lang, string>;
    }>;
  };
};

export type SubjectModule = {
  id: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  topics: Topic[];
};

export type Subject = {
  id: string;
  icon: string;
  exam: "NIS" | "BIL" | "NSPM" | "ALL";
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  modules: SubjectModule[];
};

export const subjects: Subject[] = [
  {
    id: "math",
    icon: "calculate",
    exam: "ALL",
    title: { EN: "Mathematics", KZ: "Математика", RU: "Математика" },
    description: {
      EN: "Numbers, percentages, equations, and problem solving.",
      KZ: "Сандар, пайыз, теңдеулер және есеп шығару.",
      RU: "Числа, проценты, уравнения и решение задач.",
    },
    modules: [
      {
        id: "numbers-percentages",
        title: { EN: "Numbers and Percentages", KZ: "Сандар және пайыз", RU: "Числа и проценты" },
        description: {
          EN: "Core arithmetic skills for exam tasks.",
          KZ: "Емтихан есептеріне керек негізгі арифметика.",
          RU: "Базовая арифметика для экзаменационных задач.",
        },
        topics: [
          {
            id: "natural-numbers",
            title: { EN: "Natural numbers", KZ: "Натурал сандар", RU: "Натуральные числа" },
            description: {
              EN: "Understand counting numbers, why 0 is not used here, and how to identify natural numbers in tests.",
              KZ: "Санау сандарын түсіну, 0-дің неге кірмейтінін білу және тестте натурал сандарды ажырату.",
              RU: "Понять числа для счета, почему 0 здесь не входит, и как находить натуральные числа в тестах.",
            },
            difficulty: "basic",
            lesson: {
              intro: {
                EN: [
                  "Hi! I am AI-Sana. Today we learn one of the first and most important math topics: natural numbers.",
                  "This topic looks simple, but it is important for NIS-style tests because fractions, equations, percentages, and logic tasks all begin with understanding numbers.",
                ],
                KZ: [
                  "Сәлем! Мен — AI-Sana. Бүгін біз математикадағы ең алғашқы және ең маңызды тақырыптардың бірі — натурал сандарды үйренеміз.",
                  "Бұл тақырып оңай көрінуі мүмкін, бірақ НЗМ тесттерінде сандарды дұрыс ажырата білу өте маңызды. Себебі кейінгі бөлшек, теңдеу, пайыз, логикалық есептердің бәрі осы қарапайым сандардан басталады.",
                ],
                RU: [
                  "Привет! Я AI-Sana. Сегодня мы изучим одну из первых и самых важных тем математики — натуральные числа.",
                  "Тема кажется простой, но для тестов НИШ важно уметь правильно отличать числа: дроби, уравнения, проценты и логика начинаются именно отсюда.",
                ],
              },
              goals: {
                EN: [
                  "understand what a natural number is",
                  "separate natural numbers from other numbers",
                  "know that 0 is not a natural number in this course",
                  "find natural numbers in a list",
                  "answer simple test questions",
                ],
                KZ: [
                  "натурал сан деген не екенін түсінесің",
                  "натурал сандарды басқа сандардан ажырата аласың",
                  "0 санының натурал санға жатпайтынын білесің",
                  "сандар қатарынан натурал сандарды таба аласың",
                  "қарапайым тест сұрақтарына дұрыс жауап бере аласың",
                ],
                RU: [
                  "поймешь, что такое натуральное число",
                  "сможешь отличать натуральные числа от других",
                  "запомнишь, что 0 в этом курсе не считается натуральным числом",
                  "сможешь находить натуральные числа в списке",
                  "ответишь на простые тестовые вопросы",
                ],
              },
              blocks: [
                {
                  title: {
                    EN: "What is a natural number?",
                    KZ: "Натурал сан деген не?",
                    RU: "Что такое натуральное число?",
                  },
                  body: {
                    EN: [
                      "Natural numbers are numbers used for counting: 1, 2, 3, 4, 5, ...",
                      "For example: 3 notebooks, 25 pupils, 4 books, 6 apples. The numbers 3, 25, 4, and 6 are natural numbers.",
                    ],
                    KZ: [
                      "Натурал сандар — санау үшін қолданылатын сандар: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...",
                      "Мысалы: менде 3 дәптер бар, сыныпта 25 оқушы бар, үстелде 4 кітап жатыр, дүкеннен 6 алма алдым. Осы 3, 25, 4, 6 сандары — натурал сандар.",
                    ],
                    RU: [
                      "Натуральные числа — это числа, которые используют для счета: 1, 2, 3, 4, 5, ...",
                      "Например: 3 тетради, 25 учеников, 4 книги, 6 яблок. Числа 3, 25, 4 и 6 — натуральные.",
                    ],
                  },
                },
                {
                  title: {
                    EN: "Is 0 natural?",
                    KZ: "0 натурал сан ба?",
                    RU: "0 — натуральное число?",
                  },
                  body: {
                    EN: [
                      "No. In this school course, 0 is not a natural number because natural numbers are used for counting and counting starts from 1.",
                      "0 apples means there are no apples. So remember: natural numbers are counting numbers that start from 1.",
                    ],
                    KZ: [
                      "Жоқ. Көп жағдайда мектеп математикасында 0 натурал санға жатпайды.",
                      "Себебі натурал сандар санау үшін қолданылады, ал санау 1-ден басталады: 1 оқушы, 2 оқушы, 3 оқушы. 0 алма — алма жоқ дегенді білдіреді.",
                      "Есте сақта: натурал сандар — 1-ден басталатын санау сандары.",
                    ],
                    RU: [
                      "Нет. В школьном курсе 0 обычно не относят к натуральным числам.",
                      "Натуральные числа нужны для счета, а счет начинается с 1: 1 ученик, 2 ученика, 3 ученика. 0 яблок означает, что яблок нет.",
                      "Запомни: натуральные числа — это числа для счета, которые начинаются с 1.",
                    ],
                  },
                },
                {
                  title: {
                    EN: "Examples and non-examples",
                    KZ: "Мысалдар және қарсы мысалдар",
                    RU: "Примеры и не примеры",
                  },
                  body: {
                    EN: [
                      "Natural numbers: 1, 2, 5, 10, 27, 100, 1000.",
                      "Not natural numbers: 0, -3, 2.5, 1/2, -10.",
                      "A number is natural if it is positive, whole, starts from 1, and is not a fraction.",
                    ],
                    KZ: [
                      "Натурал сандар: 1, 2, 5, 10, 27, 100, 1000. Себебі олармен заттарды санауға болады.",
                      "Натурал сан емес: 0 — санау саны емес; -3 және -10 — теріс сандар; 2,5 — ондық бөлшек; 1/2 — жай бөлшек.",
                      "Натурал сан болу үшін сан оң болуы керек, бүтін болуы керек, 1-ден басталуы керек және бөлшек болмауы керек.",
                    ],
                    RU: [
                      "Натуральные числа: 1, 2, 5, 10, 27, 100, 1000.",
                      "Не натуральные: 0, -3, 2,5, 1/2, -10.",
                      "Число натуральное, если оно положительное, целое, начинается с 1 и не является дробью.",
                    ],
                  },
                },
                {
                  title: { EN: "Worked examples", KZ: "Мысалдар", RU: "Разбор примеров" },
                  body: {
                    EN: [
                      "From 4, -2, 0, 7, 1/3, 15 the natural numbers are 4, 7, 15.",
                      "The natural numbers between 12 and 17 are 13, 14, 15, 16. The word between means we do not include 12 and 17.",
                      "In the sentence “There are 28 pupils in the class”, 28 is a natural number because pupils can be counted.",
                    ],
                    KZ: [
                      "4, -2, 0, 7, 1/3, 15 сандарының ішінен натурал сандар: 4, 7, 15.",
                      "12 мен 17 арасындағы натурал сандар: 13, 14, 15, 16. “Арасындағы” деген сөз 12 мен 17-нің өзін алмаймыз дегенді білдіреді.",
                      "“Сыныпта 28 оқушы бар” деген сөйлемдегі 28 — натурал сан, себебі оқушыларды санауға болады.",
                    ],
                    RU: [
                      "Из чисел 4, -2, 0, 7, 1/3, 15 натуральные числа: 4, 7, 15.",
                      "Натуральные числа между 12 и 17: 13, 14, 15, 16. Слово между означает, что 12 и 17 не берем.",
                      "В предложении “В классе 28 учеников” число 28 — натуральное, потому что учеников можно считать.",
                    ],
                  },
                },
                {
                  title: { EN: "Quick summary", KZ: "Қысқаша қорытынды", RU: "Краткий итог" },
                  body: {
                    EN: [
                      "Natural numbers are 1, 2, 3, 4, 5, ...",
                      "They are used for counting. 0, negative numbers, fractions, and decimals are not natural numbers.",
                    ],
                    KZ: [
                      "Натурал сандар: 1, 2, 3, 4, 5, ... Олар санау үшін қолданылады.",
                      "Натурал сандарға 0, теріс сандар, бөлшектер және ондық бөлшектер жатпайды.",
                    ],
                    RU: [
                      "Натуральные числа: 1, 2, 3, 4, 5, ... Они используются для счета.",
                      "0, отрицательные числа, дроби и десятичные дроби не являются натуральными числами.",
                    ],
                  },
                },
              ],
              quiz: [
                {
                  question: {
                    EN: "Which one is a natural number?",
                    KZ: "Қайсысы натурал сан?",
                    RU: "Какое число натуральное?",
                  },
                  options: {
                    EN: ["-5", "0", "8", "2.4"],
                    KZ: ["-5", "0", "8", "2,4"],
                    RU: ["-5", "0", "8", "2,4"],
                  },
                  answerIndex: 2,
                  explanation: {
                    EN: "8 is positive, whole, and can be used for counting.",
                    KZ: "8 — оң бүтін сан және санауға қолданылады.",
                    RU: "8 — положительное целое число, его можно использовать для счета.",
                  },
                },
                {
                  question: {
                    EN: "Which number is not natural?",
                    KZ: "Мына сандардың қайсысы натурал сан емес?",
                    RU: "Какое число не является натуральным?",
                  },
                  options: {
                    EN: ["15", "1", "100", "-3"],
                    KZ: ["15", "1", "100", "-3"],
                    RU: ["15", "1", "100", "-3"],
                  },
                  answerIndex: 3,
                  explanation: {
                    EN: "-3 is negative, so it is not natural.",
                    KZ: "-3 — теріс сан, сондықтан натурал сан емес.",
                    RU: "-3 — отрицательное число, поэтому оно не натуральное.",
                  },
                },
                {
                  question: {
                    EN: "Natural numbers start from which number?",
                    KZ: "Натурал сандар қай саннан басталады?",
                    RU: "С какого числа начинаются натуральные числа?",
                  },
                  options: {
                    EN: ["-1", "0", "1", "10"],
                    KZ: ["-1", "0", "1", "10"],
                    RU: ["-1", "0", "1", "10"],
                  },
                  answerIndex: 2,
                  explanation: {
                    EN: "In this course, natural numbers start from 1.",
                    KZ: "Бұл курста натурал сандар 1-ден басталады.",
                    RU: "В этом курсе натуральные числа начинаются с 1.",
                  },
                },
                {
                  question: {
                    EN: "Choose the natural numbers between 6 and 11.",
                    KZ: "6 мен 11 арасындағы натурал сандарды таңда.",
                    RU: "Выбери натуральные числа между 6 и 11.",
                  },
                  options: {
                    EN: ["6, 7, 8, 9, 10, 11", "7, 8, 9, 10", "5, 6, 7, 8", "10, 11, 12"],
                    KZ: ["6, 7, 8, 9, 10, 11", "7, 8, 9, 10", "5, 6, 7, 8", "10, 11, 12"],
                    RU: ["6, 7, 8, 9, 10, 11", "7, 8, 9, 10", "5, 6, 7, 8", "10, 11, 12"],
                  },
                  answerIndex: 1,
                  explanation: {
                    EN: "Between means we do not include 6 and 11, so the answer is 7, 8, 9, 10.",
                    KZ: "“Арасындағы” дегенде 6 мен 11 алынбайды, сондықтан жауап: 7, 8, 9, 10.",
                    RU: "Между означает, что 6 и 11 не включаем. Ответ: 7, 8, 9, 10.",
                  },
                },
                {
                  question: {
                    EN: "In “I have 12 books”, what kind of number is 12?",
                    KZ: "“Менде 12 кітап бар” деген сөйлемдегі 12 қандай сан?",
                    RU: "В предложении “У меня 12 книг” каким числом является 12?",
                  },
                  options: {
                    EN: ["negative number", "natural number", "decimal", "fraction"],
                    KZ: ["теріс сан", "натурал сан", "ондық бөлшек", "жай бөлшек"],
                    RU: [
                      "отрицательное число",
                      "натуральное число",
                      "десятичная дробь",
                      "обыкновенная дробь",
                    ],
                  },
                  answerIndex: 1,
                  explanation: {
                    EN: "12 counts books, so it is a natural number.",
                    KZ: "12 кітап санын көрсетеді, сондықтан ол натурал сан.",
                    RU: "12 показывает количество книг, значит это натуральное число.",
                  },
                },
              ],
            },
          },
          {
            id: "percent-of-number",
            title: { EN: "Percent of a number", KZ: "Санның пайызын табу", RU: "Процент от числа" },
            description: {
              EN: "Find 10%, 25%, 50%, and mixed percentages.",
              KZ: "10%, 25%, 50% және аралас пайыздарды табу.",
              RU: "Находить 10%, 25%, 50% и смешанные проценты.",
            },
            difficulty: "basic",
          },
          {
            id: "word-problems",
            title: { EN: "Word problems", KZ: "Мәтінді есептер", RU: "Текстовые задачи" },
            description: {
              EN: "Turn a story problem into equations.",
              KZ: "Мәтінді есепті теңдеуге айналдыру.",
              RU: "Переводить текстовую задачу в уравнение.",
            },
            difficulty: "medium",
          },
        ],
      },
      {
        id: "algebra",
        title: { EN: "Algebra", KZ: "Алгебра", RU: "Алгебра" },
        description: {
          EN: "Expressions, equations, and simple functions.",
          KZ: "Өрнектер, теңдеулер және қарапайым функциялар.",
          RU: "Выражения, уравнения и простые функции.",
        },
        topics: [
          {
            id: "linear-equations",
            title: { EN: "Linear equations", KZ: "Сызықтық теңдеулер", RU: "Линейные уравнения" },
            description: {
              EN: "Solve equations with one unknown.",
              KZ: "Бір белгісізі бар теңдеулерді шешу.",
              RU: "Решать уравнения с одним неизвестным.",
            },
            difficulty: "medium",
          },
        ],
      },
    ],
  },
  {
    id: "logic",
    icon: "extension",
    exam: "NSPM",
    title: { EN: "Logic", KZ: "Логика", RU: "Логика" },
    description: {
      EN: "Patterns, sequences, classification, and reasoning.",
      KZ: "Заңдылықтар, тізбектер, жіктеу және ойлау.",
      RU: "Закономерности, последовательности, классификация и рассуждение.",
    },
    modules: [
      {
        id: "patterns",
        title: { EN: "Patterns", KZ: "Заңдылықтар", RU: "Закономерности" },
        description: {
          EN: "Find rules in numbers, shapes, and symbols.",
          KZ: "Сандар, фигуралар және белгілердегі ережені табу.",
          RU: "Находить правила в числах, фигурах и символах.",
        },
        topics: [
          {
            id: "number-sequences",
            title: {
              EN: "Number sequences",
              KZ: "Сан тізбектері",
              RU: "Числовые последовательности",
            },
            description: {
              EN: "Identify addition, multiplication, and mixed rules.",
              KZ: "Қосу, көбейту және аралас заңдылықтарды анықтау.",
              RU: "Определять сложение, умножение и смешанные правила.",
            },
            difficulty: "basic",
          },
          {
            id: "odd-one-out",
            title: { EN: "Odd one out", KZ: "Артық элемент", RU: "Лишний элемент" },
            description: {
              EN: "Find what does not fit the group.",
              KZ: "Топқа сәйкес келмейтін элементті табу.",
              RU: "Находить элемент, который не подходит к группе.",
            },
            difficulty: "medium",
          },
        ],
      },
    ],
  },
  {
    id: "natural-science",
    icon: "science",
    exam: "NIS",
    title: { EN: "Natural Science", KZ: "Жаратылыстану", RU: "Естествознание" },
    description: {
      EN: "Biology, physics, chemistry, and scientific thinking.",
      KZ: "Биология, физика, химия және ғылыми ойлау.",
      RU: "Биология, физика, химия и научное мышление.",
    },
    modules: [
      {
        id: "biology-basics",
        title: { EN: "Biology Basics", KZ: "Биология негіздері", RU: "Основы биологии" },
        description: {
          EN: "Living organisms, plants, and ecosystems.",
          KZ: "Тірі ағзалар, өсімдіктер және экожүйелер.",
          RU: "Живые организмы, растения и экосистемы.",
        },
        topics: [
          {
            id: "photosynthesis",
            title: { EN: "Photosynthesis", KZ: "Фотосинтез", RU: "Фотосинтез" },
            description: {
              EN: "How plants make food and release oxygen.",
              KZ: "Өсімдіктердің қорек түзіп, оттек бөлуі.",
              RU: "Как растения создают пищу и выделяют кислород.",
            },
            difficulty: "basic",
          },
        ],
      },
    ],
  },
  {
    id: "reading",
    icon: "menu_book",
    exam: "BIL",
    title: { EN: "Reading Literacy", KZ: "Оқу сауаттылығы", RU: "Читательская грамотность" },
    description: {
      EN: "Main idea, inference, vocabulary, and text analysis.",
      KZ: "Негізгі ой, қорытынды, сөз мағынасы және мәтін талдау.",
      RU: "Главная мысль, выводы, лексика и анализ текста.",
    },
    modules: [
      {
        id: "text-understanding",
        title: { EN: "Text Understanding", KZ: "Мәтінді түсіну", RU: "Понимание текста" },
        description: {
          EN: "Read carefully and answer meaning-based questions.",
          KZ: "Мәтінді мұқият оқып, мағынаға қатысты сұрақтарға жауап беру.",
          RU: "Внимательно читать и отвечать на вопросы по смыслу.",
        },
        topics: [
          {
            id: "main-idea",
            title: { EN: "Main idea", KZ: "Негізгі ой", RU: "Главная мысль" },
            description: {
              EN: "Find what the whole text is mostly about.",
              KZ: "Мәтіннің жалпы не туралы екенін табу.",
              RU: "Определять, о чем весь текст в целом.",
            },
            difficulty: "basic",
          },
        ],
      },
    ],
  },
  {
    id: "english",
    icon: "translate",
    exam: "ALL",
    title: { EN: "English", KZ: "Ағылшын тілі", RU: "Английский" },
    description: {
      EN: "Grammar, vocabulary, and short text comprehension.",
      KZ: "Грамматика, сөздік қор және қысқа мәтінді түсіну.",
      RU: "Грамматика, словарный запас и понимание коротких текстов.",
    },
    modules: [
      {
        id: "grammar",
        title: { EN: "Grammar", KZ: "Грамматика", RU: "Грамматика" },
        description: {
          EN: "Sentence structure and verb forms.",
          KZ: "Сөйлем құрылымы және етістік формалары.",
          RU: "Структура предложения и формы глаголов.",
        },
        topics: [
          {
            id: "present-simple",
            title: { EN: "Present Simple", KZ: "Present Simple", RU: "Present Simple" },
            description: {
              EN: "Use -s with he, she, and it.",
              KZ: "He, she, it тұлғаларымен -s қолдану.",
              RU: "Использовать -s с he, she и it.",
            },
            difficulty: "basic",
          },
        ],
      },
    ],
  },
  {
    id: "kazakh",
    icon: "record_voice_over",
    exam: "ALL",
    title: { EN: "Kazakh", KZ: "Қазақ тілі", RU: "Казахский язык" },
    description: {
      EN: "Kazakh grammar, vocabulary, and reading.",
      KZ: "Қазақ тілі грамматикасы, сөздік және оқу.",
      RU: "Грамматика казахского языка, лексика и чтение.",
    },
    modules: [
      {
        id: "kazakh-reading",
        title: { EN: "Reading", KZ: "Оқу", RU: "Чтение" },
        description: {
          EN: "Understand Kazakh texts and main ideas.",
          KZ: "Қазақша мәтін мен негізгі ойды түсіну.",
          RU: "Понимать казахские тексты и главную мысль.",
        },
        topics: [
          {
            id: "kazakh-main-idea",
            title: { EN: "Main idea", KZ: "Негізгі ой", RU: "Главная мысль" },
            description: {
              EN: "Identify the central idea of a Kazakh text.",
              KZ: "Қазақша мәтіннің негізгі ойын анықтау.",
              RU: "Определять главную мысль казахского текста.",
            },
            difficulty: "basic",
          },
        ],
      },
    ],
  },
  {
    id: "russian",
    icon: "language",
    exam: "ALL",
    title: { EN: "Russian", KZ: "Орыс тілі", RU: "Русский язык" },
    description: {
      EN: "Russian grammar, punctuation, and reading.",
      KZ: "Орыс тілі грамматикасы, пунктуация және оқу.",
      RU: "Грамматика, пунктуация и чтение по русскому языку.",
    },
    modules: [
      {
        id: "russian-grammar",
        title: { EN: "Grammar", KZ: "Грамматика", RU: "Грамматика" },
        description: {
          EN: "Sentence structure and punctuation.",
          KZ: "Сөйлем құрылымы және тыныс белгілері.",
          RU: "Структура предложения и пунктуация.",
        },
        topics: [
          {
            id: "sentence-punctuation",
            title: {
              EN: "Sentence punctuation",
              KZ: "Сөйлем тыныс белгілері",
              RU: "Пунктуация в предложении",
            },
            description: {
              EN: "Use punctuation to show meaning clearly.",
              KZ: "Мағынаны анық көрсету үшін тыныс белгілерін қолдану.",
              RU: "Использовать пунктуацию для ясной передачи смысла.",
            },
            difficulty: "medium",
          },
        ],
      },
    ],
  },
];

export function getSubject(subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getTopic(subjectId: string, topicId: string) {
  const subject = getSubject(subjectId);
  const module = subject?.modules.find((item) => item.topics.some((topic) => topic.id === topicId));
  const topic = module?.topics.find((item) => item.id === topicId);

  if (!subject || !module || !topic) return null;

  return { subject, module, topic };
}
