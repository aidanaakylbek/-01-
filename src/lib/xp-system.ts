export const XP_LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 800 },
  { level: 6, xp: 1200 },
  { level: 7, xp: 1700 },
  { level: 8, xp: 2300 },
  { level: 9, xp: 3000 },
  { level: 10, xp: 4000 },
] as const;

export const MAX_LEVEL = XP_LEVELS[XP_LEVELS.length - 1].level;

export const XP_REWARDS = {
  lesson: 20,
  task: 5,
  topicTest: 30,
  weeklyTest: 50,
  monthlyTest: 100,
  vocabularyWordKnown: 2,
} as const;

export const DAILY_XP_GOAL = 20;

export function getLevelForXp(xp: number): number {
  let level: number = XP_LEVELS[0].level;

  for (const threshold of XP_LEVELS) {
    if (xp >= threshold.xp) {
      level = threshold.level;
    }
  }

  return level;
}

export type LevelProgress = {
  level: number;
  xp: number;
  xpIntoLevel: number;
  levelStartXp: number;
  nextLevelXp: number | null;
  xpForNextLevel: number | null;
  isMaxLevel: boolean;
};

export function getLevelProgress(xp: number): LevelProgress {
  const level = getLevelForXp(xp);
  const currentThreshold = XP_LEVELS.find((item) => item.level === level) ?? XP_LEVELS[0];
  const nextThreshold = XP_LEVELS.find((item) => item.level === level + 1);

  return {
    level,
    xp,
    xpIntoLevel: xp - currentThreshold.xp,
    levelStartXp: currentThreshold.xp,
    nextLevelXp: nextThreshold?.xp ?? null,
    xpForNextLevel: nextThreshold ? nextThreshold.xp - currentThreshold.xp : null,
    isMaxLevel: !nextThreshold,
  };
}
