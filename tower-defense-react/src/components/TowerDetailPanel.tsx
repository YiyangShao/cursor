import type { Tower } from '../game/tower';
import { TOWER_TYPES } from '../game/tower';

const TOWER_NAMES: Record<string, string> = {
  arrow: '箭塔',
  cannon: '炮塔',
  slow: '减速塔',
  mage: '法师塔',
};

interface TowerDetailPanelProps {
  tower: Tower;
  gold: number;
  onUpgrade: () => void;
  onSell: () => void;
}

export function TowerDetailPanel({ tower, gold, onUpgrade, onSell }: TowerDetailPanelProps) {
  const cfg = TOWER_TYPES[tower.type];
  const canUpgrade = tower.level < 3 && gold >= tower.upgradeCost;

  return (
    <div className="tower-detail-panel">
      <div className="tower-detail-header">
        <span className="tower-detail-icon">{cfg.icon}</span>
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
