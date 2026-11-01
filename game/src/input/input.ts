import { PulseState } from './pulse.ts';

/**
 * Pointer and keyboard to per-tick input (R1):
 * hold the left/right half to steer, release to drift, both sides = straight.
 * Each pointer keeps the side it started on (pointer capture). At most one pointer per side.
 */
export class Input {
  readonly state = new PulseState();
  /** Called on any press (used for first_input, audio unlock and restart). */
  onPress: (() => void) | null = null;
  private pointers = new Map<number, 0 | 1>();
  private keys = new Set<string>();

  constructor(el: HTMLElement) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const side: 0 | 1 = e.clientX < window.innerWidth / 2 ? 0 : 1;
      for (const s of this.pointers.values()) if (s === side) return; // one pointer per side
      this.pointers.set(e.pointerId, side);
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      this.state.press(side);
      this.onPress?.();
    });
    const up = (e: PointerEvent) => {
      const side = this.pointers.get(e.pointerId);
      if (side === undefined) return;
      this.pointers.delete(e.pointerId);
      if (!this.keysHeld(side)) this.state.release(side);
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      const side = keySide(e.code);
      if (side === null) return;
      e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      this.state.press(side);
      this.onPress?.();
    });
    window.addEventListener('keyup', (e) => {
      const side = keySide(e.code);
      if (side === null) return;
      this.keys.delete(e.code);
      if (!this.keysHeld(side) && !this.pointerHeld(side)) this.state.release(side);
    });
    window.addEventListener('blur', () => this.reset());
  }

  /** Bits for this tick. */
  sample(): number {
    return this.state.sample();
  }

  reset(): void {
    this.pointers.clear();
    this.keys.clear();
    this.state.clear();
  }

  private keysHeld(side: 0 | 1): boolean {
    for (const k of this.keys) if (keySide(k) === side) return true;
    return false;
  }

  private pointerHeld(side: 0 | 1): boolean {
    for (const s of this.pointers.values()) if (s === side) return true;
    return false;
  }
}

function keySide(code: string): 0 | 1 | null {
  if (code === 'ArrowLeft' || code === 'KeyA') return 0;
  if (code === 'ArrowRight' || code === 'KeyD') return 1;
  return null;
}
