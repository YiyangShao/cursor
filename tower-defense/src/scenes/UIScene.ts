import Phaser from 'phaser';
import { getGold, getLives } from '../economy';

export class UIScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private insufficientGoldText: Phaser.GameObjects.Text | null = null;
  private prepareRemainingMs: number | null = null;
  private currentWave = 0;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'UI' });
  }

  create(): void {
    this.goldText = this.add
      .text(16, 16, '金币: 0', { fontSize: '18px', color: '#fbbf24' })
      .setScrollFactor(0);
    this.livesText = this.add
      .text(16, 40, '生命: 0', { fontSize: '18px', color: '#ef4444' })
      .setScrollFactor(0);
    this.waveText = this.add
      .text(16, 64, '波次: 0', { fontSize: '18px', color: '#94a3b8' })
      .setScrollFactor(0);

    const pauseBtn = this.add
      .text(this.scale.width - 70, 20, '暂停', { fontSize: '16px', color: '#94a3b8' })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      const gs = this.scene.get('Game');
      if (gs && gs.scene.isActive()) {
        gs.events.emit('toggle-pause');
      }
    });

    const gameScene = this.scene.get('Game');
    if (gameScene && gameScene.scene.isActive()) {
      this.goldText.setText(`金币: ${getGold(gameScene)}`);
      this.livesText.setText(`生命: ${getLives(gameScene)}`);

      gameScene.events.on('gold-changed', (gold: number) => {
        this.goldText.setText(`金币: ${gold}`);
      });
      gameScene.events.on('lives-changed', (lives: number) => {
        this.livesText.setText(`生命: ${lives}`);
      });
      gameScene.events.on('wave-changed', (wave: number) => {
        this.currentWave = wave;
        this.refreshWaveText();
      });
      gameScene.events.on('prepare-remaining', (ms: number | null) => {
        this.prepareRemainingMs = ms;
        this.refreshWaveText();
      });
      gameScene.events.on('game-over', (victory: boolean) => {
        this.showGameOver(victory);
      });
      gameScene.events.on('insufficient-gold', () => {
        this.showInsufficientGold();
      });
      gameScene.events.on('paused-changed', (paused: boolean) => {
        this.showPauseOverlay(paused);
      });
    }
  }

  private showPauseOverlay(paused: boolean): void {
    this.pauseOverlay?.destroy();
    this.pauseOverlay = null;
    if (!paused) return;

    const w = this.scale.width;
    const h = this.scale.height;
    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6);
    const msg = this.add.text(w / 2, h / 2 - 20, '已暂停', { fontSize: '28px', color: '#94a3b8' }).setOrigin(0.5);
    const resumeBtn = this.add
      .text(w / 2, h / 2 + 20, '继续', { fontSize: '18px', color: '#fff' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    resumeBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
      const gs = this.scene.get('Game');
      if (gs && gs.scene.isActive()) {
        gs.events.emit('toggle-pause');
      }
    });
    this.pauseOverlay = this.add.container(0, 0, [bg, msg, resumeBtn]);
  }

  private refreshWaveText(): void {
    if (this.prepareRemainingMs != null && this.prepareRemainingMs >= 0) {
      this.waveText.setText(`下波 ${Math.ceil(this.prepareRemainingMs / 1000)}s`);
    } else {
      this.waveText.setText(`波次: ${this.currentWave}/10`);
    }
  }

  private showInsufficientGold(): void {
    if (this.insufficientGoldText) {
      this.insufficientGoldText.destroy();
    }
    const w = this.scale.width;
    this.insufficientGoldText = this.add
      .text(w / 2, 100, '金币不足', { fontSize: '20px', color: '#ef4444' })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.time.delayedCall(1500, () => {
      this.insufficientGoldText?.destroy();
      this.insufficientGoldText = null;
    });
  }

  private showGameOver(victory: boolean): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);
    const msg = this.add
      .text(w / 2, h / 2 - 30, victory ? '胜利！' : '游戏结束', {
        fontSize: '32px',
        color: victory ? '#4ade80' : '#ef4444',
      })
      .setOrigin(0.5);
    const restart = this.add
      .text(w / 2, h / 2 + 20, '点击重新开始', { fontSize: '18px', color: '#94a3b8' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    restart.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.stop('UI');
      this.scene.stop('Game');
      this.scene.start('Game');
      this.scene.launch('UI');
    });

    this.add.container(0, 0, [bg, msg, restart]);
  }
}
