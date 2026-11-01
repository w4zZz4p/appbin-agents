import type { Sim } from '../sim/sim.ts';
import { BOAT_HL, BOAT_HW, BOAT_SCREEN_Y, FP, ROW, STRETCH_LEN, VIEW_H, WORLD_W, speedTick } from '../sim/tuning.ts';

// Palette shifts with depth (one entry per stretch, then holds).
const WATER = ['#3d8fc4', '#2f78ad', '#28639a', '#245089', '#2a4479', '#33396b'];
const LAND = ['#3f6b45', '#3a6044', '#355542', '#314a40', '#2e413d', '#2b3839'];
const FOG = 'rgba(14, 22, 34, 0.9)';

export interface GhostView {
  sim: Sim;
  trail: number[];
  kind: 'last' | 'challenge';
}

export interface Overlay {
  ghosts: GhostView[];
  /** Small line under the hint at the start of a run (e.g. "Today's river, same for everyone"). */
  note: string;
  /** Extra line on the crash panel. */
  crashNote: string;
  trail: number[]; // flat [x, y, x, y, ...] in units
  held: [boolean, boolean];
  hint: number; // 0..1 alpha
  crashed: boolean;
  best: number;
  newBest: boolean;
  fps: string | null;
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private scale = 1;
  private offX = 0;
  private boatSY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D not available');
    this.ctx = ctx;
    this.resize();
  }

  resize(): void {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.floor(window.innerWidth * this.dpr);
    this.h = Math.floor(window.innerHeight * this.dpr);
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    // fit the 360 x 640 logical view; landscape shows extra land at the sides
    this.scale = Math.min(this.w / WORLD_W, this.h / VIEW_H);
    this.offX = (this.w - WORLD_W * this.scale) / 2;
    this.boatSY = this.h * BOAT_SCREEN_Y;
  }

  draw(sim: Sim, o: Overlay): void {
    const { ctx, w, h, scale } = this;
    const by = sim.y / FP;
    const bx = sim.x / FP;
    const depth = Math.min(WATER.length - 1, Math.floor(by / STRETCH_LEN));
    const sx = (x: number) => this.offX + x * scale;
    const sy = (y: number) => this.boatSY - (y - by) * scale;

    ctx.fillStyle = LAND[depth];
    ctx.fillRect(0, 0, w, h);

    const rv = sim.river;
    const top = by + this.boatSY / scale + ROW;
    const bottom = Math.max(0, by - (h - this.boatSY) / scale - ROW);
    const r0 = Math.max(0, Math.floor(bottom / ROW));
    const r1 = Math.min(rv.rows - 1, Math.ceil(top / ROW));

    // water
    ctx.fillStyle = WATER[depth];
    ctx.beginPath();
    // the river starts at y = 0; extend its first row down past the bottom of the screen
    const below = by - (h - this.boatSY) / scale - ROW;
    ctx.moveTo(sx(rv.bankL[r0]), sy(Math.min(below, r0 * ROW)));
    for (let r = r0; r <= r1; r++) ctx.lineTo(sx(rv.bankL[r]), sy(r * ROW));
    for (let r = r1; r >= r0; r--) ctx.lineTo(sx(rv.bankR[r]), sy(r * ROW));
    ctx.lineTo(sx(rv.bankR[r0]), sy(Math.min(below, r0 * ROW)));
    ctx.closePath();
    ctx.fill();

    // islands
    ctx.fillStyle = LAND[depth];
    let start = -1;
    for (let r = r0; r <= r1 + 1; r++) {
      const has = r <= r1 && rv.islL[r] >= 0 && rv.islR[r] > rv.islL[r];
      if (has && start < 0) start = r;
      if (!has && start >= 0) {
        ctx.beginPath();
        for (let k = start; k < r; k++) ctx[k === start ? 'moveTo' : 'lineTo'](sx(rv.islL[k]), sy(k * ROW));
        for (let k = r - 1; k >= start; k--) ctx.lineTo(sx(rv.islR[k]), sy(k * ROW));
        ctx.closePath();
        ctx.fill();
        start = -1;
      }
    }

    // rocks
    for (const rk of rv.rocks) {
      if (rk.y < bottom - 20) continue;
      if (rk.y > top + 20) break;
      const x = sx(rk.x), y = sy(rk.y), r = rk.r * scale;
      ctx.fillStyle = '#5b6470';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7d8794';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // lanterns
    for (const l of rv.lanterns) {
      if (l.y < bottom - 20) continue;
      if (l.y > top + 20) break;
      if (sim.collected.has(l.id)) continue;
      const x = sx(l.x), y = sy(l.y);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 18 * scale);
      g.addColorStop(0, 'rgba(255, 214, 120, 0.9)');
      g.addColorStop(1, 'rgba(255, 214, 120, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 18 * scale, y - 18 * scale, 36 * scale, 36 * scale);
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath();
      ctx.arc(x, y, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // ghosts: earlier runs replayed on the same river
    for (const g of o.ghosts) {
      const col = g.kind === 'challenge' ? '255, 214, 92' : '230, 240, 255';
      if (g.trail.length >= 4) {
        ctx.strokeStyle = `rgba(${col}, ${g.kind === 'challenge' ? 0.45 : 0.28})`;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(sx(g.trail[0]), sy(g.trail[1]));
        for (let i = 2; i < g.trail.length; i += 2) ctx.lineTo(sx(g.trail[i]), sy(g.trail[i + 1]));
        ctx.stroke();
      }
      const gy = sy(g.sim.y / FP);
      if (gy > -20 && gy < h + 20) this.drawBoat(sx(g.sim.x / FP), gy, g.sim, scale, `rgba(${col}, ${g.sim.alive ? (g.kind === 'challenge' ? 0.85 : 0.5) : 0.3})`);
    }

    // trail of this run
    if (o.trail.length >= 4) {
      ctx.strokeStyle = o.crashed ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = (o.crashed ? 2 : 1.5) * scale;
      ctx.beginPath();
      ctx.moveTo(sx(o.trail[0]), sy(o.trail[1]));
      for (let i = 2; i < o.trail.length; i += 2) ctx.lineTo(sx(o.trail[i]), sy(o.trail[i + 1]));
      ctx.lineTo(sx(bx), sy(by));
      ctx.stroke();
    }

    this.drawBoat(sx(bx), this.boatSY, sim, scale, sim.alive ? '#f6f3ea' : '#c9c4b6');

    // fog beyond vision (lanterns push it back ~1 s)
    const vy = sy(by + sim.vision);
    if (vy > 0) {
      const edge = 60 * scale;
      ctx.fillStyle = FOG;
      ctx.fillRect(0, 0, w, Math.max(0, Math.ceil(vy - edge) + 1));
      const g = ctx.createLinearGradient(0, vy - edge, 0, vy);
      g.addColorStop(0, FOG);
      g.addColorStop(1, 'rgba(14, 22, 34, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, vy - edge, w, edge);
    }

    // ghosts ahead of the screen: a marker at the top edge
    for (const g of o.ghosts) {
      if (!g.sim.alive || sy(g.sim.y / FP) > 0) continue;
      const x = sx(g.sim.x / FP);
      ctx.fillStyle = g.kind === 'challenge' ? 'rgba(255, 200, 110, 0.9)' : 'rgba(230, 240, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x, 6 * this.dpr);
      ctx.lineTo(x + 7 * this.dpr, 18 * this.dpr);
      ctx.lineTo(x - 7 * this.dpr, 18 * this.dpr);
      ctx.closePath();
      ctx.fill();
    }

    this.drawUi(sim, o);
  }

  private drawBoat(x: number, y: number, sim: Sim, scale: number, color: string): void {
    const { ctx } = this;
    const angle = Math.atan2(sim.vx, speedTick(sim.y)) * 0.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const hw = BOAT_HW * scale, hl = BOAT_HL * scale;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -hl);
    ctx.lineTo(hw, hl * 0.2);
    ctx.lineTo(hw * 0.6, hl);
    ctx.lineTo(-hw * 0.6, hl);
    ctx.lineTo(-hw, hl * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, -hl);
    ctx.lineTo(hw * 0.35, hl * 0.6);
    ctx.lineTo(-hw * 0.35, hl * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawUi(sim: Sim, o: Overlay): void {
    const { ctx, w, h, dpr } = this;
    const u = Math.max(1, Math.min(w, h * 0.5625) / 360); // text scale
    ctx.textBaseline = 'top';

    // held-side feedback
    if (sim.alive) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      if (o.held[0]) ctx.fillRect(0, 0, w / 2, h);
      if (o.held[1]) ctx.fillRect(w / 2, 0, w / 2, h);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${Math.round(22 * u)}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(String(sim.score), 16 * u, 16 * u);
    ctx.font = `${Math.round(13 * u)}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`best ${o.best}`, 16 * u, 44 * u);
    if (sim.bonus > 0) {
      ctx.fillStyle = 'rgba(255, 225, 150, 0.9)';
      ctx.fillText('lantern light', 16 * u, 62 * u);
    }

    if (o.hint > 0) {
      ctx.globalAlpha = o.hint;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${Math.round(18 * u)}px system-ui, sans-serif`;
      ctx.fillText('Hold a side to steer', w / 2, h * 0.8);
      ctx.font = `${Math.round(30 * u)}px system-ui, sans-serif`;
      ctx.fillText('‹', w * 0.12, h * 0.78);
      ctx.fillText('›', w * 0.88, h * 0.78);
      ctx.globalAlpha = 1;
    }
    if (o.note && sim.alive && sim.tick < 300) {
      ctx.globalAlpha = Math.min(1, (300 - sim.tick) / 60);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe9a8';
      ctx.font = `${Math.round(14 * u)}px system-ui, sans-serif`;
      ctx.fillText(o.note, w / 2, h * 0.8 + 28 * u);
      ctx.globalAlpha = 1;
    }

    if (o.crashed) {
      ctx.fillStyle = 'rgba(10, 16, 26, 0.55)';
      ctx.fillRect(0, h * 0.28, w, Math.max(h * 0.26, 140 * u));
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.round(26 * u)}px system-ui, sans-serif`;
      ctx.fillText(`Reached stretch ${sim.stretch}`, w / 2, h * 0.31);
      ctx.font = `${Math.round(16 * u)}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const line = o.newBest ? `${sim.score} · new best` : `${sim.score} · best ${o.best}`;
      ctx.fillText(line, w / 2, h * 0.31 + 38 * u);
      ctx.font = `600 ${Math.round(18 * u)}px system-ui, sans-serif`;
      ctx.fillStyle = '#ffe9a8';
      ctx.fillText('Tap to drift again', w / 2, h * 0.31 + 70 * u);
      if (o.crashNote) {
        ctx.font = `${Math.round(13 * u)}px system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText(o.crashNote, w / 2, h * 0.31 + 98 * u);
      }
    }

    if (o.fps) {
      ctx.textAlign = 'right';
      ctx.font = `${Math.round(12 * dpr)}px ui-monospace, monospace`;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      const tw = ctx.measureText(o.fps).width;
      ctx.fillRect(w - tw - 12 * dpr, h - 24 * dpr, tw + 8 * dpr, 18 * dpr);
      ctx.fillStyle = '#9f9';
      ctx.fillText(o.fps, w - 8 * dpr, h - 21 * dpr);
    }
  }
}
