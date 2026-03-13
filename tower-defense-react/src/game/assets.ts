/**
 * 素材加载：萌宠咖啡馆主题
 * 塔：冰淇淋筒/奶油炮/棉花糖塔/马卡龙法师
 * 敌人：小猫咪/小松鼠/小狗狗/大熊猫
 */

import type { TowerTypeKey } from './tower';
import type { EnemyTypeKey } from './enemy';

const SPRITE_BASE = '/assets/sprites';

export interface LoadedAssets {
  towers: Map<string, HTMLImageElement>;
  enemies: Map<string, HTMLImageElement>;
  tiles: { ground: HTMLImageElement | null; path: HTMLImageElement | null };
  ready: boolean;
}

let assets: LoadedAssets = {
  towers: new Map(),
  enemies: new Map(),
  tiles: { ground: null, path: null },
  ready: false,
};

function towerKey(type: TowerTypeKey, level: 1 | 2 | 3): string {
  return `${type}_${level}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function getAssets(): LoadedAssets {
  return assets;
}

export function loadAssets(): Promise<void> {
  if (assets.ready) return Promise.resolve();

  const towerTypes: TowerTypeKey[] = ['arrow', 'cannon', 'slow', 'mage'];
  const levels: (1 | 2 | 3)[] = [1, 2, 3];
  const enemyTypes: EnemyTypeKey[] = ['goblin', 'wolf', 'tank', 'boss'];

  const towerPromises = towerTypes.flatMap((t) =>
    levels.map((l) =>
      loadImage(`${SPRITE_BASE}/tower_${t}_l${l}.png`).then((img) => [towerKey(t, l), img] as const)
    )
  );

  const enemyPromises = enemyTypes.map((t) =>
    loadImage(`${SPRITE_BASE}/enemy_${t}.png`).then((img) => [t, img] as const)
  );

  const tilePromises = [
    loadImage(`${SPRITE_BASE}/tile_ground.png`),
    loadImage(`${SPRITE_BASE}/tile_path.png`),
  ];

  return Promise.all([...towerPromises, ...enemyPromises, ...tilePromises]).then((results) => {
    const n = results.length;
    for (let i = 0; i < n - 2; i++) {
      const r = results[i] as [string, HTMLImageElement | null];
      const [key, img] = r;
      if (img) {
        if (key.includes('_')) assets.towers.set(key, img);
        else assets.enemies.set(key, img);
      }
    }
    assets.tiles.ground = (results[n - 2] as HTMLImageElement | null) ?? null;
    assets.tiles.path = (results[n - 1] as HTMLImageElement | null) ?? null;
    assets.ready = true;
  });
}

export function getTowerSprite(type: TowerTypeKey, level: number): HTMLImageElement | null {
  const l = Math.max(1, Math.min(3, level)) as 1 | 2 | 3;
  return assets.towers.get(towerKey(type, l)) ?? null;
}

export function getEnemySprite(type: EnemyTypeKey): HTMLImageElement | null {
  return assets.enemies.get(type) ?? null;
}

export function towerSpriteSrc(type: TowerTypeKey, level: number): string {
  const l = Math.max(1, Math.min(3, level)) as 1 | 2 | 3;
  return `${SPRITE_BASE}/tower_${type}_l${l}.png`;
}

export function enemySpriteSrc(type: EnemyTypeKey): string {
  return `${SPRITE_BASE}/enemy_${type}.png`;
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  options?: { rotate?: number; alpha?: number }
): void {
  if (!img) return;
  const { rotate = 0, alpha = 1 } = options ?? {};
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (rotate) ctx.rotate(rotate);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}
