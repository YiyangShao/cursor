interface MainMenuProps {
  onStart: () => void;
  onSettings?: () => void;
}

export default function MainMenu({ onStart, onSettings }: MainMenuProps) {
  return (
    <div className="main-menu">
      <h1>保卫蛋糕</h1>
      <p>甜品炮塔 vs 小动物怪物</p>
      <button type="button" className="btn-start" onClick={onStart}>
        开始游戏
      </button>
      {onSettings && (
        <button
          type="button"
          className="btn-overlay btn-secondary"
          onClick={onSettings}
        >
          设置
        </button>
      )}
    </div>
  );
}
