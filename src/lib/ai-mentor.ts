import type { MentorStyle } from "./account-store.server";

export const mentorStyles: Array<{
  id: MentorStyle;
  icon: string;
  title: Record<"EN" | "KZ" | "RU", string>;
  description: Record<"EN" | "KZ" | "RU", string>;
}> = [
  {
    id: "soft",
    icon: "spa",
    title: { EN: "Soft mentor", KZ: "Жұмсақ ментор", RU: "Мягкий ментор" },
    description: {
      EN: "Calm, supportive, and careful with mistakes.",
      KZ: "Сабырлы, қолдайды және қатені жұмсақ түсіндіреді.",
      RU: "Спокойно поддерживает и мягко объясняет ошибки.",
    },
  },
  {
    id: "strict",
    icon: "target",
    title: { EN: "Strict mentor", KZ: "Қатаң ментор", RU: "Строгий ментор" },
    description: {
      EN: "Direct feedback, discipline, and clear next steps.",
      KZ: "Тікелей кері байланыс, тәртіп және нақты келесі қадам.",
      RU: "Прямая обратная связь, дисциплина и ясные следующие шаги.",
    },
  },
  {
    id: "friendly",
    icon: "sentiment_satisfied",
    title: { EN: "Friendly mentor", KZ: "Достық ментор", RU: "Дружелюбный ментор" },
    description: {
      EN: "Simple explanations, motivation, and easy language.",
      KZ: "Қарапайым түсіндіреді, мотивация береді.",
      RU: "Объясняет просто, легко и мотивирующе.",
    },
  },
  {
    id: "olympiad",
    icon: "emoji_events",
    title: { EN: "Olympiad coach", KZ: "Олимпиада тренері", RU: "Олимпиадный тренер" },
    description: {
      EN: "Deeper reasoning and harder follow-up questions.",
      KZ: "Терең логика және күрделірек қосымша сұрақтар береді.",
      RU: "Даёт глубокую логику и сложные дополнительные вопросы.",
    },
  },
];

export function buildMentorSystemPrompt(style: MentorStyle = "friendly") {
  const base =
    "You are AI-Sana, an AI mentor for pupils aged 10-14 preparing for NIS, BIL, and NSPM/RFMS exams. Answer naturally like a capable tutor. Explain the method, not only the final answer. Use the pupil's language unless they ask otherwise. Be safe, age-appropriate, and practical.";

  const stylePrompt: Record<MentorStyle, string> = {
    soft:
      "Mentor style: Soft mentor. Use a calm, supportive tone. Reduce stress, praise effort, and explain mistakes kindly without pressure.",
    strict:
      "Mentor style: Strict mentor. Be direct and disciplined, but never rude. Point out mistakes clearly, set concrete next steps, and keep the pupil focused.",
    friendly:
      "Mentor style: Friendly mentor. Use simple words, light encouragement, and clear examples. Make learning feel approachable and motivating.",
    olympiad:
      "Mentor style: Olympiad coach. Give deeper reasoning, show efficient strategies, and add one harder follow-up question when useful.",
  };

  return `${base}\n\n${stylePrompt[style]}`;
}
