export type ParticleKind = 'hit' | 'death' | 'splash';

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
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * 2,
      vy: Math.sin(angle) * 2,
      life: 0,
      maxLife: 300,
      color: '#ffeb3b',
      size: 3,
      kind: 'hit',
    });
  }
  return particles;
}

export function createDeathParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (2 + Math.random() * 3),
      vy: Math.sin(angle) * (2 + Math.random() * 3),
      life: 0,
      maxLife: 400,
      color,
      size: 4 + Math.random() * 4,
      kind: 'death',
    });
  }
  return particles;
}

export function createSplashParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (3 + Math.random() * 5),
      vy: Math.sin(angle) * (3 + Math.random() * 5),
      life: 0,
      maxLife: 500,
      color: '#ff9800',
      size: 5 + Math.random() * 5,
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
