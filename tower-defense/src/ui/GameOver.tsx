interface GameOverProps {
  onRestart: () => void;
  onBack?: () => void;
}

export default function GameOver({ onRestart, onBack }: GameOverProps) {
  return (
    <div className="overlay overlay-dark">
      <div className="overlay-content">
        <h2>游戏失败</h2>
        <p>蛋糕被小动物吃掉了…</p>
        <div className="overlay-buttons">
          <button type="button" className="btn-overlay" onClick={onRestart}>
            重玩
          </button>
          {onBack && (
            <button type="button" className="btn-overlay btn-secondary" onClick={onBack}>
              返回主菜单
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
