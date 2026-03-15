import Phaser from 'phaser';

export function showAttackLine(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  durationMs = 120
): void {
  const line = scene.add.graphics();
  line.lineStyle(3, 0xfbbf24, 0.9);
  line.lineBetween(fromX, fromY, toX, toY);
  scene.time.delayedCall(durationMs, () => line.destroy());
}

export function showSplashEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  durationMs = 150
): void {
  const g = scene.add.graphics();
  g.lineStyle(2, 0xf59e0b, 0.8);
  g.strokeCircle(x, y, radius);
  g.fillStyle(0xf59e0b, 0.2);
  g.fillCircle(x, y, radius);
  scene.time.delayedCall(durationMs, () => g.destroy());
}
