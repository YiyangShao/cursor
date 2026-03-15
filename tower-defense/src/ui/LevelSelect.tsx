import { loadProgress } from '../game/storage';

interface LevelSelectProps {
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
}

const LEVELS = [{ id: 'level1', name: '草莓草坪' }];

export default function LevelSelect({ onSelectLevel, onBack }: LevelSelectProps) {
  const progress = loadProgress();

  return (
    <div className="level-select">
      <h1>选择关卡</h1>
      <div className="level-list">
        {LEVELS.map((level) => {
          const unlocked = progress.unlockedLevels.includes(level.id);
          const stars = progress.levelStars[level.id] ?? 0;
          return (
            <button
              key={level.id}
              type="button"
              className="level-item"
              disabled={!unlocked}
              onClick={() => unlocked && onSelectLevel(level.id)}
            >
              <span>{level.name}</span>
              {!unlocked && <span className="level-lock">锁定</span>}
              {unlocked && stars > 0 && (
                <span className="level-stars">{'★'.repeat(stars)}</span>
              )}
            </button>
          );
        })}
      </div>
      <button type="button" className="btn-overlay btn-secondary" onClick={onBack}>
        返回
      </button>
    </div>
  );
}
