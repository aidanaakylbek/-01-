import type { Lang } from "@/hooks/use-language";

export type Topic = {
  id: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  difficulty: "basic" | "medium" | "advanced";
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
