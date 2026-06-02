import * as THREE from 'three';

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) { return a + (b - a) * t; }

const _ca = new THREE.Color();
const _cb = new THREE.Color();

function createTweener() {
  let tweens = [];
  let pending = [];

  function flushPending() {
    if (pending.length) {
      tweens.push(...pending);
      pending = [];
    }
  }

  function tick(delta) {
    // Merge any tweens queued since the last tick (e.g. from another tween's
    // onComplete) so they are never dropped.
    flushPending();

    const survivors = [];
    for (const tw of tweens) {
      tw.elapsed += delta;
      const t = easeInOutCubic(Math.min(tw.elapsed / tw.duration, 1));
      tw.onUpdate(t); // t is clamped to 1 on the final frame → final value written
      if (tw.elapsed >= tw.duration) {
        tw.onComplete?.(); // may enqueue a follow-up tween into `pending`
      } else {
        survivors.push(tw);
      }
    }
    tweens = survivors;

    // A follow-up tween added during an onComplete this frame should start next
    // tick — merge it now so the reassignment above can't discard it.
    flushPending();
  }

  function add({ from, to, duration, onUpdate, onComplete }) {
    const numericKeys = Object.keys(to).filter(k => typeof to[k] === 'number' && typeof from[k] === 'number');
    const colorKeys = ['bg', 'fog', 'glow'].filter(k => to[k] !== undefined && from[k] !== undefined);

    pending.push({
      elapsed: 0,
      duration,
      onUpdate(t) {
        const r = {};
        for (const k of numericKeys) r[k] = lerp(from[k], to[k], t);
        for (const k of colorKeys) {
          _ca.set(from[k]);
          _cb.set(to[k]);
          _ca.lerp(_cb, t);
          r[k] = '#' + _ca.getHexString();
        }
        onUpdate(r, t);
      },
      onComplete,
    });
  }

  function addValue({ from, to, duration, onUpdate, onComplete }) {
    pending.push({
      elapsed: 0,
      duration,
      onUpdate(t) { onUpdate(lerp(from, to, t), t); },
      onComplete,
    });
  }

  function clear() { tweens = []; pending = []; }

  return { tick, add, addValue, clear };
}

// Module-level singleton — shared across the app
export const tweener = createTweener();
