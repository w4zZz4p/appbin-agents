/** Three synthesized SFX (no audio files to download). Unlocked on the first press. */
export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch { this.ctx = null; }
  }

  lantern(): void {
    this.tone(880, 1320, 0.16, 'sine', 0.18);
  }

  start(): void {
    this.tone(220, 330, 0.25, 'triangle', 0.08);
  }

  crash(): void {
    const ctx = this.ctx;
    if (!ctx || !this.enabled) return;
    const len = Math.floor(ctx.sampleRate * 0.35);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    src.connect(f).connect(g).connect(ctx.destination);
    src.start();
  }

  private tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.enabled) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  }
}
