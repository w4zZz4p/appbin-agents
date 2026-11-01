/**
 * Event log. Always kept in memory and mirrored to localStorage, so a session can be
 * exported from the debug panel (?debug=1). From P1, if a beacon URL is configured
 * (VITE_BEACON_URL at build time), events are also batched to it with sendBeacon.
 */
export interface LogEvent { t: number; type: string; [k: string]: unknown }

const KEY = 'driftline.log.v1';
const MAX = 3000;

export class EventLog {
  readonly events: LogEvent[] = [];
  readonly session: string;
  private t0 = performance.now();
  private dirty = false;
  private unsent: LogEvent[] = [];
  readonly base: Record<string, unknown>;
  readonly beaconUrl: string;

  constructor(session: string, base: Record<string, unknown>, beaconUrl = '') {
    this.session = session;
    this.base = base;
    this.beaconUrl = beaconUrl;
    window.addEventListener('pagehide', () => { this.flush(); this.send(); });
    setInterval(() => { this.flush(); this.send(); }, 10000);
  }

  private send(): void {
    if (!this.beaconUrl || this.unsent.length === 0) return;
    const batch = this.unsent;
    this.unsent = [];
    try {
      const ok = navigator.sendBeacon(this.beaconUrl, JSON.stringify(batch));
      if (!ok) this.unsent = batch.concat(this.unsent).slice(-MAX);
    } catch {
      this.unsent = batch.concat(this.unsent).slice(-MAX);
    }
  }

  ms(): number {
    return Math.round(performance.now() - this.t0);
  }

  add(type: string, data: Record<string, unknown> = {}): void {
    const e: LogEvent = { t: this.ms(), type, session: this.session, ...this.base, ...data };
    this.events.push(e);
    if (this.events.length > MAX) this.events.shift();
    if (this.beaconUrl) this.unsent.push(e);
    this.dirty = true;
  }

  flush(): void {
    if (!this.dirty) return;
    this.dirty = false;
    try {
      const prev = JSON.parse(localStorage.getItem(KEY) || '[]') as LogEvent[];
      const mine = prev.filter((e) => e.session !== this.session);
      const all = mine.concat(this.events).slice(-MAX);
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch { /* storage unavailable */ }
  }

  /** All stored events (this and earlier sessions on this device). */
  exportAll(): LogEvent[] {
    this.dirty = true;
    this.flush();
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') as LogEvent[]; } catch { return this.events; }
  }

  clearStored(): void {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }
}
