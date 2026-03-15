import Phaser from 'phaser';
import {
  TILE_SIZE,
  OFFSET_X,
  OFFSET_Y,
  GRID_COLS,
  GRID_ROWS,
} from '../config';
import { getPathWorldPoints, worldToGrid, gridToWorld, canPlaceTower } from '../map/map';
import { EnemyManager } from '../enemy/enemyManager';
import { TowerManager } from '../tower/towerManager';
import { TOWER_CONFIGS } from '../tower/towers';
import { WaveManager } from '../wave/waveManager';
import { createEconomy, getGold, addGold, loseLife, getLives, spendGold } from '../economy';
import { Tower } from '../tower/Tower';
import type { EnemyType, TowerType } from '../types';

export class GameScene extends Phaser.Scene {
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private enemyManager!: EnemyManager;
  private towerManager!: TowerManager;
  private waveManager!: WaveManager;
  private selectedTowerType: TowerType | null = null;
  private gameEnded = false;
  private paused = false;
  private towerButtons: Phaser.GameObjects.Rectangle[] = [];
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private towerActionPanel: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    createEconomy(this, true);
    this.events.on('toggle-pause', () => {
      this.paused = !this.paused;
      this.events.emit('paused-changed', this.paused);
    });
    this.drawMap();
    this.previewGraphics = this.add.graphics();
    this.setupEnemyManager();
    this.setupTowerManager();
    this.setupWaveManager();
    this.setupTowerPanel();
    this.setupMapInput();
  }

  private updateTowerButtonStyles(): void {
    const types: TowerType[] = ['cannon', 'slow', 'splash'];
    this.towerButtons.forEach((rect, i) => {
      rect.setFillStyle(types[i] === this.selectedTowerType ? 0x475569 : 0x334155);
    });
  }

  private drawMap(): void {
    this.mapGraphics = this.add.graphics();

    // 网格
    this.mapGraphics.lineStyle(1, 0x334155, 0.5);
    for (let c = 0; c <= GRID_COLS; c++) {
      const x = OFFSET_X + c * TILE_SIZE;
      this.mapGraphics.lineBetween(x, OFFSET_Y, x, OFFSET_Y + GRID_ROWS * TILE_SIZE);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = OFFSET_Y + r * TILE_SIZE;
      this.mapGraphics.lineBetween(OFFSET_X, y, OFFSET_X + GRID_COLS * TILE_SIZE, y);
    }

    // 路径
    const pathPoints = getPathWorldPoints();
    this.mapGraphics.lineStyle(4, 0x64748b, 0.8);
    if (pathPoints.length >= 2) {
      this.mapGraphics.beginPath();
      this.mapGraphics.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let i = 1; i < pathPoints.length; i++) {
        this.mapGraphics.lineTo(pathPoints[i].x, pathPoints[i].y);
      }
      this.mapGraphics.strokePath();
    }
  }

  private setupTowerManager(): void {
    this.towerManager = new TowerManager(this);
  }

  private setupTowerPanel(): void {
    const y = OFFSET_Y + GRID_ROWS * TILE_SIZE + 20;
    const types: { type: TowerType; label: string }[] = [
      { type: 'cannon', label: '炮塔 100' },
      { type: 'slow', label: '减速 120' },
      { type: 'splash', label: '溅射 150' },
    ];
    types.forEach(({ type, label }, i) => {
      const rect = this.add
        .rectangle(100 + i * 100, y, 80, 36, 0x334155)
        .setInteractive({ useHandCursor: true })
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
          this.selectedTowerType = type;
          this.updateTowerButtonStyles();
        });
      this.towerButtons.push(rect);
      this.add.text(100 + i * 100, y, label, { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
    });
    this.add
      .text(350, y, '点击塔可升级(80)', { fontSize: '12px', color: '#64748b' })
      .setOrigin(0, 0.5);
  }

  private setupWaveManager(): void {
    this.waveManager = new WaveManager(this, (type: EnemyType) => {
      this.enemyManager.spawn(type);
    });
    this.waveManager.startNextWave(0);
    this.events.emit('wave-changed', this.waveManager.getCurrentWave());
  }

  private setupMapInput(): void {
    const zone = this.add
      .rectangle(
        OFFSET_X + (GRID_COLS * TILE_SIZE) / 2,
        OFFSET_Y + (GRID_ROWS * TILE_SIZE) / 2,
        GRID_COLS * TILE_SIZE,
        GRID_ROWS * TILE_SIZE,
        0,
        0
      )
      .setInteractive()
      .setOrigin(0.5);

    const drawPreview = (ptr: Phaser.Input.Pointer) => {
      this.previewGraphics.clear();
      if (this.selectedTowerType == null) return;
      const { col, row } = worldToGrid(ptr.worldX, ptr.worldY);
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
      if (!canPlaceTower(col, row) || this.towerManager.getTowerAt(col, row)) return;
      const cfg = TOWER_CONFIGS[this.selectedTowerType];
      const { x, y } = gridToWorld(col, row);
      const range = cfg.splashRadius ?? cfg.range;
      const canAfford = getGold(this) >= cfg.cost;
      this.previewGraphics.lineStyle(2, canAfford ? 0x3b82f6 : 0xef4444, canAfford ? 0.6 : 0.8);
      this.previewGraphics.strokeCircle(x, y, range);
      this.previewGraphics.fillStyle(canAfford ? 0x3b82f6 : 0xef4444, canAfford ? 0.2 : 0.3);
      this.previewGraphics.fillCircle(x, y, 16);
    };

    zone.on(Phaser.Input.Events.POINTER_MOVE, drawPreview);
    zone.on(Phaser.Input.Events.POINTER_OVER, (ptr: Phaser.Input.Pointer) => {
      if (ptr.isDown) return;
      drawPreview(ptr);
    });
    zone.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.previewGraphics.clear();
    });

    zone.on(Phaser.Input.Events.POINTER_DOWN, (ptr: Phaser.Input.Pointer) => {
      const { col, row } = worldToGrid(ptr.worldX, ptr.worldY);
      const existing = this.towerManager.getTowerAt(col, row);

      if (existing) {
        this.showTowerActionPanel(existing);
        return;
      }

      this.hideTowerActionPanel();

      if (this.selectedTowerType == null) return;
      if (!this.towerManager.canPlace(col, row)) return;
      const cost = this.towerManager.getTowerCost(this.selectedTowerType);
      if (getGold(this) < cost) {
        this.events.emit('insufficient-gold');
        return;
      }
      if (!spendGold(this, cost)) return;
      this.towerManager.place(col, row, this.selectedTowerType);
      this.events.emit('gold-changed', getGold(this));
    });
  }

  private hideTowerActionPanel(): void {
    this.towerActionPanel?.destroy();
    this.towerActionPanel = null;
  }

  private showTowerActionPanel(tower: Tower): void {
    this.hideTowerActionPanel();

    const panelY = tower.y - 50;
    const parts: Phaser.GameObjects.GameObject[] = [];
    const bg = this.add.rectangle(tower.x, panelY, tower.level >= 2 ? 90 : 120, 56, 0x1e293b, 0.95);
    bg.setStrokeStyle(2, 0x475569);
    bg.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => this.hideTowerActionPanel());
    parts.push(bg);

    if (tower.level < 2) {
      const upgradeCost = this.towerManager.getUpgradeCost();
      const canUpgrade = getGold(this) >= upgradeCost;
      const upgradeBtn = this.add
        .rectangle(tower.x - 35, panelY, 50, 28, canUpgrade ? 0x334155 : 0x1f2937)
        .setInteractive({ useHandCursor: canUpgrade })
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
          if (tower.level >= 2) return;
          if (!spendGold(this, upgradeCost)) return;
          this.towerManager.upgrade(tower);
          this.events.emit('gold-changed', getGold(this));
          this.hideTowerActionPanel();
        });
      const upgradeLabel = this.add.text(tower.x - 35, panelY, '升级80', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
      parts.push(upgradeBtn, upgradeLabel);
    }

    const sellBtn = this.add
      .rectangle(tower.x + (tower.level >= 2 ? 0 : 35), panelY, 50, 28, 0x334155)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        const refund = this.towerManager.sell(tower);
        addGold(this, refund);
        this.events.emit('gold-changed', getGold(this));
        this.hideTowerActionPanel();
      });
    const sellLabel = this.add.text(tower.x + (tower.level >= 2 ? 0 : 35), panelY, '出售', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
    parts.push(sellBtn, sellLabel);

    this.towerActionPanel = this.add.container(0, 0, parts);
  }

  private setupEnemyManager(): void {
    this.enemyManager = new EnemyManager(
      this,
      (_enemy) => {
        loseLife(this);
        this.events.emit('lives-changed', getLives(this));
        if (getLives(this) <= 0) {
          this.events.emit('game-over', false);
        }
      },
      (enemy) => {
        addGold(this, enemy.reward);
        this.events.emit('gold-changed', getGold(this));
      }
    );
  }

  update(time: number, delta: number): void {
    if (this.gameEnded || this.paused) return;

    this.enemyManager.update(delta, time);
    this.towerManager.updateTowers(time, this.enemyManager.getAliveEnemies());
    this.waveManager.update(time, delta);

    const prepareRemaining = this.waveManager.getPrepareRemainingMs(time);
    this.events.emit('wave-changed', this.waveManager.getCurrentWave());
    this.events.emit('prepare-remaining', prepareRemaining);

    if (getLives(this) <= 0) {
      this.gameEnded = true;
      this.events.emit('game-over', false);
    } else if (this.waveManager.hasWon()) {
      this.gameEnded = true;
      this.events.emit('game-over', true);
    }
  }
}
