export type VocabularyExamplePart = "verb" | "adjective" | "noun";

export type VocabularyExampleSource = {
  word_en: string;
  translation_kk: string;
  translation_ru: string;
  part_of_speech: VocabularyExamplePart;
};

type VocabularyUsageExamples = {
  en: string;
  kk: string;
  ru: string;
};

const SPECIAL_USAGE_EXAMPLES: Record<string, VocabularyUsageExamples> = {
  "verb:greet": {
    en: "I greet my teacher in the morning.",
    kk: "Мысал: мен таңертең мұғаліммен амандасамын.",
    ru: "Пример: утром я приветствую учителя.",
  },
  "verb:say": {
    en: 'I say "hello" to my friend.',
    kk: "Мысал: мен досыма «сәлем» деп айтамын.",
    ru: "Пример: я говорю другу «привет».",
  },
  "verb:ask": {
    en: "I ask my teacher a question.",
    kk: "Мысал: мен мұғалімнен сұрақ сұраймын.",
    ru: "Пример: я спрашиваю учителя о задании.",
  },
  "verb:answer": {
    en: "I answer the question clearly.",
    kk: "Мысал: мен сұраққа анық жауап беремін.",
    ru: "Пример: я чётко отвечаю на вопрос.",
  },
  "verb:thank": {
    en: "I thank my friend for help.",
    kk: "Мысал: мен досыма көмегі үшін алғыс айтамын.",
    ru: "Пример: я благодарю друга за помощь.",
  },
  "verb:welcome": {
    en: "We welcome new students to class.",
    kk: "Мысал: біз жаңа оқушыларды сыныпта қарсы аламыз.",
    ru: "Пример: мы приветствуем новых учеников в классе.",
  },
  "verb:meet": {
    en: "I meet my classmate after school.",
    kk: "Мысал: мен сабақтан кейін сыныптасыммен кездесемін.",
    ru: "Пример: после школы я встречаю одноклассника.",
  },
  "verb:smile": {
    en: "I smile when I get the right answer.",
    kk: "Мысал: дұрыс жауап тапқанда мен күлімдеймін.",
    ru: "Пример: я улыбаюсь, когда нахожу правильный ответ.",
  },
  "verb:listen": {
    en: "I listen to the teacher carefully.",
    kk: "Мысал: мен мұғалімді мұқият тыңдаймын.",
    ru: "Пример: я внимательно слушаю учителя.",
  },
  "verb:speak": {
    en: "I speak English with my partner.",
    kk: "Мысал: мен жұбыммен ағылшынша сөйлеймін.",
    ru: "Пример: я говорю по-английски с напарником.",
  },
  "verb:repeat": {
    en: "I repeat the new word three times.",
    kk: "Мысал: мен жаңа сөзді үш рет қайталаймын.",
    ru: "Пример: я повторяю новое слово три раза.",
  },
  "verb:excuse": {
    en: "I excuse myself when I make a mistake.",
    kk: "Мысал: қате жіберсем, мен кешірім сұраймын.",
    ru: "Пример: если я ошибаюсь, я извиняюсь.",
  },
  "verb:introduce": {
    en: "I introduce myself to the group.",
    kk: "Мысал: мен топқа өзімді таныстырамын.",
    ru: "Пример: я представляюсь группе.",
  },
  "verb:wish": {
    en: "I wish my friend good luck.",
    kk: "Мысал: мен досыма сәттілік тілеймін.",
    ru: "Пример: я желаю другу удачи.",
  },
  "verb:leave": {
    en: "I leave the classroom after the lesson.",
    kk: "Мысал: сабақтан кейін мен сыныптан шығамын.",
    ru: "Пример: после урока я ухожу из класса.",
  },
};

const verbTemplates = [
  (word: VocabularyExampleSource) => ({
    en: `I use "${word.word_en}" when I talk in class.`,
    kk: `Мысал: сабақта сөйлегенде «${word.translation_kk}» сөзін қолданамын.`,
    ru: `Пример: на уроке я использую слово «${word.translation_ru}».`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `The teacher asks us to ${word.word_en}.`,
    kk: `Мысал: мұғалім бізден «${word.translation_kk}» әрекетін сұрайды.`,
    ru: `Пример: учитель просит нас выполнить действие «${word.translation_ru}».`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `Today I practice how to ${word.word_en}.`,
    kk: `Мысал: бүгін мен «${word.translation_kk}» әрекетін жаттығамын.`,
    ru: `Пример: сегодня я тренирую действие «${word.translation_ru}».`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `We learn to ${word.word_en} in English.`,
    kk: `Мысал: біз ағылшын тілінде «${word.translation_kk}» жасауды үйренеміз.`,
    ru: `Пример: мы учимся по-английски действию «${word.translation_ru}».`,
  }),
];

const adjectiveTemplates = [
  (word: VocabularyExampleSource) => ({
    en: `My friend is ${word.word_en}.`,
    kk: `Мысал: менің досым ${word.translation_kk}.`,
    ru: `Пример: мой друг ${word.translation_ru}.`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `This task is ${word.word_en}.`,
    kk: `Мысал: бұл тапсырма ${word.translation_kk}.`,
    ru: `Пример: это задание ${word.translation_ru}.`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `I see a ${word.word_en} picture.`,
    kk: `Мысал: мен ${word.translation_kk} суретті көріп тұрмын.`,
    ru: `Пример: я вижу ${word.translation_ru} картинку.`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `The answer looks ${word.word_en}.`,
    kk: `Мысал: жауап ${word.translation_kk} болып көрінеді.`,
    ru: `Пример: ответ выглядит ${word.translation_ru}.`,
  }),
];

const nounTemplates = [
  (word: VocabularyExampleSource) => ({
    en: `This is my ${word.word_en}.`,
    kk: `Мысал: бұл менің ${word.translation_kk}.`,
    ru: `Пример: это мой ${word.translation_ru}.`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `I write the word "${word.word_en}" in my notebook.`,
    kk: `Мысал: мен дәптеріме «${word.translation_kk}» сөзін жазамын.`,
    ru: `Пример: я пишу слово «${word.translation_ru}» в тетради.`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `There is a ${word.word_en} in the sentence.`,
    kk: `Мысал: сөйлемде «${word.translation_kk}» сөзі бар.`,
    ru: `Пример: в предложении есть слово «${word.translation_ru}».`,
  }),
  (word: VocabularyExampleSource) => ({
    en: `I can point to the ${word.word_en}.`,
    kk: `Мысал: мен «${word.translation_kk}» дегенді көрсете аламын.`,
    ru: `Пример: я могу показать «${word.translation_ru}».`,
  }),
];

export function buildVocabularyUsageExamples(word: VocabularyExampleSource): VocabularyUsageExamples {
  const key = `${word.part_of_speech}:${word.word_en.trim().toLowerCase()}`;
  const special = SPECIAL_USAGE_EXAMPLES[key];
  if (special) return special;

  const templates =
    word.part_of_speech === "verb" ? verbTemplates : word.part_of_speech === "adjective" ? adjectiveTemplates : nounTemplates;
  return templates[getStableTemplateIndex(key, templates.length)](word);
}

export function normalizeVocabularyExample(value: string | undefined, fallback: string) {
  const text = value?.trim();
  if (!text) return fallback;

  const lower = text.toLowerCase();
  const isOldTemplate =
    lower.includes("learn how to use the action word") ||
    lower.includes("helps me describe something") ||
    lower.includes("learn the word") ||
    (lower.startsWith("i can ") && lower.endsWith(" in class today.")) ||
    lower.startsWith("my friend is ") ||
    lower.startsWith("this is my ") ||
    lower.includes("бұл сөздің мағынасы") ||
    lower.includes("значение этого слова") ||
    lower.includes("әрекетін жасаймын") ||
    lower.includes("выполняю действие");

  return isOldTemplate ? fallback : text;
}

function getStableTemplateIndex(key: string, length: number) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}
