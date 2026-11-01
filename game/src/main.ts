import { EventLog } from './analytics/log.ts';
import { Sfx } from './audio/sfx.ts';
import { Input } from './input/input.ts';
import { load, randomId, randomSeed, save } from './meta/storage.ts';
import { Renderer } from './render/render.ts';
import { Sim } from './sim/sim.ts';
import { FP, TICK_HZ } from './sim/tuning.ts';

const BUILD = 'p0-0.1.0';
const STEP_MS = 1000 / TICK_HZ;
const MAX_CATCHUP = 5;
const RESTART_LOCK_MS = 350; // ignore presses right after a crash
const SECOND_RUN_WINDOW_MS = 5 * 60 * 1000;

const params = new URLSearchParams(location.search);
const saved = load();

// Lane A/B arm: ?lanes=0|1 overrides; otherwise a stable 50/50 split per install.
const laneParam = params.get('lanes');
const arm: 0 | 1 = laneParam === '0' || laneParam === '1' ? (Number(laneParam) as 0 | 1) : saved.arm ?? (randomSeed() % 2 === 0 ? 0 : 1);
if (laneParam === null) saved.arm = arm;
save(saved);

const seedParam = params.get('seed');
const debug = params.get('debug') === '1';
const showFps = params.get('fps') === '1' || debug;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const sfx = new Sfx();
sfx.enabled = saved.sound;
const log = new EventLog(randomId(), { arm, build: BUILD, install: saved.installId, src: params.get('src') ?? '' });
log.add('load', { ms: Math.round(performance.now()), w: innerWidth, h: innerHeight, dpr: devicePixelRatio || 1 });

let sim = newSim();
let runId = '';
let attempt = 0;
let firstRunStart = 0;
let runStart = 0;
let crashedAt = 0;
let newBest = false;
let firstInput = false;
let hint = 1;
let trail: number[] = [];
let restartAt = 0;

function newSim(): Sim {
  const seed = seedParam !== null ? Number(seedParam) >>> 0 : randomSeed();
  return new Sim(seed, arm === 1);
}

function startRun(): void {
  attempt++;
  runId = randomId();
  runStart = performance.now();
  if (attempt === 1) firstRunStart = runStart;
  trail = [];
  newBest = false;
  log.add('run_start', { run_id: runId, seed_id: sim.seed, attempt_no: attempt, arrival_type: 'organic' });
  if (attempt === 2) log.add('second_run_start', { within_5min: runStart - firstRunStart <= SECOND_RUN_WINDOW_MS, ms_since_first: Math.round(runStart - firstRunStart) });
}

function endRun(cause: string): void {
  crashedAt = performance.now();
  if (sim.score > saved.best) {
    newBest = saved.best > 0;
    saved.best = sim.score;
    save(saved);
  }
  sfx.crash();
  log.add('run_end', {
    run_id: runId, score: sim.score, duration_ms: Math.round((sim.tick * 1000) / TICK_HZ), cause,
    lanterns: sim.lanterns, stretch: sim.stretch, picks: sim.picks.join(','),
  });
}

input.onPress = () => {
  sfx.unlock();
  if (!firstInput) {
    firstInput = true;
    log.add('first_input', { ms: log.ms() });
  }
  if (!sim.alive && performance.now() - crashedAt > RESTART_LOCK_MS) {
    restartAt = performance.now();
    input.reset();
    sim = newSim();
    startRun();
    sfx.start();
  }
};

const soundBtn = document.getElementById('sound') as HTMLButtonElement;
const paintSound = () => { soundBtn.textContent = sfx.enabled ? '♪' : '×'; soundBtn.setAttribute('aria-pressed', String(sfx.enabled)); };
paintSound();
soundBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
soundBtn.addEventListener('click', () => {
  sfx.unlock();
  sfx.enabled = !sfx.enabled;
  saved.sound = sfx.enabled;
  save(saved);
  paintSound();
});

// FPS sampling: frame intervals over the last ~10 s.
const frames: number[] = [];
let lastFpsLog = performance.now();
function pct(arr: number[], p: number): number {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))] ?? 0;
}
function fpsStats(): { p50: number; p5: number } {
  if (frames.length < 10) return { p50: 0, p5: 0 };
  return { p50: Math.round(1000 / pct(frames, 0.5)), p5: Math.round(1000 / pct(frames, 0.95)) };
}

let last = -1;
let acc = 0;
let paused = false;
let cpuMs = 0;

function frame(now: number): void {
  requestAnimationFrame(frame);
  if (paused) return;
  if (last < 0) last = now;
  const dt = Math.min(250, now - last);
  last = now;
  frames.push(dt);
  if (frames.length > 600) frames.shift();
  const t0 = performance.now();

  acc += dt;
  let steps = 0;
  while (acc >= STEP_MS && steps < MAX_CATCHUP) {
    acc -= STEP_MS;
    steps++;
    if (!sim.alive) continue;
    const events = sim.step(input.sample());
    if (sim.tick % 6 === 0) trail.push(sim.x / FP, sim.y / FP);
    for (const e of events) {
      if (e.type === 'lantern') sfx.lantern();
      else if (e.type === 'lane_pick') log.add('lane_pick', { run_id: runId, fork: e.fork, pick: e.pick });
      else if (e.type === 'crash') endRun(e.cause);
    }
  }
  if (steps === MAX_CATCHUP) acc = 0;
  if (firstInput && hint > 0 && sim.tick > 180) hint = Math.max(0, hint - dt / 600);

  const st = showFps ? fpsStats() : null;
  renderer.draw(sim, {
    trail, held: [input.state.isActive(0), input.state.isActive(1)], hint, crashed: !sim.alive,
    best: saved.best, newBest, fps: st ? `${st.p50} fps · p5 ${st.p5} · ${cpuMs.toFixed(1)} ms` : null,
  });
  cpuMs = cpuMs * 0.9 + (performance.now() - t0) * 0.1;

  if (restartAt) {
    log.add('restart', { ms: Math.round(performance.now() - restartAt) });
    restartAt = 0;
  }
  if (now - lastFpsLog > 60000) {
    lastFpsLog = now;
    log.add('fps_summary', { ...fpsStats(), cpu_ms: Math.round(cpuMs * 10) / 10 });
  }
}

document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  last = -1;
  acc = 0;
  input.reset();
  if (paused) log.add('hidden');
});
window.addEventListener('resize', () => renderer.resize());
window.addEventListener('pagehide', () => log.add('fps_summary', { ...fpsStats(), cpu_ms: Math.round(cpuMs * 10) / 10 }));

startRun();
requestAnimationFrame(frame);

if (debug) {
  const el = document.getElementById('debug') as HTMLDivElement;
  el.style.display = 'block';
  const info = document.createElement('div');
  el.appendChild(info);
  const btn = (label: string, fn: () => void) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    b.addEventListener('click', fn);
    el.appendChild(b);
  };
  btn('Export log', () => {
    const blob = new Blob([JSON.stringify(log.exportAll(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `driftline-log-${saved.installId}-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  btn('Clear log', () => log.clearStored());
  btn(`Arm → ${arm === 1 ? 0 : 1}`, () => {
    params.set('lanes', String(arm === 1 ? 0 : 1));
    location.search = params.toString();
  });
  setInterval(() => {
    info.textContent = `${BUILD} · arm ${arm} · seed ${sim.seed} · run ${attempt} · t ${sim.seconds.toFixed(1)}s · events ${log.events.length}`;
  }, 250);
}
