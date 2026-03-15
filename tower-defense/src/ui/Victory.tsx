import { unlockLevel, updateLevelScore } from '../game/storage';

interface VictoryProps {
  levelId: string;
  lives: number;
  gold: number;
  onNextLevel: () => void;
  onBack?: () => void;
}

const LEVEL_ORDER = ['level1', 'level2', 'level3'];

export default function Victory({
  levelId,
  lives,
  gold,
  onNextLevel,
  onBack,
}: VictoryProps) {
  const score = lives * 10 + gold;
  const stars = Math.min(3, Math.max(1, Math.floor(lives / 5) + 1));
  unlockLevel(levelId);
  updateLevelScore(levelId, stars, score);

  const nextIndex = LEVEL_ORDER.indexOf(levelId) + 1;
  const hasNextLevel = nextIndex < LEVEL_ORDER.length;

  return (
    <div className="overlay overlay-dark">
      <div className="overlay-content">
        <h2>胜利！</h2>
        <p>蛋糕保卫成功 · {stars} 星</p>
        <div className="overlay-buttons">
          {hasNextLevel ? (
            <button type="button" className="btn-overlay" onClick={onNextLevel}>
              下一关
            </button>
          ) : (
            <button type="button" className="btn-overlay" onClick={onNextLevel}>
              再玩一次
            </button>
          )}
          {onBack && (
            <button
              type="button"
              className="btn-overlay btn-secondary"
              onClick={onBack}
            >
              返回主菜单
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
