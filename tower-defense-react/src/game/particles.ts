export type ParticleKind = 'hit' | 'death' | 'splash' | 'freeze';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  kind: ParticleKind;
}

export function createHitParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (2 + Math.random() * 2),
      vy: Math.sin(angle) * (2 + Math.random() * 2),
      life: 0,
      maxLife: 350,
      color: Math.random() > 0.5 ? '#ffeb3b' : '#fff59d',
      size: 2 + Math.random() * 3,
      kind: 'hit',
    });
  }
  return particles;
}

export function createDeathParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (3 + Math.random() * 4),
      vy: Math.sin(angle) * (3 + Math.random() * 4),
      life: 0,
      maxLife: 450,
      color,
      size: 5 + Math.random() * 6,
      kind: 'death',
    });
  }
  return particles;
}

export function createFreezeParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 920,
      y: Math.random() * 620,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 0,
      maxLife: 600,
      color: 'rgba(150, 220, 255)',
      size: 8 + Math.random() * 12,
      kind: 'freeze',
    });
  }
  return particles;
}

export function createSplashParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 28; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (4 + Math.random() * 6),
      vy: Math.sin(angle) * (4 + Math.random() * 6),
      life: 0,
      maxLife: 550,
      color: Math.random() > 0.5 ? '#ff9800' : '#ff6f00',
      size: 6 + Math.random() * 8,
      kind: 'splash',
    });
  }
  return particles;
}

export function updateParticle(p: Particle, dt: number): boolean {
  p.x += p.vx * (dt / 16);
  p.y += p.vy * (dt / 16);
  p.vy += 0.15 * (dt / 16);
  p.life += dt;
  return p.life < p.maxLife;
}
