import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private startWaveText!: Phaser.GameObjects.Text;
  private startWaveBtn!: Phaser.GameObjects.Zone;

  constructor() {
    super({ key: 'UI' });
  }

  create() {
    const { width } = this.scale;
    this.goldText = this.add.text(16, 16, '金币: 0', {
      fontSize: '20px',
      color: '#f4c88a',
    });
    this.livesText = this.add.text(16, 44, '生命: 0', {
      fontSize: '20px',
      color: '#ff6b6b',
    });
    this.waveText = this.add.text(width - 16, 16, '波次: 0/0', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    this.startWaveText = this.add.text(width / 2, 50, '开始下一波', {
      fontSize: '24px',
      color: '#88cc44',
    }).setOrigin(0.5);
    this.startWaveBtn = this.add
      .zone(width / 2, 50, 200, 40)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.events.emit('start-wave');
      });

    this.refreshFromRegistry();
    this.events.on('refresh', () => this.refreshFromRegistry());
  }

  refreshFromRegistry(): void {
    const gold = this.registry.get('gold') ?? 0;
    const lives = this.registry.get('lives') ?? 0;
    const wave = this.registry.get('wave') ?? 0;
    const totalWaves = this.registry.get('totalWaves') ?? 0;
    const canStartWave = this.registry.get('canStartWave') ?? false;

    this.goldText.setText(`金币: ${gold}`);
    this.livesText.setText(`生命: ${lives}`);
    this.waveText.setText(`波次: ${wave}/${totalWaves}`);
    this.startWaveText.setVisible(canStartWave);
    this.startWaveBtn.setInteractive(canStartWave);
  }
}
