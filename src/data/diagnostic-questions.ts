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
  {
    id: "nis-v2-math-01-fractions",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Fractions and operations",
    question: {
      EN: "Calculate: (3/4 + 5/6) · 12 - 7.",
      KZ: "Есептеңіз: (3/4 + 5/6) · 12 - 7.",
      RU: "Вычислите: (3/4 + 5/6) · 12 - 7.",
    },
    options: {
      EN: ["10", "12", "14", "16"],
      KZ: ["10", "12", "14", "16"],
      RU: ["10", "12", "14", "16"],
    },
    correctAnswer: { EN: "12", KZ: "12", RU: "12" },
    explanation: {
      EN: "First add the fractions: 3/4 + 5/6 = 19/12. Then 19/12 · 12 = 19, and 19 - 7 = 12.",
      KZ: "Алдымен бөлшектерді қосамыз: 3/4 + 5/6 = 19/12. Кейін 19/12 · 12 = 19, соңында 19 - 7 = 12.",
      RU: "Сначала складываем дроби: 3/4 + 5/6 = 19/12. Затем 19/12 · 12 = 19, и 19 - 7 = 12.",
    },
  },
  {
    id: "nis-v2-math-02-negative-expressions",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Negative numbers",
    question: {
      EN: "Compare the values: M = -7 - 4, N = -7 + (-4), K = -7 - (-4).",
      KZ: "Өрнектердің мәндерін салыстырыңыз: M = -7 - 4, N = -7 + (-4), K = -7 - (-4).",
      RU: "Сравните значения выражений: M = -7 - 4, N = -7 + (-4), K = -7 - (-4).",
    },
    options: {
      EN: ["M < N < K", "M = N < K", "K < M = N", "N < K < M"],
      KZ: ["M < N < K", "M = N < K", "K < M = N", "N < K < M"],
      RU: ["M < N < K", "M = N < K", "K < M = N", "N < K < M"],
    },
    correctAnswer: { EN: "M = N < K", KZ: "M = N < K", RU: "M = N < K" },
    explanation: {
      EN: "M = -11, N = -11, and K = -3. Since -11 is less than -3, M = N < K.",
      KZ: "M = -11, N = -11, K = -3. Теріс сандарда -11 саны -3-тен кіші, сондықтан M = N < K.",
      RU: "M = -11, N = -11, K = -3. Число -11 меньше -3, значит M = N < K.",
    },
  },
  {
    id: "nis-v2-math-03-coordinate-line",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Coordinate line",
    question: {
      EN: "Points A, B, C, D are in order on a coordinate line. A = 6, B = 14, AB = 2BC, BC = 2CD. Find coordinate D.",
      KZ: "A, B, C, D нүктелері координаталық түзуде ретімен орналасқан. A = 6, B = 14, AB = 2BC, BC = 2CD. D нүктесінің координатасын табыңыз.",
      RU: "Точки A, B, C, D расположены на координатной прямой последовательно. A = 6, B = 14, AB = 2BC, BC = 2CD. Найдите координату точки D.",
    },
    options: {
      EN: ["18", "20", "22", "24"],
      KZ: ["18", "20", "22", "24"],
      RU: ["18", "20", "22", "24"],
    },
    correctAnswer: { EN: "20", KZ: "20", RU: "20" },
    explanation: {
      EN: "AB = 14 - 6 = 8. Since AB = 2BC, BC = 4. Since BC = 2CD, CD = 2. So D = 14 + 4 + 2 = 20.",
      KZ: "AB = 14 - 6 = 8. AB = 2BC болғандықтан, BC = 4. BC = 2CD болғандықтан, CD = 2. Сондықтан D = 14 + 4 + 2 = 20.",
      RU: "AB = 14 - 6 = 8. Так как AB = 2BC, то BC = 4. Так как BC = 2CD, то CD = 2. Поэтому D = 14 + 4 + 2 = 20.",
    },
  },
  {
    id: "nis-v2-math-04-multiples",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Multiples",
    question: {
      EN: "How many two-digit numbers are divisible by 9 but not divisible by 27?",
      KZ: "9-ға еселік, бірақ 27-ге еселік емес екі таңбалы сандар нешеу?",
      RU: "Сколько существует двузначных чисел, кратных 9, но не кратных 27?",
    },
    options: {
      EN: ["5", "6", "8", "7"],
      KZ: ["5", "6", "8", "7"],
      RU: ["5", "6", "8", "7"],
    },
    correctAnswer: { EN: "7", KZ: "7", RU: "7" },
    explanation: {
      EN: "Two-digit multiples of 9 are 18, 27, ..., 99: 10 numbers. Multiples of 27 are 27, 54, 81: 3 numbers. So 10 - 3 = 7.",
      KZ: "Екі таңбалы 9-ға еселік сандар: 18, 27, ..., 99, барлығы 10 сан. 27-ге еселіктері: 27, 54, 81, барлығы 3 сан. Сондықтан 10 - 3 = 7.",
      RU: "Двузначные кратные 9: 18, 27, ..., 99, всего 10 чисел. Кратные 27: 27, 54, 81, всего 3. Поэтому 10 - 3 = 7.",
    },
  },
  {
    id: "nis-v2-math-05-speed",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Speed problems",
    question: {
      EN: "If Arman drives at 45 km/h, he is 20 minutes late. If he drives at 75 km/h, he arrives 20 minutes early. What speed should he drive to arrive on time?",
      KZ: "Егер Арман 45 км/сағ жылдамдықпен жүрсе, 20 минут кешігеді. Егер 75 км/сағ жылдамдықпен жүрсе, 20 минут ерте келеді. Уақытында келу үшін қандай жылдамдықпен жүруі керек?",
      RU: "Если Арман едет со скоростью 45 км/ч, он опаздывает на 20 минут. Если едет со скоростью 75 км/ч, приезжает на 20 минут раньше. С какой скоростью нужно ехать, чтобы приехать вовремя?",
    },
    options: {
      EN: ["50 km/h", "54 km/h", "56.25 km/h", "60 km/h"],
      KZ: ["50 км/сағ", "54 км/сағ", "56,25 км/сағ", "60 км/сағ"],
      RU: ["50 км/ч", "54 км/ч", "56,25 км/ч", "60 км/ч"],
    },
    correctAnswer: { EN: "56.25 km/h", KZ: "56,25 км/сағ", RU: "56,25 км/ч" },
    explanation: {
      EN: "The time difference is 40 minutes. Let distance be d. d/45 - d/75 = 2/3, so d = 75 km. On-time travel time is between them: 75 / 56.25 = 4/3 hours.",
      KZ: "Екі жағдайдың уақыт айырмасы 40 минут. Қашықтықты d дейік: d/45 - d/75 = 2/3. Осыдан d = 75 км. Уақытында келу жылдамдығы: 56,25 км/сағ.",
      RU: "Разница во времени 40 минут. Пусть расстояние d: d/45 - d/75 = 2/3. Отсюда d = 75 км. Скорость для прибытия вовремя: 56,25 км/ч.",
    },
  },
  {
    id: "nis-v2-math-06-ring-area",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Circle area",
    question: {
      EN: "A ring has outer radius 5 cm and inner radius 3 cm. Find the shaded area. Use pi = 3.14.",
      KZ: "Сақинаның үлкен шеңбер радиусы 5 см, кіші шеңбер радиусы 3 см. Боялған бөліктің ауданын табыңыз. π = 3,14 деп алыңыз.",
      RU: "Радиус большого круга 5 см, радиус малого круга 3 см. Найдите площадь закрашенной части. π = 3,14.",
    },
    options: {
      EN: ["28.26 cm²", "31.40 cm²", "50.24 cm²", "78.50 cm²"],
      KZ: ["28,26 см²", "31,40 см²", "50,24 см²", "78,50 см²"],
      RU: ["28,26 см²", "31,40 см²", "50,24 см²", "78,50 см²"],
    },
    correctAnswer: { EN: "50.24 cm²", KZ: "50,24 см²", RU: "50,24 см²" },
    explanation: {
      EN: "Ring area = pi(R² - r²) = 3.14(25 - 9) = 3.14 · 16 = 50.24.",
      KZ: "Сақина ауданы: π(R² - r²) = 3,14(25 - 9) = 3,14 · 16 = 50,24.",
      RU: "Площадь кольца: π(R² - r²) = 3,14(25 - 9) = 3,14 · 16 = 50,24.",
    },
  },
  {
    id: "nis-v2-math-07-rectangle-perimeter",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Area and perimeter",
    question: {
      EN: "A rectangle consists of four equal squares in one row. The area of one square is 25 cm². Find the rectangle perimeter.",
      KZ: "Тіктөртбұрыш бір қатарда орналасқан төрт тең шаршыдан тұрады. Бір шаршының ауданы 25 см². Тіктөртбұрыштың периметрін табыңыз.",
      RU: "Прямоугольник состоит из четырёх равных квадратов в один ряд. Площадь одного квадрата 25 см². Найдите периметр прямоугольника.",
    },
    options: {
      EN: ["40 cm", "45 cm", "50 cm", "60 cm"],
      KZ: ["40 см", "45 см", "50 см", "60 см"],
      RU: ["40 см", "45 см", "50 см", "60 см"],
    },
    correctAnswer: { EN: "50 cm", KZ: "50 см", RU: "50 см" },
    explanation: {
      EN: "One square has side 5 cm. Four squares in a row make a 20 cm by 5 cm rectangle. Perimeter = 2(20 + 5) = 50 cm.",
      KZ: "Бір шаршының қабырғасы 5 см. Төрт шаршы қатар тұрса, өлшемі 20 см × 5 см болады. Периметр: 2(20 + 5) = 50 см.",
      RU: "Сторона квадрата 5 см. Четыре квадрата дают прямоугольник 20 см × 5 см. Периметр: 2(20 + 5) = 50 см.",
    },
  },
  {
    id: "nis-v2-math-08-repeating-decimals",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Repeating decimals",
    question: {
      EN: "Calculate: 0.(36) - 0.1(6).",
      KZ: "Есептеңіз: 0,(36) - 0,1(6).",
      RU: "Вычислите: 0,(36) - 0,1(6).",
    },
    options: {
      EN: ["1/6", "13/66", "7/33", "5/22"],
      KZ: ["1/6", "13/66", "7/33", "5/22"],
      RU: ["1/6", "13/66", "7/33", "5/22"],
    },
    correctAnswer: { EN: "13/66", KZ: "13/66", RU: "13/66" },
    explanation: {
      EN: "0.(36) = 36/99 = 4/11. 0.1(6) = 1/6. Difference: 4/11 - 1/6 = 24/66 - 11/66 = 13/66.",
      KZ: "0,(36) = 36/99 = 4/11. 0,1(6) = 1/6. Айырмасы: 4/11 - 1/6 = 24/66 - 11/66 = 13/66.",
      RU: "0,(36) = 36/99 = 4/11. 0,1(6) = 1/6. Разность: 4/11 - 1/6 = 24/66 - 11/66 = 13/66.",
    },
  },
  {
    id: "nis-v2-math-09-tiles-square",
    exam: "NIS",
    subject: "Mathematics",
    topic: "LCM and area",
    question: {
      EN: "What is the minimum number of 4 cm by 6 cm rectangular tiles needed to make a square floor?",
      KZ: "4 см × 6 см өлшемді тіктөртбұрышты тақтайшалардан шаршы еден құрастыру үшін ең аз қанша тақтайша қажет?",
      RU: "Какое минимальное количество прямоугольных пластин 4 см на 6 см нужно, чтобы составить квадратный пол?",
    },
    options: {
      EN: ["6", "8", "12", "24"],
      KZ: ["6", "8", "12", "24"],
      RU: ["6", "8", "12", "24"],
    },
    correctAnswer: { EN: "6", KZ: "6", RU: "6" },
    explanation: {
      EN: "The smallest square side divisible by both 4 and 6 is 12 cm. Square area is 144, one tile area is 24, so 144 / 24 = 6.",
      KZ: "4 пен 6-ға бөлінетін ең кіші шаршы қабырғасы 12 см. Шаршы ауданы 144, бір тақтайша ауданы 24. 144 / 24 = 6.",
      RU: "Минимальная сторона квадрата, делящаяся на 4 и 6, равна 12 см. Площадь квадрата 144, площадь плитки 24. 144 / 24 = 6.",
    },
  },
  {
    id: "nis-v2-math-10-solution-percent",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Mixtures and percentages",
    question: {
      EN: "The first solution has 15% salt, the second has 30% salt. 120 g of the first and 80 g of the second are mixed. What percent salt is in the new solution?",
      KZ: "Бірінші ерітіндіде 15% тұз, екіншісінде 30% тұз бар. Біріншіден 120 г, екіншісінен 80 г араластырылды. Алынған ерітіндіде тұз неше пайыз?",
      RU: "В первом растворе 15% соли, во втором 30% соли. Смешали 120 г первого и 80 г второго. Сколько процентов соли в полученном растворе?",
    },
    options: {
      EN: ["18%", "20%", "21%", "24%"],
      KZ: ["18%", "20%", "21%", "24%"],
      RU: ["18%", "20%", "21%", "24%"],
    },
    correctAnswer: { EN: "21%", KZ: "21%", RU: "21%" },
    explanation: {
      EN: "Salt amount: 120 · 15% = 18 g and 80 · 30% = 24 g. Total salt is 42 g, total solution is 200 g. 42/200 = 21%.",
      KZ: "Тұз мөлшері: 120 · 15% = 18 г және 80 · 30% = 24 г. Барлығы 42 г тұз, ерітінді 200 г. 42/200 = 21%.",
      RU: "Соли: 120 · 15% = 18 г и 80 · 30% = 24 г. Всего 42 г соли, раствора 200 г. 42/200 = 21%.",
    },
  },
  {
    id: "nis-v2-math-11-work-rate",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Work rate",
    question: {
      EN: "Two workers complete a job together in 8 hours. The first worker alone completes it in 12 hours. How many hours does the second worker need alone?",
      KZ: "Екі жұмысшы бірге жұмысты 8 сағатта орындайды. Бірінші жұмысшы жалғыз өзі жұмысты 12 сағатта орындайды. Екінші жұмысшы жалғыз өзі жұмысты неше сағатта орындайды?",
      RU: "Двое рабочих вместе выполняют работу за 8 часов. Первый рабочий один выполняет работу за 12 часов. За сколько часов второй выполнит работу один?",
    },
    options: {
      EN: ["16", "18", "20", "24"],
      KZ: ["16", "18", "20", "24"],
      RU: ["16", "18", "20", "24"],
    },
    correctAnswer: { EN: "24", KZ: "24", RU: "24" },
    explanation: {
      EN: "Together they do 1/8 of the job per hour. The first does 1/12 per hour. The second does 1/8 - 1/12 = 1/24, so he needs 24 hours.",
      KZ: "Екеуі бірге сағатына жұмыстың 1/8 бөлігін орындайды. Біріншісі 1/12 бөлігін орындайды. Екіншісі: 1/8 - 1/12 = 1/24. Демек 24 сағат керек.",
      RU: "Вместе делают 1/8 работы в час. Первый делает 1/12. Второй: 1/8 - 1/12 = 1/24, значит ему нужно 24 часа.",
    },
  },
  {
    id: "nis-v2-math-12-equation-sum",
    exam: "NIS",
    subject: "Mathematics",
    topic: "Equations",
    question: {
      EN: "Find the sum of the roots of the equations: 2(3x - 5) - 4 = 9 and -5y + 18 = 3y - 6.",
      KZ: "Теңдеулердің түбірлерінің қосындысын табыңыз: 2(3x - 5) - 4 = 9 және -5y + 18 = 3y - 6.",
      RU: "Найдите сумму корней уравнений: 2(3x - 5) - 4 = 9 и -5y + 18 = 3y - 6.",
    },
    options: {
      EN: ["5 1/6", "6", "6 5/6", "7 1/3"],
      KZ: ["5 1/6", "6", "6 5/6", "7 1/3"],
      RU: ["5 1/6", "6", "6 5/6", "7 1/3"],
    },
    correctAnswer: { EN: "6 5/6", KZ: "6 5/6", RU: "6 5/6" },
    explanation: {
      EN: "First equation: 6x - 10 - 4 = 9, so 6x = 23 and x = 23/6. Second: -5y + 18 = 3y - 6, so 24 = 8y and y = 3. Sum = 23/6 + 3 = 41/6 = 6 5/6.",
      KZ: "Бірінші теңдеу: 6x - 10 - 4 = 9, сондықтан 6x = 23, x = 23/6. Екінші: -5y + 18 = 3y - 6, сондықтан 24 = 8y, y = 3. Қосынды: 23/6 + 3 = 41/6 = 6 5/6.",
      RU: "Первое: 6x - 10 - 4 = 9, значит 6x = 23, x = 23/6. Второе: -5y + 18 = 3y - 6, значит 24 = 8y, y = 3. Сумма: 23/6 + 3 = 41/6 = 6 5/6.",
    },
  },
];
