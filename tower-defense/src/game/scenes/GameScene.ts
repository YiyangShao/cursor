import Phaser from 'phaser';

/**
 * Build Phaser path from Tiled polyline object.
 * Polyline points are relative to object's (x, y).
 */
function pathFromTiledPolyline(obj: Phaser.Types.Tilemaps.TiledObject): Phaser.Curves.Path {
  const pts = obj.polyline;
  if (!pts || pts.length < 2) {
    throw new Error('Path needs at least 2 points');
  }
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

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  create() {
    const map = this.make.tilemap({ key: 'level1' });
    const pathLayer = map.getObjectLayer('path');
    if (!pathLayer) {
      throw new Error('Map must have object layer named "path"');
    }

    const pathObj = pathLayer.objects.find(
      (o) => 'polyline' in o && Array.isArray(o.polyline),
    ) as Phaser.Types.Tilemaps.TiledObject | undefined;
    if (!pathObj) {
      throw new Error('Path layer must have a polyline object');
    }

    const path = pathFromTiledPolyline(pathObj);

    // Draw path debug (optional)
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(4, 0x88cc44, 0.6);
    path.draw(pathGraphics);

    // Placeholder enemy texture (circle)
    this.createEnemyTexture();

    const start = path.getStartPoint();
    const follower = this.add.follower(
      path,
      start.x,
      start.y,
      'enemy_placeholder',
    );
    follower.setScale(0.5);
    follower.startFollow({
      duration: 8000,
      from: 0,
      to: 1,
    });
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
}
