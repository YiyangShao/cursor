import Phaser from 'phaser';
import type { LevelConfig } from '../types';
import Enemy from '../entities/Enemy';
import Tower from '../entities/Tower';
import Projectile from '../entities/Projectile';
import WaveManager from '../systems/WaveManager';
import {
  getBuildableTowers,
  getTowerDef,
  getTowerTotalCost,
  TOWER_SELL_RATIO,
} from '../config/towers';
import { SoundManager } from '../audio/SoundManager';

function pathFromTiledPolyline(obj: Phaser.Types.Tilemaps.TiledObject): Phaser.Curves.Path {
  const pts = obj.polyline;
  if (!pts || pts.length < 2) throw new Error('Path needs at least 2 points');
  const wx = obj.x ?? 0;
  const wy = obj.y ?? 0;
  const p0 = pts[0];
  const path = new Phaser.Curves.Path(
    (p0?.x ?? 0) + wx,
    (p0?.y ?? 0) + wy,
  );
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    path.lineTo((p?.x ?? 0) + wx, (p?.y ?? 0) + wy);
  }
  return path;
}

interface PlacementSlot {
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
  tower: Tower | null;
  boxGraphics: Phaser.GameObjects.Graphics;
}

export default class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig;
  private path!: Phaser.Curves.Path;
  private placementSlots: PlacementSlot[] = [];
  private waveManager!: WaveManager;
  private selectedTower: Tower | null = null;
  private projectiles: Projectile[] = [];
  private towerBuildMenu: Phaser.GameObjects.Container | null = null;
  private towerBuildMenuZones: Phaser.GameObjects.Zone[] = [];
  private upgradePanel: Phaser.GameObjects.Container | null = null;
  private upgradePanelZones: Phaser.GameObjects.Zone[] = [];
  private soundManager!: SoundManager;

  constructor() {
    super({ key: 'Game' });
  }

  init(data: { levelConfig?: LevelConfig }) {
    const cfg = data?.levelConfig ?? this.cache?.json?.get?.('level1_config');
    this.levelConfig = (cfg as LevelConfig) ?? this.loadLevelConfig();
  }

  private loadLevelConfig(): LevelConfig {
    const cache = this.cache?.json?.get?.('level1_config');
    if (cache) return cache as LevelConfig;
    const raw = {
      id: 'level1',
      name: '草莓草坪',
      tiledMapKey: 'level1',
      initialGold: 150,
      initialLives: 20,
      waves: [
        { enemyId: 'mouse', count: 5, spawnInterval: 1500 },
        { enemyId: 'mouse', count: 8, spawnInterval: 1200 },
        { enemyId: 'mouse', count: 10, spawnInterval: 1000 },
      ],
    };
    return raw as LevelConfig;
  }

  create() {
    this.soundManager = new SoundManager(this);
    this.registry.set('gold', this.levelConfig.initialGold);
    this.registry.set('lives', this.levelConfig.initialLives);
    this.registry.set('wave', 0);
    this.registry.set('totalWaves', this.levelConfig.waves.length);
    this.registry.set('canStartWave', true);

    const map = this.make.tilemap({ key: this.levelConfig.tiledMapKey });
    const pathLayer = map.getObjectLayer('path');
    if (!pathLayer) throw new Error('Map must have object layer "path"');

    const pathObj = pathLayer.objects.find(
      (o) => 'polyline' in o && Array.isArray(o.polyline),
    ) as Phaser.Types.Tilemaps.TiledObject | undefined;
    if (!pathObj) throw new Error('Path layer must have a polyline object');

    this.path = pathFromTiledPolyline(pathObj);

    const pathGfx = this.add.graphics();
    pathGfx.lineStyle(4, 0x88cc44, 0.6);
    this.path.draw(pathGfx);

    this.createEnemyTexture();
    this.createTowerTexture();

    this.createPlacementSlots(map);

    this.waveManager = new WaveManager(
      this,
      this.levelConfig,
      this.path,
      'enemy_placeholder',
      {
        onCreateEnemy: () => {},
        onReachedEnd: () => this.enemyReachedEnd(),
        onKilled: (e: Enemy) => this.enemyKilled(e),
      },
    );

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (ptr: Phaser.Input.Pointer) => {
      if (ptr.leftButtonDown() && !ptr.event.target) {
        this.deselectTower();
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.events.emit('PAUSE');
      this.scene.pause();
      this.scene.get('UI').scene.pause();
    });

    this.scene.launch('UI');
    const uiScene = this.scene.get('UI');
    uiScene.events.on('start-wave', () => this.startNextWave());

    this.refreshUI();
  }

  private createPlacementSlots(map: Phaser.Tilemaps.Tilemap) {
    const tileW = map.tileWidth;
    const tileH = map.tileHeight;
    const createSlot = (left: number, top: number, w = tileW, h = tileH) => {
      const x = left + w / 2;
      const y = top + h / 2;
      const boxGfx = this.add.graphics();
      boxGfx.lineStyle(2, 0x88cc44, 0.6);
      boxGfx.strokeRect(left, top, w, h);
      boxGfx.setDepth(-2);

      const slot: PlacementSlot = {
        x,
        y,
        left,
        top,
        width: w,
        height: h,
        tower: null,
        boxGraphics: boxGfx,
      };
      this.placementSlots.push(slot);

      const zone = this.add
        .zone(left, top, w, h)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(-1);
      zone.on(Phaser.Input.Events.POINTER_DOWN, (ptr: Phaser.Input.Pointer) => {
        if (ptr.leftButtonDown()) this.onSlotClicked(slot);
      });
    };

    const placementLayer = map.getObjectLayer('placement');
    const placementObjects =
      placementLayer?.objects?.filter(
        (o) => o.type === 'buildable' && o.x != null && o.y != null,
      ) ?? [];

    if (placementObjects.length > 0) {
      for (const obj of placementObjects) {
        createSlot(obj.x!, obj.y!, obj.width ?? 64, obj.height ?? 64);
      }
      return;
    }

    const cellsLayer = map.layers.find(
      (l) => l.name === 'cells' && l.data && Array.isArray(l.data),
    );
    if (cellsLayer?.data) {
      for (let row = 0; row < map.height; row++) {
        for (let col = 0; col < map.width; col++) {
          const tile = cellsLayer.data[row][col];
          const gid = tile?.index ?? -1;
          if (gid === -1 || gid === 0) {
            createSlot(col * tileW, row * tileH);
          }
        }
      }
    }
  }

  private onSlotClicked(slot: PlacementSlot) {
    if (slot.tower) {
      this.selectTower(slot.tower);
      return;
    }
    this.openTowerMenu(slot);
  }

  private openTowerMenu(slot: PlacementSlot) {
    this.closeTowerMenu();

    const { width, height } = this.scale;
    const menuX = Math.min(Math.max(slot.x - 80, 60), width - 180);
    let menuY = slot.top - 90;
    if (slot.top < height / 2) {
      menuY = slot.top + slot.height + 10;
    } else {
      menuY = Math.max(menuY, 80);
    }

    const container = this.add.container(menuX, menuY);
    const panel = this.add.graphics();
    panel.fillStyle(0x2d2d3e, 0.95);
    panel.fillRoundedRect(0, 0, 160, 90, 8);
    panel.lineStyle(2, 0x88cc44, 0.8);
    panel.strokeRoundedRect(0, 0, 160, 90, 8);
    container.add(panel);

    const buildable = getBuildableTowers();
    const gold = this.registry.get('gold') as number;

    buildable.forEach((item, i) => {
      const yLocal = 20 + i * 50;
      const canAfford = gold >= item.def.cost;
      const text = this.add
        .text(80, yLocal, `${item.def.displayName} ${item.def.cost}金币`, {
          fontSize: '16px',
          color: canAfford ? '#f8e8d4' : '#888',
        })
        .setOrigin(0.5, 0);
      container.add(text);

      const zoneWorldX = menuX + 10;
      const zoneWorldY = menuY + yLocal - 12;
      const zone = this.add
        .zone(zoneWorldX, zoneWorldY, 140, 36)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: canAfford })
        .setDepth(1001)
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
          if (canAfford) this.placeTower(slot, item.id);
          this.closeTowerMenu();
        });
      this.towerBuildMenuZones.push(zone);
    });

    container.setDepth(1000);
    this.towerBuildMenu = container;

    const escHandler = () => {
      this.closeTowerMenu();
      this.input.keyboard?.off('keydown-ESC', escHandler);
    };
    this.input.keyboard?.once('keydown-ESC', escHandler);

    this.time.delayedCall(150, () => {
      if (!this.towerBuildMenu) return;
      this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
        this.closeTowerMenu();
      });
    });
  }

  private closeTowerMenu() {
    for (const z of this.towerBuildMenuZones) {
      z.destroy();
    }
    this.towerBuildMenuZones = [];
    if (this.towerBuildMenu) {
      this.towerBuildMenu.destroy();
      this.towerBuildMenu = null;
    }
  }

  private placeTower(slot: PlacementSlot, towerId: 'cupcake') {
    if (!slot || slot.tower) return;

    const def = getBuildableTowers().find((t) => t.id === towerId)?.def;
    if (!def) return;

    const gold = this.registry.get('gold') as number;
    if (gold < def.cost) return;

    const tower = new Tower(
      this,
      slot.x,
      slot.y,
      'tower_placeholder',
      { id: towerId, level: 1, ...def },
      (t, target) => this.towerAttack(t, target),
    );
    tower.on('tower-selected', (t: Tower) => this.selectTower(t));
    this.add.existing(tower);

    slot.tower = tower;
    this.registry.set('gold', gold - def.cost);
    this.soundManager.playSfx('place');
    this.updateSlotBox(slot);
    this.refreshUI();
    this.towers.forEach((t) => t.updateEnemies(this.waveManager.getEnemies()));
  }

  private updateSlotBox(slot: PlacementSlot) {
    slot.boxGraphics.clear();
    if (slot.tower) {
      slot.boxGraphics.lineStyle(2, 0x666666, 0.3);
    } else {
      slot.boxGraphics.lineStyle(2, 0x88cc44, 0.6);
    }
    slot.boxGraphics.strokeRect(slot.left, slot.top, slot.width, slot.height);
  }

  private get towers(): Tower[] {
    return this.placementSlots
      .map((s) => s.tower)
      .filter((t): t is Tower => t != null);
  }

  private towerAttack(tower: Tower, target: Enemy) {
    const proj = new Projectile(
      this,
      tower.x,
      tower.y,
      { speed: 400, damage: tower.damage },
      (t, d) => t.takeDamage(d),
    );
    proj.setTarget(target);
    this.projectiles.push(proj);
    this.add.existing(proj as unknown as Phaser.GameObjects.GameObject);
  }

  private selectTower(tower: Tower) {
    this.deselectTower();
    this.selectedTower = tower;
    tower.showRange(true);
    this.showUpgradePanel(tower);
    this.towers.forEach((t) => t.updateEnemies(this.waveManager.getEnemies()));
  }

  private deselectTower() {
    this.closeUpgradePanel();
    if (this.selectedTower) {
      this.selectedTower.showRange(false);
      this.selectedTower = null;
    }
  }

  private showUpgradePanel(tower: Tower) {
    this.closeUpgradePanel();

    const panelX = tower.x;
    const def = tower.getUpgradeDef();
    const gold = this.registry.get('gold') as number;
    const canUpgrade = !!def && gold >= def.goldCost;

    let panelHeight = 50;
    let panelY = tower.y + 55;
    if (canUpgrade) {
      panelHeight = 90;
      panelY = tower.y + 95;
    }

    const container = this.add.container(panelX, panelY);
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d3e, 0.95);
    bg.fillRoundedRect(-60, -panelHeight / 2 + 5, 120, panelHeight, 6);
    bg.lineStyle(2, 0x88cc44, 0.8);
    bg.strokeRoundedRect(-60, -panelHeight / 2 + 5, 120, panelHeight, 6);
    container.add(bg);

    let yOffset = -panelHeight / 2 + 15;

    if (canUpgrade && def) {
      const nextDef = getTowerDef(tower.towerId, def.level);
      const label = this.add
        .text(0, yOffset, `升级 ${nextDef?.displayName ?? ''} ${def.goldCost}金币`, {
          fontSize: '14px',
          color: '#f8e8d4',
        })
        .setOrigin(0.5, 0);
      container.add(label);

      const zoneWorldX = panelX - 60;
      const zoneWorldY = panelY + yOffset - 5;
      const upgradeZone = this.add
        .zone(zoneWorldX, zoneWorldY, 120, 36)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(1001)
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
          this.doUpgradeTower(tower);
          this.closeUpgradePanel();
        });
      this.upgradePanelZones.push(upgradeZone);
      yOffset += 45;
    }

    const refund = this.getSellRefund(tower);
    const sellLabel = this.add
      .text(0, yOffset, `出售 ${refund}金币`, {
        fontSize: '14px',
        color: '#f8e8d4',
      })
      .setOrigin(0.5, 0);
    container.add(sellLabel);

    const slot = this.placementSlots.find((s) => s.tower === tower);
    const sellZoneWorldX = panelX - 60;
    const sellZoneWorldY = panelY + yOffset - 5;
    const sellZone = this.add
      .zone(sellZoneWorldX, sellZoneWorldY, 120, 36)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001)
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (slot) this.sellTower(slot, tower);
        this.closeUpgradePanel();
      });
    this.upgradePanelZones.push(sellZone);

    container.setDepth(1000);
    this.upgradePanel = container;

    this.time.delayedCall(150, () => {
      if (!this.upgradePanel) return;
      this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
        this.closeUpgradePanel();
        this.deselectTower();
      });
    });
  }

  private closeUpgradePanel() {
    for (const z of this.upgradePanelZones) {
      z.destroy();
    }
    this.upgradePanelZones = [];
    if (this.upgradePanel) {
      this.upgradePanel.destroy();
      this.upgradePanel = null;
    }
  }

  private getSellRefund(tower: Tower): number {
    const totalCost = getTowerTotalCost(tower.towerId, tower.level);
    return Math.floor(totalCost * TOWER_SELL_RATIO);
  }

  private sellTower(slot: PlacementSlot, tower: Tower) {
    if (!slot || slot.tower !== tower) return;

    const refund = this.getSellRefund(tower);
    this.registry.set('gold', (this.registry.get('gold') as number) + refund);
    slot.tower = null;
    tower.destroy();
    this.deselectTower();
    this.updateSlotBox(slot);
    this.refreshUI();
    this.towers.forEach((t) => t.updateEnemies(this.waveManager.getEnemies()));
  }

  private doUpgradeTower(tower: Tower) {
    const def = tower.getUpgradeDef();
    if (!def) return;

    const gold = this.registry.get('gold') as number;
    if (gold < def.goldCost) return;

    tower.upgrade(def);
    this.registry.set('gold', gold - def.goldCost);
    this.soundManager.playSfx('place');
    this.closeUpgradePanel();
    this.refreshUI();
    tower.showRange(true);
  }


  private enemyReachedEnd() {
    const lives = (this.registry.get('lives') as number) - 1;
    this.registry.set('lives', lives);
    this.refreshUI();
    if (lives <= 0) {
      this.soundManager.playSfx('defeat');
      this.game.events.emit('GAME_OVER');
      this.scene.pause();
    }
  }

  private enemyKilled(enemy: Enemy) {
    this.soundManager.playSfx('kill');
    const gold = (this.registry.get('gold') as number) + enemy.reward;
    this.registry.set('gold', gold);
    this.refreshUI();
  }

  private startNextWave() {
    const started = this.waveManager.startNextWave();
    if (started) {
      this.registry.set('wave', (this.registry.get('wave') as number) + 1);
      this.registry.set('canStartWave', false);
      this.refreshUI();
    }
  }

  private refreshUI() {
    this.registry.set(
      'canStartWave',
      !this.waveManager.isWaveInProgress() &&
        this.waveManager.hasMoreWaves() &&
        this.waveManager.allEnemiesCleared(),
    );
    this.scene.get('UI').events.emit('refresh');
  }

  update(time: number, delta: number) {
    this.towers.forEach((t) => {
      t.updateEnemies(this.waveManager.getEnemies());
      t.update(time);
    });

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!(p as Phaser.GameObjects.GameObject).active) {
        this.projectiles.splice(i, 1);
        continue;
      }
      p.flyUpdate(time, delta);
    }

    if (this.waveManager.checkVictory()) {
      this.soundManager.playSfx('victory');
      const lives = this.registry.get('lives') as number;
      const gold = this.registry.get('gold') as number;
      this.game.events.emit('VICTORY', {
        levelId: this.levelConfig.id,
        lives,
        gold,
      });
      this.scene.pause();
    }

    this.refreshUI();
  }

  private createEnemyTexture() {
    if (this.textures.exists('enemy_placeholder')) return;
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2d not available');
    ctx.fillStyle = '#e8a87c';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.stroke();
    this.textures.addCanvas('enemy_placeholder', canvas);
  }

  private createTowerTexture() {
    if (this.textures.exists('tower_placeholder')) return;
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2d not available');
    ctx.fillStyle = '#f4c88a';
    ctx.fillRect(8, 8, 48, 48);
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 48, 48);
    ctx.fillStyle = '#e8a87c';
    ctx.beginPath();
    ctx.arc(32, 32, 12, 0, Math.PI * 2);
    ctx.fill();
    this.textures.addCanvas('tower_placeholder', canvas);
  }
}
