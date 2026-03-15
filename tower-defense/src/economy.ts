import type Phaser from 'phaser';

const GOLD_KEY = 'gold';
const LIVES_KEY = 'lives';

const INITIAL_GOLD = 200;
const INITIAL_LIVES = 20;

export function createEconomy(scene: Phaser.Scene, reset = false): void {
  if (reset) {
    scene.registry.remove(GOLD_KEY);
    scene.registry.remove(LIVES_KEY);
  }
  const gold = scene.registry.get(GOLD_KEY) ?? INITIAL_GOLD;
  const lives = scene.registry.get(LIVES_KEY) ?? INITIAL_LIVES;
  scene.registry.set(GOLD_KEY, gold);
  scene.registry.set(LIVES_KEY, lives);
}

export function getGold(scene: Phaser.Scene): number {
  return scene.registry.get(GOLD_KEY) ?? INITIAL_GOLD;
}

export function addGold(scene: Phaser.Scene, amount: number): void {
  const current = getGold(scene);
  scene.registry.set(GOLD_KEY, current + amount);
}

export function spendGold(scene: Phaser.Scene, amount: number): boolean {
  const current = getGold(scene);
  if (current < amount) return false;
  scene.registry.set(GOLD_KEY, current - amount);
  return true;
}

export function getLives(scene: Phaser.Scene): number {
  return scene.registry.get(LIVES_KEY) ?? INITIAL_LIVES;
}

export function loseLife(scene: Phaser.Scene): void {
  const current = getLives(scene);
  if (current <= 0) {
    throw new Error('Lives already 0');
  }
  scene.registry.set(LIVES_KEY, current - 1);
}
