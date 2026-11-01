import { EventLog } from './analytics/log.ts';
import { Sfx } from './audio/sfx.ts';
import { Input } from './input/input.ts';
import { dayLabel, seedForDay, utcDay } from './meta/daily.ts';
import { decodeChallenge, encodeChallenge, type Challenge } from './meta/share.ts';
import { load, randomId, randomSeed, save } from './meta/storage.ts';
import { Renderer } from './render/render.ts';
import { Ghost, Recorder, type Runs } from './sim/replay.ts';
import { Sim } from './sim/sim.ts';
import { FP, SIM_VERSION, TICK_HZ } from './sim/tuning.ts';
import { shareLink, showShare, toast } from './ui.ts';

const BUILD = 'p1-0.2.0';
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

const seedParam = params.get('seed'); // debug: fixed river instead of the daily one
const debug = params.get('debug') === '1';
const showFps = params.get('fps') === '1' || debug;
const beaconUrl = import.meta.env.VITE_BEACON_URL ?? '';

// --- challenge link (#c=...) -------------------------------------------------------
const hash = new URLSearchParams(location.hash.slice(1));
const rawCode = hash.get('c');
const challenge: Challenge | null = rawCode ? decodeChallenge(rawCode) : null;
const challengeOk = challenge !== null && challenge.simVersion === SIM_VERSION;
const arrival: 'organic' | 'challenge' = challenge ? 'challenge' : 'organic';
if (rawCode) history.replaceState(null, '', location.pathname + location.search); // a reload starts fresh

const canvas = document.getElementById('game') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const sfx = new Sfx();
sfx.enabled = saved.sound;
const log = new EventLog(randomId(), { arm, build: BUILD, install: saved.installId, src: params.get('src') ?? '', arrival_type: arrival }, beaconUrl);
if (beaconUrl) (document.getElementById('privacy') as HTMLDivElement).style.display = 'block';

let today = utcDay();
log.add('load', { ms: Math.round(performance.now()), w: innerWidth, h: innerHeight, dpr: devicePixelRatio || 1, day: today });
if (saved.lastDay !== null && saved.lastDay !== today) log.add('return_visit', { days_since_last: today - saved.lastDay });
saved.lastDay = today;
save(saved);

if (rawCode) {
  log.add('challenge_open', { seed_id: challenge?.day ?? null, valid: challenge !== null, version_ok: challengeOk });
  if (!challenge) toast('That challenge link looks broken. Here is today’s river.', 3500);
  else if (!challengeOk) toast('This wake is from an older version', 3500);
}

// --- runs ----------------------------------------------------------------------------
interface Course { day: number; seed: number; lanes: boolean; challenge: boolean }

let sim: Sim;
let course: Course;
let ghosts: Ghost[] = [];
let recorder = new Recorder();
let runId = '';
let attempt = 0;
let firstRunStart = 0;
let crashedAt = 0;
let newBest = false;
let firstInput = false;
let challengePlayedLogged = false;
let hint = 1;
let trail: number[] = [];
let restartAt = 0;
let lastRuns: Runs | null = null; // previous run on the current course (ghost)
let challengeRunsLeft = challenge ? 1 : 0; // a past-day link plays once, then today's river

function pickCourse(): Course {
  today = utcDay();
  if (challenge && (challengeRunsLeft > 0 || challenge.day === today)) {
    // always play the linked seed, even after the UTC day rolls over
    return { day: challenge.day, seed: seedForDay(challenge.day), lanes: challenge.lanes, challenge: true };
  }
  if (seedParam !== null) return { day: today, seed: Number(seedParam) >>> 0, lanes: arm === 1, challenge: false };
  return { day: today, seed: seedForDay(today), lanes: arm === 1, challenge: false };
}

function sameCourse(a: Course | undefined, b: Course): boolean {
  return !!a && a.day === b.day && a.seed === b.seed && a.lanes === b.lanes;
}

function startRun(): void {
  const prev = course;
  course = pickCourse();
  if (challengeRunsLeft > 0) challengeRunsLeft--;
  if (!sameCourse(prev, course)) lastRuns = null;
  // first run of the day on the daily river: last run from an earlier visit today
  if (!lastRuns && !course.challenge && seedParam === null && saved.lastRun && saved.lastRun.day === course.day &&
      saved.lastRun.lanes === course.lanes && saved.lastRun.simVersion === SIM_VERSION) {
    lastRuns = saved.lastRun.runs;
  }

  sim = new Sim(course.seed, course.lanes);
  recorder = new Recorder();
  ghosts = [];
  if (course.challenge && challenge && challengeOk) ghosts.push(new Ghost(course.seed, course.lanes, challenge.runs, 'challenge'));
  if (lastRuns) ghosts.push(new Ghost(course.seed, course.lanes, lastRuns, 'last'));

  attempt++;
  runId = randomId();
  const now = performance.now();
  if (attempt === 1) firstRunStart = now;
  trail = [];
  newBest = false;
  showShare(false);
  log.add('run_start', {
    run_id: runId, seed_id: course.day, seed: course.seed, lanes: course.lanes ? 1 : 0, attempt_no: attempt,
    course: course.challenge ? 'challenge' : 'daily', ghosts: ghosts.map((g) => g.kind).join(','),
  });
  if (attempt === 2) {
    log.add('second_run_start', { within_5min: now - firstRunStart <= SECOND_RUN_WINDOW_MS, ms_since_first: Math.round(now - firstRunStart) });
  }
}

function endRun(cause: string): void {
  crashedAt = performance.now();
  const runs = recorder.snapshot();
  lastRuns = runs;
  if (sim.score > saved.best) {
    newBest = saved.best > 0;
    saved.best = sim.score;
  }
  if (!course.challenge && seedParam === null) {
    if (saved.bestDay !== course.day) { saved.bestDay = course.day; saved.bestToday = 0; }
    saved.bestToday = Math.max(saved.bestToday, sim.score);
    saved.lastRun = { day: course.day, lanes: course.lanes, simVersion: SIM_VERSION, runs };
  }
  save(saved);
  sfx.crash();
  const challengeGhost = ghosts.find((g) => g.kind === 'challenge');
  log.add('run_end', {
    run_id: runId, score: sim.score, duration_ms: Math.round((sim.tick * 1000) / TICK_HZ), cause,
    lanterns: sim.lanterns, stretch: sim.stretch, picks: sim.picks.join(','),
    course: course.challenge ? 'challenge' : 'daily',
    beat_challenge: challengeGhost ? sim.score > challengeGhost.sim.score : null,
  });

  if (seedParam === null) {
    const finished = { ...course };
    const stretch = sim.stretch;
    showShare(true, () => void shareRun(finished, runs, stretch));
  }
}

async function shareRun(c: Course, runs: Runs, stretch: number): Promise<void> {
  const code = encodeChallenge({ simVersion: SIM_VERSION, day: c.day, lanes: c.lanes, runs });
  const url = `${location.origin}${location.pathname}?src=challenge#c=${code}`;
  const text = `I reached stretch ${stretch} on the Driftline river for ${dayLabel(c.day)}. Race my wake:`;
  const method = await shareLink('Driftline challenge', text, url);
  log.add('share_click', { run_id: runId, method, code_len: code.length, seed_id: c.day });
}

function crashNote(): string {
  if (challenge && course.challenge && challengeRunsLeft === 0 && challenge.day !== utcDay()) return 'Next: today’s river';
  const g = ghosts.find((x) => x.kind === 'challenge');
  if (g && !sim.alive) return sim.score > g.sim.score ? 'You beat their wake!' : `Their wake: ${g.sim.score}`;
  return '';
}

function runNote(): string {
  if (course.challenge && challengeOk) return 'Race the golden wake';
  if (course.challenge) return 'This river was shared with you';
  if (seedParam !== null) return '';
  return attempt === 1 ? 'Today’s river, same for everyone' : lastRuns ? 'Race your last wake' : '';
}

input.onPress = () => {
  sfx.unlock();
  if (!firstInput) {
    firstInput = true;
    log.add('first_input', { ms: log.ms() });
  }
  if (sim.alive && course.challenge && !challengePlayedLogged) {
    challengePlayedLogged = true;
    log.add('challenge_played', { seed_id: course.day });
  }
  if (!sim.alive && performance.now() - crashedAt > RESTART_LOCK_MS) {
    restartAt = performance.now();
    input.reset();
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

// --- FPS sampling: frame intervals over the last ~10 s ----------------------------
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

// --- main loop -----------------------------------------------------------------------
let last = -1;
let acc = 0;
let paused = false;
let cpuMs = 0;

function tick(): void {
  const inp = input.sample();
  recorder.push(inp);
  const events = sim.step(inp);
  for (const g of ghosts) {
    if (g.step()) log.add('replay_mismatch', { run_id: runId, kind: g.kind, tick: g.sim.tick, expected: g.length, seed_id: course.day });
  }
  if (sim.tick % 6 === 0) trail.push(sim.x / FP, sim.y / FP);
  for (const e of events) {
    if (e.type === 'lantern') sfx.lantern();
    else if (e.type === 'lane_pick') log.add('lane_pick', { run_id: runId, fork: e.fork, pick: e.pick });
    else if (e.type === 'crash') endRun(e.cause);
  }
}

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
    if (sim.alive) tick();
  }
  if (steps === MAX_CATCHUP) acc = 0;
  if (firstInput && hint > 0 && sim.tick > 180) hint = Math.max(0, hint - dt / 600);

  const st = showFps ? fpsStats() : null;
  renderer.draw(sim, {
    trail, held: [input.state.isActive(0), input.state.isActive(1)], hint, crashed: !sim.alive,
    best: course.challenge || seedParam !== null ? saved.best : saved.bestDay === course.day ? saved.bestToday : 0,
    newBest, fps: st ? `${st.p50} fps · p5 ${st.p5} · ${cpuMs.toFixed(1)} ms` : null,
    ghosts: ghosts.map((g) => ({ sim: g.sim, trail: g.trail, kind: g.kind })),
    note: runNote(), crashNote: sim.alive ? '' : crashNote(),
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

// --- debug panel (?debug=1) -----------------------------------------------------------
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
    info.textContent = `${BUILD} · arm ${arm} · day ${course.day} · seed ${sim.seed} · run ${attempt} · ` +
      `t ${sim.seconds.toFixed(1)}s · ghosts ${ghosts.length} · events ${log.events.length}${beaconUrl ? ' · beacon on' : ''}`;
  }, 250);
}
