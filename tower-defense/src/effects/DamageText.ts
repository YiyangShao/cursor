import Phaser from 'phaser';

export function showDamageText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number
): void {
  const text = scene.add
    .text(x, y - 20, `-${amount}`, { fontSize: '14px', color: '#fbbf24', fontStyle: 'bold' })
    .setOrigin(0.5);
  scene.tweens.add({
    targets: text,
    y: y - 50,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onComplete: () => text.destroy(),
  });
}
