import { create } from 'zustand';
import { SCENES, getScene } from '../lib/scenes';
import { fromUrl } from '../lib/urlState';
import { tweener } from '../lib/tween';

function randomSeed() {
  return Math.floor(Math.random() * 0xFFFFFF);
}

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const FORMS = ['shard', 'petal', 'orb', 'lantern', 'mote', 'fish'];
const FORCE_MODES = ['repel', 'attract', 'swirl'];

const initialScene = SCENES[0];
const initialSeed = randomSeed();

const defaultParams = {
  count: initialScene.count,
  flow: initialScene.flow,
  drift: initialScene.drift,
  forceMode: initialScene.forceMode,
  forceRadius: initialScene.forceRadius,
  forceStrength: initialScene.forceStrength,
  haze: initialScene.haze,
  focus: initialScene.focus,
  bokeh: initialScene.bokeh,
  bloom: initialScene.bloom,
  seed: initialSeed,
  scene: { ...initialScene, seed: initialSeed },
  sceneName: initialScene.name,
  paused: false,
  reducedMotion: false,
  uiVisible: true,
  morphOpacity: 0.96,
};

function doMorphTo(targetScene, targetParams, reducedMotion, ref, set) {
  const seed = randomSeed();
  const newScene = { ...targetScene, seed };

  if (reducedMotion) {
    // snap immediately — no tween
    const snap = { ...targetParams, seed, scene: newScene, sceneName: targetScene.name, morphOpacity: 0.96 };
    set(snap);
    Object.assign(ref, snap);
    document.documentElement.style.setProperty('--accent', targetScene.glow);
    return;
  }

  document.documentElement.style.setProperty('--accent', targetScene.glow);

  // Immediately apply all physics params to the ref so the camera/field responds now
  Object.assign(ref, targetParams);
  set({ ...targetParams, forceMode: targetParams.forceMode });

  // Fade-out current field (0.35s), then swap scene, then fade-in (0.45s)
  tweener.addValue({
    from: 0.96, to: 0, duration: 0.35,
    onUpdate(v) { ref.morphOpacity = v; },
    onComplete() {
      // Swap scene at the bottom of the fade
      const sceneSnap = { scene: newScene, sceneName: targetScene.name, seed, morphOpacity: 0 };
      set(sceneSnap);
      Object.assign(ref, sceneSnap);

      tweener.addValue({
        from: 0, to: 0.96, duration: 0.45,
        onUpdate(v) { ref.morphOpacity = v; },
        onComplete() {
          ref.morphOpacity = 0.96;
          set({ morphOpacity: 0.96 });
        },
      });
    },
  });
}

export const useDriftStore = create((set, get) => ({
  ...defaultParams,
  paramsRef: { current: { ...defaultParams } },

  setParam(key, value) {
    set({ [key]: value });
    get().paramsRef.current[key] = value;
  },

  applyScene(name) {
    const s = getScene(name);
    const targetParams = {
      count: s.count, flow: s.flow, drift: s.drift,
      forceMode: s.forceMode, forceRadius: s.forceRadius,
      forceStrength: s.forceStrength, haze: s.haze,
      focus: s.focus, bokeh: s.bokeh, bloom: s.bloom,
    };
    doMorphTo(s, targetParams, get().reducedMotion, get().paramsRef.current, set);
  },

  randomize() {
    const form = FORMS[Math.floor(Math.random() * FORMS.length)];
    const hue = Math.random() * 360;
    const glow = hslToHex(hue, 0.75, 0.72);
    const bg = hslToHex((hue + 180) % 360, 0.35, 0.06);
    const fog = hslToHex(hue, 0.3, 0.12);

    const targetScene = {
      name: 'Drift', form, bg, fog, glow,
      spread: 8 + Math.random() * 3,
      scale: 0.85 + Math.random() * 0.4,
      emissive: 1.2 + Math.random() * 0.6,
    };
    const targetParams = {
      count: Math.round(800 + Math.random() * 1400),
      flow: 0.3 + Math.random() * 0.7,
      drift: 0.4 + Math.random() * 0.8,
      forceMode: FORCE_MODES[Math.floor(Math.random() * 3)],
      forceRadius: 3 + Math.random() * 3,
      forceStrength: 1.2 + Math.random() * 1.4,
      haze: 0.03 + Math.random() * 0.04,
      focus: 0.008 + Math.random() * 0.01,
      bokeh: 3 + Math.random() * 5,
      bloom: 0.6 + Math.random() * 0.7,
    };
    doMorphTo(targetScene, targetParams, get().reducedMotion, get().paramsRef.current, set);
  },

  togglePause() {
    const next = !get().paused;
    set({ paused: next });
    get().paramsRef.current.paused = next;
  },

  toggleUI() {
    set(s => ({ uiVisible: !s.uiVisible }));
  },

  setReducedMotion(val) {
    set({ reducedMotion: val });
    get().paramsRef.current.reducedMotion = val;
    if (val) {
      get().setParam('flow', 0);
      get().setParam('drift', 0);
    }
  },

  loadFromUrl() {
    const data = fromUrl();
    if (!data) return;
    const { sceneName, ...rest } = data;
    if (sceneName) {
      const s = getScene(sceneName);
      const seed = rest.seed ?? randomSeed();
      const scene = { ...s, seed };
      const newParams = { ...rest, scene, sceneName: s.name, seed };
      set(newParams);
      Object.assign(get().paramsRef.current, newParams);
      document.documentElement.style.setProperty('--accent', s.glow);
    }
  },
}));
