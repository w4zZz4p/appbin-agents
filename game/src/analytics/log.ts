/**
 * P0 analytics: a local event log for in-room playtests (no network).
 * Kept in memory and mirrored to localStorage so a session can be exported afterwards
 * from the debug panel (?debug=1).
 */
export interface LogEvent { t: number; type: string; [k: string]: unknown }

const KEY = 'driftline.log.v1';
const MAX = 3000;

export class EventLog {
  readonly events: LogEvent[] = [];
  readonly session: string;
  private t0 = performance.now();
  private dirty = false;
  readonly base: Record<string, unknown>;

  constructor(session: string, base: Record<string, unknown>) {
    this.session = session;
    this.base = base;
    window.addEventListener('pagehide', () => this.flush());
    setInterval(() => this.flush(), 5000);
  }

  ms(): number {
    return Math.round(performance.now() - this.t0);
  }

  add(type: string, data: Record<string, unknown> = {}): void {
    this.events.push({ t: this.ms(), type, session: this.session, ...this.base, ...data });
    if (this.events.length > MAX) this.events.shift();
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
