interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const STEPS = [
  { text: '点击地图上的可建造区域（非蓝色路径）放置塔', highlight: 'map' },
  { text: '放置好后，点击「开始波次」按钮刷新敌人', highlight: 'wave' },
  { text: '点击已放置的塔，可升级或出售', highlight: 'tower' },
  { text: '准备好就绪！祝你游戏愉快', highlight: null },
];

export function TutorialOverlay({ step, onNext, onSkip }: TutorialOverlayProps) {
  if (step >= STEPS.length) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-progress">
          {STEPS.map((_, i) => (
            <span key={i} className={`dot ${i <= step ? 'done' : ''}`} />
          ))}
        </div>
        <p className="tutorial-text">{current.text}</p>
        <div className="tutorial-actions">
          <button className="btn btn-sm" onClick={onNext}>
            {isLast ? '开始' : '下一步'}
          </button>
          {!isLast && (
            <button className="btn btn-sm btn-secondary" onClick={onSkip}>
              跳过
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
