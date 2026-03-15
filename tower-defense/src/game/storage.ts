const STORAGE_KEY = 'td_progress';
const DEFAULT_LEVEL = 'level1';

export interface GameProgress {
  unlockedLevels: string[];
  levelStars: Record<string, number>;
  levelHighScores: Record<string, number>;
}

const defaultProgress: GameProgress = {
  unlockedLevels: [DEFAULT_LEVEL],
  levelStars: {},
  levelHighScores: {},
};

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    return {
      unlockedLevels: parsed.unlockedLevels ?? defaultProgress.unlockedLevels,
      levelStars: { ...defaultProgress.levelStars, ...parsed.levelStars },
      levelHighScores: { ...defaultProgress.levelHighScores, ...parsed.levelHighScores },
    };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(data: Partial<GameProgress>): void {
  const current = loadProgress();
  const next: GameProgress = {
    unlockedLevels: data.unlockedLevels ?? current.unlockedLevels,
    levelStars: { ...current.levelStars, ...data.levelStars },
    levelHighScores: { ...current.levelHighScores, ...data.levelHighScores },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function unlockLevel(id: string): void {
  const current = loadProgress();
  if (current.unlockedLevels.includes(id)) return;
  saveProgress({
    unlockedLevels: [...current.unlockedLevels, id],
  });
}

export function updateLevelScore(
  levelId: string,
  stars: number,
  score: number
): void {
  const current = loadProgress();
  const prevStars = current.levelStars[levelId] ?? 0;
  const prevScore = current.levelHighScores[levelId] ?? 0;
  saveProgress({
    levelStars: { ...current.levelStars, [levelId]: Math.max(stars, prevStars) },
    levelHighScores: {
      ...current.levelHighScores,
      [levelId]: Math.max(score, prevScore),
    },
  });
}
