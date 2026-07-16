import type { Lang } from "@/hooks/use-language";

export type DiagnosticQuestion = {
  id: string;
  exam: "NIS" | "BIL" | "RFMS";
  subject: string;
  topic: string;
  question: Record<Lang, string>;
  options: Record<Lang, string[]>;
  correctAnswer: Record<Lang, string>;
  explanation: Record<Lang, string>;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "percent-25-of-80",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Percentages",
    question: {
      EN: "Find 25% of 80.",
      KZ: "80 санының 25%-ын тап.",
      RU: "Найди 25% от 80.",
    },
    options: {
      EN: ["15", "20", "25", "40"],
      KZ: ["15", "20", "25", "40"],
      RU: ["15", "20", "25", "40"],
    },
    correctAnswer: {
      EN: "20",
      KZ: "20",
      RU: "20",
    },
    explanation: {
      EN: "25% means one fourth. Divide 80 by 4: 80 / 4 = 20.",
      KZ: "25% дегеніміз төрттен бір бөлік. 80-ді 4-ке бөлеміз: 80 / 4 = 20.",
      RU: "25% означает одну четвертую часть. Делим 80 на 4: 80 / 4 = 20.",
    },
  },
  {
    id: "logic-double-sequence",
    exam: "RFMS",
    subject: "Logic",
    topic: "Logic patterns",
    question: {
      EN: "2, 4, 8, 16, ? What comes next?",
      KZ: "2, 4, 8, 16, ? тізбегіндегі келесі сан қандай?",
      RU: "2, 4, 8, 16, ? Какое число следующее?",
    },
    options: {
      EN: ["18", "24", "32", "36"],
      KZ: ["18", "24", "32", "36"],
      RU: ["18", "24", "32", "36"],
    },
    correctAnswer: {
      EN: "32",
      KZ: "32",
      RU: "32",
    },
    explanation: {
      EN: "Each number is multiplied by 2, so 16 x 2 = 32.",
      KZ: "Әр сан 2-ге көбейеді, сондықтан 16 x 2 = 32.",
      RU: "Каждое число умножается на 2, поэтому 16 x 2 = 32.",
    },
  },
  {
    id: "reading-main-idea",
    exam: "BIL",
    subject: "Reading Literacy",
    topic: "Main idea",
    question: {
      EN: "A pupil studies a little every day and improves each week. What is the main idea?",
      KZ: "Оқушы күн сайын аздап дайындалып, апта сайын жақсарып отыр. Негізгі ой қандай?",
      RU: "Ученик занимается понемногу каждый день и каждую неделю улучшает результат. Главная мысль?",
    },
    options: {
      EN: [
        "Daily practice helps progress",
        "Exams are impossible",
        "Only long lessons work",
        "Resting is never useful",
      ],
      KZ: [
        "Күнделікті дайындық прогреске көмектеседі",
        "Емтихандар мүмкін емес",
        "Тек ұзақ сабақ пайдалы",
        "Демалыс ешқашан керек емес",
      ],
      RU: [
        "Ежедневная практика помогает прогрессу",
        "Экзамены невозможны",
        "Работают только длинные уроки",
        "Отдых никогда не полезен",
      ],
    },
    correctAnswer: {
      EN: "Daily practice helps progress",
      KZ: "Күнделікті дайындық прогреске көмектеседі",
      RU: "Ежедневная практика помогает прогрессу",
    },
    explanation: {
      EN: "The sentence focuses on steady daily practice and weekly improvement.",
      KZ: "Сөйлемдегі басты назар күнделікті тұрақты дайындық пен апталық жақсаруға берілген.",
      RU: "В предложении главный акцент на регулярной ежедневной практике и улучшении каждую неделю.",
    },
  },
  {
    id: "percent-15-of-120",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Percentages",
    question: {
      EN: "Find 15% of 120.",
      KZ: "120 санының 15%-ын тап.",
      RU: "Найди 15% от 120.",
    },
    options: {
      EN: ["12", "15", "18", "24"],
      KZ: ["12", "15", "18", "24"],
      RU: ["12", "15", "18", "24"],
    },
    correctAnswer: {
      EN: "18",
      KZ: "18",
      RU: "18",
    },
    explanation: {
      EN: "10% of 120 is 12, and 5% is 6. Together, 15% is 18.",
      KZ: "120-ның 10%-ы 12, ал 5%-ы 6. Барлығы 15% = 18.",
      RU: "10% от 120 равно 12, а 5% равно 6. Вместе 15% = 18.",
    },
  },
  {
    id: "logic-odd-one-out",
    exam: "RFMS",
    subject: "Logic",
    topic: "Classification",
    question: {
      EN: "Which one does not belong: 3, 6, 9, 11, 12?",
      KZ: "Қай сан артық: 3, 6, 9, 11, 12?",
      RU: "Какое число лишнее: 3, 6, 9, 11, 12?",
    },
    options: {
      EN: ["3", "6", "11", "12"],
      KZ: ["3", "6", "11", "12"],
      RU: ["3", "6", "11", "12"],
    },
    correctAnswer: {
      EN: "11",
      KZ: "11",
      RU: "11",
    },
    explanation: {
      EN: "All the other numbers are divisible by 3. 11 is not.",
      KZ: "Қалған сандардың бәрі 3-ке бөлінеді. 11 саны 3-ке бөлінбейді.",
      RU: "Все остальные числа делятся на 3. Число 11 не делится.",
    },
  },
  {
    id: "nis-number-comparison",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Number comparison",
    question: {
      EN: "Which number is greater: 0.7 or 2/3?",
      KZ: "Қай сан үлкен: 0,7 ме әлде 2/3 пе?",
      RU: "Какое число больше: 0,7 или 2/3?",
    },
    options: {
      EN: ["0.7", "2/3", "They are equal", "Cannot compare"],
      KZ: ["0,7", "2/3", "Екеуі тең", "Салыстыру мүмкін емес"],
      RU: ["0,7", "2/3", "Они равны", "Нельзя сравнить"],
    },
    correctAnswer: {
      EN: "0.7",
      KZ: "0,7",
      RU: "0,7",
    },
    explanation: {
      EN: "2/3 is about 0.666..., so 0.7 is greater.",
      KZ: "2/3 шамамен 0,666..., сондықтан 0,7 үлкен.",
      RU: "2/3 примерно равно 0,666..., значит 0,7 больше.",
    },
  },
  {
    id: "bil-english-word",
    exam: "BIL",
    subject: "English",
    topic: "Vocabulary",
    question: {
      EN: "Choose the synonym of 'begin'.",
      KZ: "'Begin' сөзінің мағынасына жақын сөзді таңда.",
      RU: "Выбери синоним слова 'begin'.",
    },
    options: {
      EN: ["start", "finish", "break", "forget"],
      KZ: ["start", "finish", "break", "forget"],
      RU: ["start", "finish", "break", "forget"],
    },
    correctAnswer: {
      EN: "start",
      KZ: "start",
      RU: "start",
    },
    explanation: {
      EN: "'Begin' and 'start' both mean to do something from the first step.",
      KZ: "'Begin' және 'start' екеуі де бір істі бастау дегенді білдіреді.",
      RU: "'Begin' и 'start' означают начать что-то делать.",
    },
  },
  {
    id: "bil-reading-detail",
    exam: "BIL",
    subject: "Reading Literacy",
    topic: "Detail",
    question: {
      EN: "Aigerim reads 10 pages every evening. How often does she read?",
      KZ: "Айгерім әр кеш сайын 10 бет оқиды. Ол қаншалықты жиі оқиды?",
      RU: "Айгерим читает 10 страниц каждый вечер. Как часто она читает?",
    },
    options: {
      EN: ["Every evening", "Once a month", "Only on Sunday", "Never"],
      KZ: ["Әр кеш сайын", "Айына бір рет", "Тек жексенбіде", "Ешқашан"],
      RU: ["Каждый вечер", "Раз в месяц", "Только в воскресенье", "Никогда"],
    },
    correctAnswer: {
      EN: "Every evening",
      KZ: "Әр кеш сайын",
      RU: "Каждый вечер",
    },
    explanation: {
      EN: "The phrase 'every evening' directly tells us the frequency.",
      KZ: "'Әр кеш сайын' деген сөз тіркесі жиілікті нақты көрсетеді.",
      RU: "Фраза 'каждый вечер' прямо показывает частоту.",
    },
  },
  {
    id: "rfms-equation",
    exam: "RFMS",
    subject: "Mathematics",
    topic: "Equations",
    question: {
      EN: "Solve: 3x + 5 = 20.",
      KZ: "Теңдеуді шеш: 3x + 5 = 20.",
      RU: "Реши уравнение: 3x + 5 = 20.",
    },
    options: {
      EN: ["3", "5", "7", "15"],
      KZ: ["3", "5", "7", "15"],
      RU: ["3", "5", "7", "15"],
    },
    correctAnswer: {
      EN: "5",
      KZ: "5",
      RU: "5",
    },
    explanation: {
      EN: "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.",
      KZ: "Екі жақтан 5-ті азайтамыз: 3x = 15. 3-ке бөлеміз: x = 5.",
      RU: "Вычитаем 5 с обеих сторон: 3x = 15. Делим на 3: x = 5.",
    },
  },
];
