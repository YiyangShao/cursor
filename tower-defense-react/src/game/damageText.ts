export interface DamageText {
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife: number;
}

export function createDamageText(x: number, y: number, value: number): DamageText {
  return {
    x,
    y,
    value,
    life: 0,
    maxLife: 600,
  };
}

export function updateDamageText(d: DamageText, dt: number): boolean {
  d.life += dt;
  d.y -= 0.4 * (dt / 16);
  return d.life < d.maxLife;
}
