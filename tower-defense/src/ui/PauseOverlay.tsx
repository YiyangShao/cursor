interface PauseOverlayProps {
  onResume: () => void;
  onBack?: () => void;
}

export default function PauseOverlay({ onResume, onBack }: PauseOverlayProps) {
  return (
    <div className="overlay overlay-dark">
      <div className="overlay-content">
        <h2>游戏暂停</h2>
        <div className="overlay-buttons">
          <button type="button" className="btn-overlay" onClick={onResume}>
            继续游戏
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
