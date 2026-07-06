export type ExamTrack = "NIS" | "BIL" | "NSPM" | "MIXED";
export type Lang = "EN" | "KZ" | "RU";

export type ExamQuestion = {
  id: string;
  sectionId: string;
  topic: Record<Lang, string>;
  question: Record<Lang, string>;
  options: Record<Lang, string[]>;
  answerIndex: number;
  explanation: Record<Lang, string>;
};

export type ExamSection = {
  id: string;
  icon: string;
  title: Record<Lang, string>;
  questions: ExamQuestion[];
};

export const examSections: ExamSection[] = [
  {
    id: "math",
    icon: "calculate",
    title: { EN: "Mathematics", KZ: "Математика", RU: "Математика" },
    questions: [
      {
        id: "math-percent-1",
        sectionId: "math",
        topic: { EN: "Percentages", KZ: "Пайыз", RU: "Проценты" },
        question: {
          EN: "Find 25% of 80.",
          KZ: "80 санының 25%-ын тап.",
          RU: "Найдите 25% от 80.",
        },
        options: {
          EN: ["15", "20", "25", "30"],
          KZ: ["15", "20", "25", "30"],
          RU: ["15", "20", "25", "30"],
        },
        answerIndex: 1,
        explanation: {
          EN: "25% is one quarter. 80 divided by 4 is 20.",
          KZ: "25% дегеніміз төрттен бір бөлік. 80-ді 4-ке бөлсек, 20 шығады.",
          RU: "25% — это четверть. 80 делим на 4, получаем 20.",
        },
      },
      {
        id: "math-equation-1",
        sectionId: "math",
        topic: { EN: "Equations", KZ: "Теңдеулер", RU: "Уравнения" },
        question: { EN: "Solve: x + 7 = 19", KZ: "Шеш: x + 7 = 19", RU: "Решите: x + 7 = 19" },
        options: {
          EN: ["10", "11", "12", "13"],
          KZ: ["10", "11", "12", "13"],
          RU: ["10", "11", "12", "13"],
        },
        answerIndex: 2,
        explanation: {
          EN: "Subtract 7 from both sides: x = 19 - 7 = 12.",
          KZ: "Екі жақтан да 7-ні азайтамыз: x = 19 - 7 = 12.",
          RU: "Вычитаем 7 из обеих частей: x = 19 - 7 = 12.",
        },
      },
    ],
  },
  {
    id: "logic",
    icon: "extension",
    title: { EN: "Logic", KZ: "Логика", RU: "Логика" },
    questions: [
      {
        id: "logic-sequence-1",
        sectionId: "logic",
        topic: { EN: "Sequences", KZ: "Тізбек", RU: "Последовательности" },
        question: { EN: "Continue: 3, 6, 12, 24, ?", KZ: "Жалғастыр: 3, 6, 12, 24, ?", RU: "Продолжите: 3, 6, 12, 24, ?" },
        options: {
          EN: ["30", "36", "42", "48"],
          KZ: ["30", "36", "42", "48"],
          RU: ["30", "36", "42", "48"],
        },
        answerIndex: 3,
        explanation: {
          EN: "Each number is multiplied by 2, so 24 × 2 = 48.",
          KZ: "Әр сан 2-ге көбейіп тұр, сондықтан 24 × 2 = 48.",
          RU: "Каждое число умножается на 2, значит 24 × 2 = 48.",
        },
      },
      {
        id: "logic-compare-1",
        sectionId: "logic",
        topic: { EN: "Comparison", KZ: "Салыстыру", RU: "Сравнение" },
        question: { EN: "Which is greater: 3/4 or 2/3?", KZ: "Қайсысы үлкен: 3/4 әлде 2/3?", RU: "Что больше: 3/4 или 2/3?" },
        options: {
          EN: ["3/4", "2/3", "Equal", "Cannot tell"],
          KZ: ["3/4", "2/3", "Тең", "Анықтау мүмкін емес"],
          RU: ["3/4", "2/3", "Равны", "Нельзя определить"],
        },
        answerIndex: 0,
        explanation: {
          EN: "Compare by cross multiplication: 3×3=9 and 2×4=8, so 3/4 is greater.",
          KZ: "Айқастыра көбейтеміз: 3×3=9, 2×4=8. Сондықтан 3/4 үлкен.",
          RU: "Сравним крест-накрест: 3×3=9, 2×4=8. Значит, 3/4 больше.",
        },
      },
    ],
  },
  {
    id: "reading",
    icon: "menu_book",
    title: { EN: "Reading", KZ: "Оқу сауаттылығы", RU: "Читательская грамотность" },
    questions: [
      {
        id: "reading-main-idea-1",
        sectionId: "reading",
        topic: { EN: "Main idea", KZ: "Негізгі ой", RU: "Главная мысль" },
        question: {
          EN: "A pupil studies every day and improves slowly. What is the main idea?",
          KZ: "Оқушы күн сайын оқып, біртіндеп жақсарды. Негізгі ой қандай?",
          RU: "Ученик занимается каждый день и постепенно улучшается. Какова главная мысль?",
        },
        options: {
          EN: ["Luck matters most", "Small daily effort helps", "Tests are impossible", "Reading is boring"],
          KZ: ["Сәттілік маңызды", "Күнделікті аз еңбек көмектеседі", "Тест қиын емес", "Оқу қызық емес"],
          RU: ["Главное удача", "Ежедневные усилия помогают", "Тесты невозможны", "Читать скучно"],
        },
        answerIndex: 1,
        explanation: {
          EN: "The text focuses on steady daily effort leading to improvement.",
          KZ: "Мәтін күнделікті тұрақты еңбектің нәтиже беретінін көрсетеді.",
          RU: "Текст показывает, что регулярные ежедневные усилия дают результат.",
        },
      },
    ],
  },
  {
    id: "english",
    icon: "language",
    title: { EN: "English", KZ: "Ағылшын тілі", RU: "Английский язык" },
    questions: [
      {
        id: "english-grammar-1",
        sectionId: "english",
        topic: { EN: "Grammar", KZ: "Грамматика", RU: "Грамматика" },
        question: { EN: "Choose the correct sentence.", KZ: "Дұрыс сөйлемді таңда.", RU: "Выберите правильное предложение." },
        options: {
          EN: ["She go to school.", "She goes to school.", "She going school.", "She to school goes."],
          KZ: ["She go to school.", "She goes to school.", "She going school.", "She to school goes."],
          RU: ["She go to school.", "She goes to school.", "She going school.", "She to school goes."],
        },
        answerIndex: 1,
        explanation: {
          EN: "With he/she/it in Present Simple, we add -s: she goes.",
          KZ: "Present Simple-де he/she/it үшін етістікке -s қосылады: she goes.",
          RU: "В Present Simple с he/she/it добавляем -s: she goes.",
        },
      },
    ],
  },
];

export const examQuestions = examSections.flatMap((section) => section.questions);
