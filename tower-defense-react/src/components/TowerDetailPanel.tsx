import type { Tower } from '../game/tower';
import { getTowerIconAtLevel } from '../game/tower';
import { towerSpriteSrc } from '../game/assets';

const TOWER_NAMES: Record<string, string> = {
  arrow: '冰淇淋筒',
  cannon: '奶油炮',
  slow: '棉花糖塔',
  mage: '马卡龙法师',
};

interface TowerDetailPanelProps {
  tower: Tower;
  gold: number;
  onUpgrade: () => void;
  onSell: () => void;
}

export function TowerDetailPanel({ tower, gold, onUpgrade, onSell }: TowerDetailPanelProps) {
  const canUpgrade = tower.level < 3 && gold >= tower.upgradeCost;

  return (
    <div className="tower-detail-panel">
      <div className="tower-detail-header">
        <span className="tower-detail-icon">
          <img
            src={towerSpriteSrc(tower.type, tower.level)}
            alt=""
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              const fb = el.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = 'inline';
            }}
          />
          <span className="tower-icon-fallback" style={{ display: 'none' }}>{getTowerIconAtLevel(tower.type, tower.level)}</span>
        </span>
        <span className="tower-detail-name">{TOWER_NAMES[tower.type]} Lv{tower.level}</span>
      </div>
      <div className="tower-detail-stats">
        <span>伤害: {tower.damage}</span>
        <span>射程: {tower.range}</span>
        <span>攻速: {(1000 / tower.cooldownMs).toFixed(1)}/s</span>
        {tower.effect && <span>特效: {tower.effect}</span>}
      </div>
      <div className="tower-detail-actions">
        <button
          className="btn btn-sm"
          onClick={onUpgrade}
          disabled={!canUpgrade}
          title={tower.level >= 3 ? '已满级' : `升级需 ${tower.upgradeCost}💰`}
        >
          ⬆ 升级 {tower.level < 3 ? tower.upgradeCost + '💰' : '满级'}
        </button>
        <button className="btn btn-sm btn-danger" onClick={onSell}>
          出售 +{tower.sellValue}💰
        </button>
      </div>
    </div>
  );
}
