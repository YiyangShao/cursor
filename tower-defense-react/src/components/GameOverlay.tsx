interface GameOverlayProps {
  visible: boolean;
  title: string;
  message: string;
  stats?: {
    kills: number;
    waves: number;
    finalGold: number;
    waveBonuses: number;
    timeSeconds: number;
  };
  newAchievements?: string[];
  buttonText: string;
  variant?: 'start' | 'victory' | 'defeat';
  onButtonClick: () => void;
}

export function GameOverlay({
  visible,
  title,
  message,
  stats,
  newAchievements = [],
  buttonText,
  variant = 'start',
  onButtonClick,
}: GameOverlayProps) {
  if (!visible) return null;

  return (
    <div className={`overlay ${variant}`}>
      <div className="overlay-content">
        <h2>{title}</h2>
        <p>{message}</p>
        {stats && (
          <div className="overlay-stats">
            <span>击杀: {stats.kills}</span>
            <span>波次: {stats.waves}</span>
            <span>时间: {Math.floor(stats.timeSeconds / 60)}分{stats.timeSeconds % 60}秒</span>
            <span>最终金币: {stats.finalGold} (波次奖励+{stats.waveBonuses})</span>
          </div>
        )}
        {newAchievements.length > 0 && (
          <div className="overlay-achievements">
            <span>新成就:</span>
            {newAchievements.map((a) => (
              <span key={a} className="achievement-badge">{a}</span>
            ))}
          </div>
        )}
        <button className="btn" onClick={onButtonClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
