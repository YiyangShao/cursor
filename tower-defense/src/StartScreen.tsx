import type { CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
  wrapper: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    marginBottom: '1rem',
    textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
  },
  desc: {
    fontSize: '1rem',
    color: '#94a3b8',
    maxWidth: 360,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: '2.5rem',
  },
  button: {
    padding: '0.75rem 2rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
};

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>塔防游戏</h1>
      <p style={styles.desc}>
        选择塔类型，在地图上放置防御塔，消灭沿路径进攻的敌人。守住 10 波即可胜利。
      </p>
      <button
        style={styles.button}
        onClick={onStart}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
        }}
      >
        开始游戏
      </button>
    </div>
  );
}
