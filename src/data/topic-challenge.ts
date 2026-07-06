import type { Lang } from "./exam-simulator";

export type ChallengeTopic = {
  id: string;
  title: Record<Lang, string>;
  icon: string;
};

export type ChallengeLevel = {
  level: number;
  title: Record<Lang, string>;
  targetPercent: number;
  questions: Array<{
    id: string;
    prompt: Record<Lang, string>;
    answer: string;
  }>;
};

export const challengeTopics: ChallengeTopic[] = [
  { id: "percentages", icon: "percent", title: { EN: "Percentages", KZ: "Пайыз", RU: "Проценты" } },
  { id: "equations", icon: "functions", title: { EN: "Equations", KZ: "Теңдеулер", RU: "Уравнения" } },
  { id: "logic", icon: "extension", title: { EN: "Logic", KZ: "Логика", RU: "Логика" } },
  { id: "word-problems", icon: "edit_note", title: { EN: "Word problems", KZ: "Мәтінді есептер", RU: "Текстовые задачи" } },
  { id: "geometry", icon: "architecture", title: { EN: "Geometry", KZ: "Геометрия", RU: "Геометрия" } },
  { id: "reading", icon: "menu_book", title: { EN: "Reading comprehension", KZ: "Оқу сауаттылығы", RU: "Читательская грамотность" } },
];

export const challengeLevels: ChallengeLevel[] = [
  {
    level: 1,
    title: { EN: "Very easy", KZ: "Өте жеңіл", RU: "Очень лёгкий" },
    targetPercent: 70,
    questions: [
      {
        id: "l1-q1",
        prompt: { EN: "Find 10% of 50.", KZ: "50 санының 10%-ын тап.", RU: "Найдите 10% от 50." },
        answer: "5",
      },
      {
        id: "l1-q2",
        prompt: { EN: "Find 50% of 18.", KZ: "18 санының 50%-ын тап.", RU: "Найдите 50% от 18." },
        answer: "9",
      },
    ],
  },
  {
    level: 2,
    title: { EN: "Basic", KZ: "Базалық", RU: "Базовый" },
    targetPercent: 70,
    questions: [
      {
        id: "l2-q1",
        prompt: { EN: "Find 25% of 120.", KZ: "120 санының 25%-ын тап.", RU: "Найдите 25% от 120." },
        answer: "30",
      },
      {
        id: "l2-q2",
        prompt: { EN: "Find 20% of 45.", KZ: "45 санының 20%-ын тап.", RU: "Найдите 20% от 45." },
        answer: "9",
      },
    ],
  },
  {
    level: 3,
    title: { EN: "Medium", KZ: "Орташа", RU: "Средний" },
    targetPercent: 70,
    questions: [
      {
        id: "l3-q1",
        prompt: { EN: "A book costs 2000. It is discounted by 15%. What is the discount?", KZ: "Кітап 2000 тұрады. 15% жеңілдік жасалды. Жеңілдік қанша?", RU: "Книга стоит 2000. Скидка 15%. Сколько составляет скидка?" },
        answer: "300",
      },
      {
        id: "l3-q2",
        prompt: { EN: "Increase 80 by 25%.", KZ: "80 санын 25%-ға арттыр.", RU: "Увеличьте 80 на 25%." },
        answer: "100",
      },
    ],
  },
  {
    level: 4,
    title: { EN: "Exam format", KZ: "Емтихан форматы", RU: "Экзаменационный формат" },
    targetPercent: 70,
    questions: [
      {
        id: "l4-q1",
        prompt: { EN: "30% of a number is 18. Find the number.", KZ: "Санның 30%-ы 18-ге тең. Санды тап.", RU: "30% числа равны 18. Найдите число." },
        answer: "60",
      },
      {
        id: "l4-q2",
        prompt: { EN: "A class has 24 pupils. 75% passed. How many passed?", KZ: "Сыныпта 24 оқушы бар. 75%-ы өтті. Нешеуі өтті?", RU: "В классе 24 ученика. 75% сдали. Сколько сдали?" },
        answer: "18",
      },
    ],
  },
  {
    level: 5,
    title: { EN: "Speed Challenge", KZ: "Жылдамдық челленджі", RU: "Speed Challenge" },
    targetPercent: 70,
    questions: [
      {
        id: "l5-q1",
        prompt: { EN: "Find 5% of 260.", KZ: "260 санының 5%-ын тап.", RU: "Найдите 5% от 260." },
        answer: "13",
      },
      {
        id: "l5-q2",
        prompt: { EN: "Find 12.5% of 80.", KZ: "80 санының 12,5%-ын тап.", RU: "Найдите 12,5% от 80." },
        answer: "10",
      },
    ],
  },
];
