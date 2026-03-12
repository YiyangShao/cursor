interface GameOverlayProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  variant?: 'start' | 'victory' | 'defeat';
  onButtonClick: () => void;
}

export function GameOverlay({
  visible,
  title,
  message,
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
        <button className="btn" onClick={onButtonClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
