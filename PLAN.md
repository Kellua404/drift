# Drift — Build Plan

> **Drift** is a real-time, cursor-driven 3D dreamscape — an endless field of
> thousands of softly glowing forms suspended in luminous fog, drifting in slow
> autonomous motion. Your cursor moves *through* the field like a current: forms
> part around it, scatter, and settle back on springs. It is rendered with WebGL
> via react-three-fiber, with depth-of-field bokeh, bloom, and grain so the whole
> thing feels like drifting through a half-remembered dream.
>
> This document is the **complete handoff spec**. A builder model (Sonnet) should
> be able to ship the entire app from this file alone, in the §11 build order. It
> is intentionally exhaustive — including the instanced physics field and the
> post-processing pipeline — so the hard parts are *specified*, not *guessed*.
>
> Portfolio Project #6 (the third and final **front-end flex**, after Creeper Glory
> = motion/animation and Aurora = 2D GPU shaders; Drift = real-time 3D). Read
> alongside `PRODUCT.md` (brand, users, principles).

---

## 0. The North Star (read this first)

Most "interactive 3D" demos are a flat particle plane that nudges toward the mouse.
Drift is **not that**. The differentiator, in one sentence:

> **It is a genuine 3D volume of thousands of GPU-instanced forms with real spring
> physics — the cursor is unprojected into 3D space and acts as a force field that
> parts the crowd and lets it settle back — all seen through depth-of-field bokeh
> and fog, so it reads as actual depth you can fall into, not a flat picture.**

Everything else (the UI, scenes, export) orbits that core. If a tradeoff ever
threatens the **feeling to protect**, protect the feeling:

> **Weightless and dreamlike — like drifting through a lucid dream. Nothing is
> sharp, nothing is heavy, nothing is ever fully still.**

Three things a visitor must remember:

1. **It has depth.** Real parallax + bokeh: near forms blur, far forms blur, a band
   in the middle is crisp. Moving reveals genuine spatial layering, not a 2D plane.
2. **It responds to you.** The cursor parts the field like a hand through water;
   forms scatter on approach and *spring* back when you leave. Tactile and alive.
3. **It drifts.** Even untouched, everything floats on slow noise; the camera sways
   gently. Dreamlike, never static.

---

## 1. Goal & Scope

A single-page, single-purpose web app:

- A full-bleed react-three-fiber 3D scene: a deep field of **instanced** glowing
  forms in fog, at 60fps on desktop.
- **Cursor-as-current**: the pointer is unprojected to a 3D point each frame and
  applies a repel / attract / swirl force; forms integrate velocity + spring back home.
- **Atmosphere**: depth-of-field bokeh, bloom glow, film grain, vignette — the dream look.
- A set of named **Scenes** ("Currents") — each a different form, count, palette, fog,
  and motion personality — plus a **Randomize** that discovers a tasteful new dreamscape.
- A floating, barely-there **glass control panel** to tune the field in real time.
- **Export**: a high-res **poster PNG** of the current frame, and a **shareable
  permalink** that encodes the exact dreamscape (scene + seed + params).
- Fully responsive (panel → bottom sheet on mobile; lower instance count + lighter
  effects on small/low-power devices), accessible (WCAG AA, keyboard, reduced-motion),
  graceful no-WebGL fallback, and deployable on Vercel with zero config.

**Out of scope for v1** (see §15 stretch): accounts, saved galleries, video/loop
export, audio reactivity, multiple simultaneous form types, VR.

---

## 2. Tech Stack (decided)

| Layer | Choice | Reason |
|-------|--------|--------|
| Build tool | **Vite** | Fast, tiny output, matches portfolio convention |
| Framework | **React 18** (JS, not TS) | Consistent with Creeper Glory + Aurora; keep it simple |
| 3D | **three** + **@react-three/fiber** | Declarative Three.js in React; this is the project's whole point (the 3D flex). |
| 3D helpers | **@react-three/drei** | `<Float>`, `<AdaptiveDpr>`, `<PerformanceMonitor>`, env helpers — saves boilerplate |
| Post FX | **@react-three/postprocessing** + **postprocessing** | DepthOfField + Bloom + Noise + Vignette = the dream look in ~15 lines |
| Styling | **Tailwind CSS** | Utility-first; the chrome is minimal, the 3D does the spectacle |
| State | **Zustand** | One small store for params + actions + URL sync; hot values via a ref (no re-renders) |
| Motion (UI) | **Framer Motion** | Panel reveals, entrance stagger, toasts. (The *scene* animates in `useFrame`, not here.) |
| Icons | **lucide-react** | Dice, download, copy, link, play/pause, maximize, eye |
| Fonts | **Fraunces** (display) + **Hanken Grotesk** (UI) | Distinctive + on-theme; see why below. Deliberately different from Aurora's Instrument Serif + IBM Plex Mono. |

> **Why these fonts:** Fraunces is a soft, high-contrast optical serif with a
> genuinely dreamy italic — it carries the lucid/poetic mood at display sizes.
> Hanken Grotesk is a warm, rounded humanist sans that stays airy and legible in
> the small spaced-caps labels. The pairing is Drift's typographic signature.
> Do **NOT** substitute Inter/Roboto/Arial/Space Grotesk, and do **NOT** reuse
> Aurora's fonts — varied fonts per project is a hard rule (the fastest tell of
> generic AI work). Use Fraunces *italic* for the tagline to set the dream tone.

Install (the builder runs these in §10):

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing zustand framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
```

> **Version note:** install latest stable. `@react-three/postprocessing` must match
> the installed `three`/`postprocessing` majors — if the EffectComposer throws on
> boot, pin `postprocessing` to the version `@react-three/postprocessing` expects
> (check its peerDeps) rather than fighting it.

---

## 3. Design Language

**Aesthetic direction:** *lucid dream / weightless dusk.* Unlike Aurora's near-black
observatory, Drift's base is a **deep, colorful twilight** (indigo → plum → soft
rose, or teal → aqua, depending on Scene) with luminous fog and softly glowing forms.
The 3D scene IS the color; the chrome is the lightest possible frosted glass that
floats over it. A **dynamic accent** samples the current Scene's glow color, so the
UI subtly recolors as you change dreamscapes (same trick as Aurora's `--accent`).

### 3.1 Color tokens (`tailwind.config.js` → `theme.extend.colors`)

```js
// Chrome tokens only — the scene's color comes from Three materials/fog (§7.2).
veil: {
  900: '#0A0813',   // deepest UI shadow / scrim behind panel
  800: '#100D1C',   // panel base (used at ~60% alpha over the canvas)
  700: '#181426',   // raised surface
  600: '#241E38',   // border / hairline base
},
haze: {
  400: '#8A85A6',   // muted label text
  200: '#C3BFD6',   // secondary text
  50:  '#F1EFF8',   // primary text on dark
},
// `accent` is NOT fixed — driven at runtime from the active Scene's glow color via
// CSS variable `--accent` (see §7.4). Tailwind keeps a soft fallback:
accent: '#C9A8FF',
```

- **Backgrounds:** glass panels = `bg-veil-800/55` + `backdrop-blur-2xl` + `border
  border-white/[0.07]`, generous rounding (`rounded-2xl`), soft shadow. Lighter and
  airier than Aurora's tight instrument chrome — this is a dream, not an instrument.
- **Text:** haze scale. Labels are Hanken Grotesk, uppercase, tracked-wide
  (`tracking-[0.16em]`), `text-haze-400`, ~11px. Numbers/readouts in `--accent`.
- **Accent:** `var(--accent)` for active states, focus rings, slider fill, value
  readouts. Recomputed whenever the Scene/palette changes.
- **Grain:** provided by the post-processing `Noise` effect inside the scene (§5),
  NOT a separate CSS overlay — keep one grain source so it never double-stacks.

### 3.2 Typography scale

| Use | Font | Style |
|-----|------|-------|
| Wordmark "Drift" | Fraunces | clamp(2rem,5vw,3.25rem), weight ~340, optical, tight tracking |
| Tagline | Fraunces *italic* | 1rem–1.125rem, haze-200 |
| Section labels ("FIELD","FORCE","ATMOSPHERE") | Hanken Grotesk | 11px, uppercase, letter-spacing 0.16em, haze-400 |
| Value readouts (numbers) | Hanken Grotesk | 12–13px, accent color, tabular-nums |
| Scene names | Hanken Grotesk | 12px, medium |

Load via Google Fonts `<link>` in `index.html` (Fraunces + Hanken Grotesk,
`display=swap`).

### 3.3 Layout — the dream

- **Canvas**: `position:fixed; inset:0; z-0` — the full-bleed scene behind everything.
- **Top-left**: `Wordmark` "Drift" + italic tagline. Fades/staggers in on load.
- **Top-right**: `Readout` — quiet telemetry: Scene name, FPS, instance count, seed
  (short hex). Airy, low-opacity, *not* a dense instrument cluster — it whispers.
- **Control panel**: floating frosted-glass card. **Desktop:** docked bottom-left or
  bottom-right, ~360–400px wide, asymmetric (break the grid — never center it).
  **Mobile:** a draggable/expandable **bottom sheet**.
- **Action bar**: Randomize · Pause · Fullscreen · Hide chrome · Export. Slim, in the
  panel header or floating. Pressing `H` hides ALL chrome so the dream is uninterrupted.
- **Composition rule:** the field is the hero; let it bleed past the edges. The panel
  is a soft, low-contrast object in one corner — it should feel like it's *floating in*
  the dream, not bolted on top of it.

---

## 4. The Drift Field — the heart of Drift (REFERENCE CODE)

This is the most important section. The builder should use this almost verbatim,
tuning constants to taste. It is the GPU-instanced field + cursor force + spring
physics + autonomous drift. A weaker model would invent this badly; here it is, complete.

### 4.1 Technique

1. **One `InstancedMesh`** holds up to `MAX` instances (e.g. 2600). We only *render*
   `count` of them (set `mesh.count = activeCount`) so density is a live slider.
2. Each instance has CPU-side arrays: `home` (rest position), `pos`, `vel`, `phase`
   (for autonomous drift), `scale`, `spin`. Seed-driven so a seed reproduces a field.
3. Every frame in `useFrame`:
   - **Unproject the pointer** to a 3D point on the `z=0` plane via a raycaster.
   - For each instance: apply a **spring** toward `home`, a slow **autonomous drift**,
     and the **cursor force** (repel / attract / swirl) if within `forceRadius`.
   - Integrate velocity (with frame-rate-correct damping), update position, write the
     instance matrix.
4. **Glow** comes from emissive material + the Bloom pass (§5); per-instance color
   variation via `setColorAt` gives the field richness.
5. Hot params are read from a **ref** (`paramsRef.current`), never React state, so the
   loop never triggers re-renders (critical for 60fps — same pattern as Aurora).

### 4.2 Seedable RNG + geometry per Scene (`src/three/field.js`)

```js
// Deterministic RNG so a seed reproduces a dreamscape (mulberry32).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

import * as THREE from 'three';
// One small geometry per Scene "form". Keep poly counts low — there are thousands.
export function geometryFor(form) {
  switch (form) {
    case 'shard':   return new THREE.TetrahedronGeometry(0.13);
    case 'petal':   return new THREE.SphereGeometry(0.11, 8, 6);   // scaled flat in §4.3
    case 'orb':     return new THREE.IcosahedronGeometry(0.12, 1);
    case 'lantern': return new THREE.BoxGeometry(0.16, 0.22, 0.16);
    case 'mote':    return new THREE.SphereGeometry(0.06, 6, 5);
    case 'fish':    return new THREE.ConeGeometry(0.07, 0.3, 6);   // elongated
    default:        return new THREE.IcosahedronGeometry(0.12, 1);
  }
}
```

### 4.3 The field component (`src/three/DriftField.jsx`) — reference implementation

```jsx
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, geometryFor } from './field';

const MAX = 2600;                       // hard cap on instances
const dummy = new THREE.Object3D();
const a = new THREE.Vector3();          // scratch
const pointer3D = new THREE.Vector3();
const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // facing camera
const raycaster = new THREE.Raycaster();

export function DriftField({ paramsRef, scene, reducedMotion }) {
  const meshRef = useRef();
  const { camera, size } = useThree();

  // geometry swaps when the Scene's form changes
  const geometry = useMemo(() => geometryFor(scene.form), [scene.form]);

  // material: emissive so Bloom makes it glow; per-instance color set below
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: new THREE.Color(scene.glow),
      emissiveIntensity: scene.emissive ?? 1.4,
      roughness: 0.55, metalness: 0.0,
      transparent: true, opacity: 0.96,
    }),
    [scene.glow, scene.emissive]
  );

  // per-instance buffers, regenerated when seed / spread / form change
  const data = useMemo(() => {
    const rnd = mulberry32(scene.seed);
    const home = new Float32Array(MAX * 3);
    const pos  = new Float32Array(MAX * 3);
    const vel  = new Float32Array(MAX * 3);
    const phase = new Float32Array(MAX);
    const scale = new Float32Array(MAX);
    const spin  = new Float32Array(MAX);
    const S = scene.spread ?? 9;        // half-extent of the volume
    for (let i = 0; i < MAX; i++) {
      const x = (rnd() - 0.5) * 2 * S;
      const y = (rnd() - 0.5) * 2 * S * 0.7;
      const z = (rnd() - 0.5) * 2 * S * 0.9;   // real depth → parallax + bokeh
      home[i*3] = x; home[i*3+1] = y; home[i*3+2] = z;
      pos[i*3]  = x; pos[i*3+1]  = y; pos[i*3+2]  = z;
      phase[i]  = rnd() * Math.PI * 2;
      scale[i]  = 0.6 + rnd() * 0.9;
      spin[i]   = (rnd() - 0.5) * 0.6;
    }
    return { home, pos, vel, phase, scale, spin };
  }, [scene.seed, scene.spread, scene.form]);

  // per-instance color: tint around the Scene glow for richness (run once per scene)
  const colored = useRef(null);
  useFrame(() => {
    const mesh = meshRef.current;
    if (mesh && colored.current !== scene.seed) {
      const base = new THREE.Color(scene.glow);
      const c = new THREE.Color();
      const rnd = mulberry32(scene.seed ^ 0x9e3779b9);
      for (let i = 0; i < MAX; i++) {
        c.copy(base).offsetHSL((rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.25);
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      colored.current = scene.seed;
    }
  });

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = paramsRef.current;
    const dt = Math.min(delta, 1 / 30);          // clamp big frames (tab refocus)
    const t = state.clock.elapsedTime;

    // pointer → 3D point on z=0 plane (the "current")
    raycaster.setFromCamera(state.pointer, camera);
    const hit = raycaster.ray.intersectPlane(planeZ0, pointer3D);
    const hasPointer = !!hit && !reducedMotion;

    const k = 2.4;                                // spring stiffness toward home
    const damp = Math.pow(0.86, dt * 60);         // frame-rate-correct damping
    const { home, pos, vel, phase, scale, spin } = data;
    const n = Math.min(p.count, MAX);

    for (let i = 0; i < n; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;

      // spring back toward home
      vel[ix] += (home[ix] - pos[ix]) * k * dt;
      vel[iy] += (home[iy] - pos[iy]) * k * dt;
      vel[iz] += (home[iz] - pos[iz]) * k * dt;

      // slow autonomous drift (so it's alive even untouched)
      const ph = phase[i];
      const fl = p.flow * 0.9;
      vel[ix] += Math.sin(t * 0.18 + ph) * 0.018 * fl * dt * 60;
      vel[iy] += Math.cos(t * 0.15 + ph * 1.3) * 0.020 * fl * dt * 60;
      vel[iz] += Math.sin(t * 0.12 + ph * 0.7) * 0.014 * fl * dt * 60;

      // cursor force
      if (hasPointer) {
        a.set(pos[ix] - pointer3D.x, pos[iy] - pointer3D.y, pos[iz] - pointer3D.z);
        const d = a.length();
        if (d < p.forceRadius && d > 1e-4) {
          const fall = 1 - d / p.forceRadius;          // 0..1, strongest up close
          const mag = fall * fall * p.forceStrength * dt * 60;
          a.multiplyScalar(1 / d);                     // normalize
          if (p.forceMode === 'repel') {
            vel[ix] += a.x * mag; vel[iy] += a.y * mag; vel[iz] += a.z * mag;
          } else if (p.forceMode === 'attract') {
            vel[ix] -= a.x * mag; vel[iy] -= a.y * mag; vel[iz] -= a.z * mag;
          } else { // swirl — tangential in the XY plane
            vel[ix] += -a.y * mag; vel[iy] += a.x * mag; vel[iz] += a.z * mag * 0.2;
          }
        }
      }

      // integrate + damp
      vel[ix] *= damp; vel[iy] *= damp; vel[iz] *= damp;
      pos[ix] += vel[ix] * dt; pos[iy] += vel[iy] * dt; pos[iz] += vel[iz] * dt;

      // write matrix
      dummy.position.set(pos[ix], pos[iy], pos[iz]);
      dummy.rotation.set(t * spin[i] * 0.2, t * spin[i] * 0.3 + ph, 0);
      const s = scale[i] * (scene.scale ?? 1);
      dummy.scale.set(s, scene.form === 'petal' ? s * 0.35 : s, s); // flatten petals
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = n;                       // render only the active density
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX]}
      frustumCulled={false}
    />
  );
}
```

> **Builder notes:**
> - Everything above is complete and self-consistent. Tune `k`, `damp`, the drift
>   magnitudes, `MAX`, and `spread` only after it renders and feels right.
> - `dt * 60` terms convert per-frame tuning to per-second so motion is stable across
>   refresh rates. Keep the `Math.min(delta, 1/30)` clamp — it stops the field
>   exploding when the tab is refocused after being hidden.
> - On reduced-motion (`reducedMotion === true`), the cursor force is disabled and
>   `flow` should be forced to 0 by the store, so the field renders a calm static
>   dreamscape (still beautiful — see §13).

---

## 5. Atmosphere, Camera & Post-Processing (REFERENCE CODE)

The second hard system: the dream *look*. Fog + soft lights for form, then a
post-processing stack for bokeh, glow, grain, and vignette. This is the single
biggest "dream" tell — do not skip the DepthOfField pass.

### 5.1 Scene atmosphere + lights (inside `<Canvas>`, e.g. in `DriftScene.jsx`)

```jsx
// background + exponential fog tint the whole volume; lights give the forms shape.
<color attach="background" args={[scene.bg]} />
<fogExp2 attach="fog" args={[scene.fog, paramsRef.current.haze]} />
<ambientLight intensity={0.7} />
<directionalLight position={[3, 4, 2]} intensity={0.6} color={scene.glow} />
<pointLight position={[-4, -2, 3]} intensity={0.5} color={scene.bg} />
```

> Fog density (`haze`) is a live slider — higher haze fades distant forms into the
> background color, deepening the sense of depth. Set fog color slightly lighter than
> the background so the field dissolves into mist, not into a hard edge.

### 5.2 Post-processing (`src/three/Atmosphere.jsx`)

```jsx
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function Atmosphere({ paramsRef }) {
  const p = paramsRef.current;
  return (
    <EffectComposer multisampling={0}>
      {/* THE dream-maker: near + far blur, a crisp band in the middle */}
      <DepthOfField
        focusDistance={p.focus}      // 0..1 along camera range; ~0.012 keeps mid sharp
        focalLength={0.025}
        bokehScale={p.bokeh}         // 3..8; higher = creamier
      />
      <Bloom
        intensity={p.bloom}          // 0.4..1.6
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}
```

> **Builder notes:**
> - `DepthOfField` props differ slightly across `@react-three/postprocessing`
>   versions. If `focusDistance` does nothing, the installed version may expect
>   `target` (a world-space `[x,y,z]`) or `worldFocusDistance` instead — read the
>   installed package's type defs and adapt. The intent is fixed: **a soft-focus
>   band in the mid-depth with creamy bokeh near and far.**
> - DOF is the most expensive pass. On mobile / low-power (§14), drop it and keep
>   only Bloom + Vignette; the scene still reads as dreamy.

### 5.3 Camera rig — slow sway + pointer parallax (`src/three/CameraRig.jsx`)

```jsx
import { useFrame } from '@react-three/fiber';

export function CameraRig({ paramsRef }) {
  useFrame((state, delta) => {
    const p = paramsRef.current;
    const t = state.clock.elapsedTime;
    const sway = p.drift;                                  // camera sway amount
    const tx = Math.sin(t * 0.10) * 0.8 * sway + state.pointer.x * 1.2 * sway;
    const ty = Math.cos(t * 0.13) * 0.5 * sway + state.pointer.y * 0.8 * sway;
    const lerp = 1 - Math.pow(0.9, delta * 60);            // smooth follow
    state.camera.position.x += (tx - state.camera.position.x) * lerp;
    state.camera.position.y += (ty - state.camera.position.y) * lerp;
    state.camera.position.z += (12 - state.camera.position.z) * lerp; // hold distance
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
```

> Camera starts at `[0,0,12]`, fov ~50. On reduced-motion, the store forces
> `drift = 0` so the camera holds still (parallax off).

---

## 6. Component Breakdown (build order in §11)

Create under `src/components/` (UI) and `src/three/` (scene). Each is small and focused.

| # | Component | Responsibility |
|---|-----------|----------------|
| 1 | `three/DriftScene.jsx` | The `<Canvas>`: gl opts, camera, fog/lights (§5.1), mounts `DriftField` + `CameraRig` + `Atmosphere`. |
| 2 | `three/DriftField.jsx` | The instanced field + cursor force + spring physics + autonomous drift (§4). |
| 3 | `three/CameraRig.jsx` | Slow camera sway + pointer parallax (§5.3). |
| 4 | `three/Atmosphere.jsx` | EffectComposer: DOF + Bloom + Noise + Vignette (§5.2). |
| 5 | `three/field.js` | `mulberry32`, `geometryFor` (§4.2). |
| 6 | `components/Wordmark.jsx` | "Drift" + italic tagline, staggered entrance. |
| 7 | `components/Readout.jsx` | Quiet telemetry: Scene · FPS · count · seed. Reads FPS from a shared ref. |
| 8 | `components/Slider.jsx` | Core control: labeled accessible range, accent fill, value readout. Native `<input type=range>` styled. |
| 9 | `components/Segmented.jsx` | Segmented toggle for Force mode (Repel / Attract / Swirl). |
| 10 | `components/ControlGroup.jsx` | Titled group wrapper ("FIELD" / "FORCE" / "ATMOSPHERE"). |
| 11 | `components/SceneChips.jsx` | Row of named Scenes ("Currents"); click → `morphTo(scene)`. Active chip highlighted; sets `--accent`. |
| 12 | `components/ControlPanel.jsx` | Assembles groups + chips. Desktop card / mobile bottom sheet. Collapsible. |
| 13 | `components/ActionBar.jsx` | Randomize · Pause · Fullscreen · Hide chrome · Export (lucide icons, tooltips, keyboard shortcuts). |
| 14 | `components/ExportDialog.jsx` | Modal: PNG size picker + download, "Copy link". Framer Motion. |
| 15 | `components/Toast.jsx` | Transient confirmations ("Link copied", "Saved drift-….png"). |
| 16 | `components/NoWebGL.jsx` | Fallback poster + note when WebGL is unavailable (§13). |

---

## 7. State, Parameters & Systems

### 7.1 Parameter model (`store/useDriftStore.js`, Zustand)

The store holds params **and** mirrors hot values into a `paramsRef` the `useFrame`
loops read (so dragging a slider doesn't re-render the React tree). Pattern:
`set(param, value)` updates both the store (for UI) and `paramsRef.current` (for the loop).

| Param | Range | Default | Maps to | UI group |
|-------|-------|---------|---------|----------|
| `count` | 200–2600 (int) | 1400 | `mesh.count` | FIELD |
| `flow` | 0–2 | 0.7 | autonomous drift magnitude | FIELD |
| `drift` | 0–2 | 0.8 | camera sway (§5.3) | FIELD |
| `forceMode` | repel\|attract\|swirl | 'repel' | cursor force kind | FORCE |
| `forceRadius` | 1–10 | 4.5 | force reach (world units) | FORCE |
| `forceStrength` | 0–4 | 1.8 | force magnitude | FORCE |
| `haze` | 0.005–0.12 | 0.045 | `fogExp2` density | ATMOSPHERE |
| `focus` | 0–0.05 | 0.012 | DOF focus distance | ATMOSPHERE |
| `bokeh` | 1–9 | 5 | DOF bokeh scale | ATMOSPHERE |
| `bloom` | 0.2–1.8 | 0.9 | Bloom intensity | ATMOSPHERE |
| `seed` | int | random | field RNG | (Randomize) |
| `scene` | object | 'Murmuration' | form/palette/spread/etc | (Scenes) |
| `paused` | bool | false | freeze `useFrame` updates | (ActionBar) |

Store actions: `set(param, value)`, `applyScene(name)`, `randomize()`,
`morphTo(targetParams)`, `togglePause()`, `loadFromUrl()`, `toUrl()`,
`setReducedMotion(bool)` (forces `flow`/`drift` to 0 and disables cursor force).

> **Pause:** when `paused`, the `useFrame` loops `return` early after one final write,
> so the field freezes but stays rendered (and remains exportable).

### 7.2 Scenes — the named dreamscapes ("Currents", `lib/scenes.js`)

Each Scene = `{ name, form, bg, fog, glow, spread, scale, emissive }` + motion/atmosphere
overrides applied to the params. These are **starting points** — tune after it renders.
Ship **at least 6**:

| Name | Mood | form | bg / fog / glow | overrides |
|------|------|------|-----------------|-----------|
| **Murmuration** | cool starlings, vast | `shard` | bg `#0A0B1A` / fog `#141832` / glow `#9FC7FF` | count 1800, flow 0.9, forceMode swirl |
| **Petals** | warm dusk, falling petals | `petal` | bg `#1A0E16` / fog `#2A1622` / glow `#FFB4C4` | count 1100, flow 0.5, haze 0.06 |
| **Orbits** | deep space, slow rings | `orb` | bg `#08091A` / fog `#101430` / glow `#C9A8FF` | count 900, flow 0.35, bloom 1.2 |
| **Lanterns** | amber lights rising in teal mist | `lantern` | bg `#06140F` / fog `#0C2A20` / glow `#FFD18A` | count 800, flow 0.45, bloom 1.4 |
| **Pollen** | bright misty dawn (light scene for contrast) | `mote` | bg `#1B2230` / fog `#33405A` / glow `#FFF2C2` | count 2200, flow 0.8, haze 0.07, bloom 0.6 |
| **Shoal** | aqua, a drifting shoal | `fish` | bg `#04141A` / fog `#0A2C34` / glow `#7FE9D6` | count 1300, flow 0.7, forceMode repel |

> Provide each as a full object so `applyScene` sets form, palette, fog, AND the param
> overrides above in one call. Keep one **light** scene (Pollen) so the set isn't all dark.

### 7.3 Randomize — discover a *tasteful* dreamscape

Not pure chaos. Constrain to ranges known to look good:
- Pick a random `form` from the six; derive a **harmonious palette**: choose a base hue,
  set `glow` bright/saturated, `bg` very dark at the same hue (or complementary),
  `fog` between them. (Use HSL math; never random RGB — that's how it gets ugly.)
- `count` 800–2200, `flow` 0.3–1.0, `forceRadius` 3–6, `forceStrength` 1.2–2.6,
  `haze` 0.03–0.07, `bloom` 0.6–1.3, random `forceMode`.
- New random `seed`.
- Always route through `morphTo` so atmosphere/params **tween** (§7.5); the field
  re-seeds with a brief fade-through (§7.5) rather than hard-cutting.
- Update Readout: Scene → `'Drift'` (custom), fresh hex seed.

### 7.4 Dynamic accent (`--accent`)

Whenever the Scene/palette changes, write the Scene's `glow` color to
`document.documentElement.style.setProperty('--accent', glow)`. The UI (slider fill,
active chip, focus rings, readouts) reads `var(--accent)` and recolors to match the
dreamscape — the same self-recoloring chrome trick that makes Aurora feel cohesive.

### 7.5 Morph / re-seed system (`lib/tween.js`)

`morphTo(target)` lerps every **numeric** param (count, flow, drift, force*, haze,
focus, bokeh, bloom) and each **palette channel** (bg/fog/glow as colors) from current
→ target over ~1.0s with `easeInOutCubic`, writing into `paramsRef` each frame (and
mirroring final values to the store).

Because changing `form`/`seed` rebuilds the instance buffers (a hard cut), handle the
*field* swap with a **fade-through**: tween `material.opacity` 0.96 → 0 over ~0.35s,
swap `scene.form`/`seed` at the trough, then tween back to 0.96 — so forms dissolve
into the fog and re-emerge, never pop. Atmosphere/params keep tweening across the whole
~1.0s. **Reduced motion:** snap instantly (no tween, no fade).

### 7.6 URL state (`lib/urlState.js`)

Encode the full param set (scene name, seed, all numeric params, forceMode) into the
URL hash — compact: round floats to 3 decimals, join with `,`, or base64 a small JSON.
On load, `loadFromUrl()` hydrates the store. "Copy link" writes `location.href` with
current state. Every dreamscape becomes a **permalink** — a strong portfolio detail.

---

## 8. Export System (the "real output")

A 3D scene's honest artifacts are a **poster image** and a **permalink** (there is no
meaningful "CSS export" like Aurora — don't fake one).

### 8.1 Poster PNG (`lib/exportPng.js`)
- The `<Canvas>` must be created with `gl={{ preserveDrawingBuffer: true }}` so the
  drawing buffer can be read after render.
- Capture: grab the r3f `gl` (renderer) + `scene` + `camera` (expose them via a ref
  set in an `onCreated` handler on `<Canvas>`).
- Size options: **Viewport**, **1920×1080**, **2560×1440**, **3840×2160**.
- For sizes ≠ viewport: `gl.setSize(w, h, false)` + update `camera.aspect` +
  `camera.updateProjectionMatrix()`, force `gl.render(scene, camera)` (and re-run the
  EffectComposer render if effects are composer-driven), then
  `gl.domElement.toBlob(cb, 'image/png')` → download, then **restore** original size /
  aspect. Wrap in try/finally so a failure always restores.
- Filename: `drift-${sceneName}-${seedHex}.png`.

> If reading post-processed pixels at arbitrary sizes proves flaky in the installed
> postprocessing version, fall back to exporting the **viewport** size only (always
> reliable) and offer a "render at 2×" via temporary `dpr` bump. A reliable viewport
> PNG beats a broken 4K path — note it in the README and move on.

### 8.2 Share link
- "Copy link" → `urlState.toUrl()` → clipboard → `Toast`.

---

## 9. File / Folder Structure

```
drift/
├── PLAN.md                  ← this file
├── PRODUCT.md               ← brand / users / principles
├── README.md                ← run + deploy (builder writes at the end)
├── index.html               ← Google Fonts links, root div, meta/OG
├── package.json
├── vite.config.js           ← base '/' (Vercel)
├── tailwind.config.js       ← color tokens (§3.1), font families
├── postcss.config.js
├── public/
│   ├── favicon.svg          ← a small drifting-dot mark
│   └── og.png               ← social preview (optional, stretch)
└── src/
    ├── main.jsx
    ├── App.jsx              ← assembles DriftScene + Wordmark + Readout + ControlPanel + ActionBar
    ├── index.css           ← Tailwind directives, font faces, base, range-input + scrollbar styling
    ├── store/
    │   └── useDriftStore.js
    ├── three/
    │   ├── DriftScene.jsx   ← the <Canvas> + fog/lights (§5.1)
    │   ├── DriftField.jsx   ← the instanced physics field (§4)
    │   ├── CameraRig.jsx    ← camera sway + parallax (§5.3)
    │   ├── Atmosphere.jsx   ← post-processing stack (§5.2)
    │   └── field.js         ← mulberry32 + geometryFor (§4.2)
    ├── lib/
    │   ├── scenes.js        ← the 6 Scenes + palette helpers
    │   ├── tween.js         ← morphTo / fade-through / easing
    │   ├── exportPng.js
    │   └── urlState.js
    ├── hooks/
    │   ├── usePrefersReducedMotion.js
    │   └── useFpsRef.js     ← shared FPS counter for the Readout
    └── components/
        ├── Wordmark.jsx
        ├── Readout.jsx
        ├── Slider.jsx
        ├── Segmented.jsx
        ├── ControlGroup.jsx
        ├── SceneChips.jsx
        ├── ControlPanel.jsx
        ├── ActionBar.jsx
        ├── ExportDialog.jsx
        ├── Toast.jsx
        └── NoWebGL.jsx
```

---

## 10. Setup Commands (builder runs first)

```bash
cd "drift"
npm create vite@latest . -- --template react   # if folder has only the .md files
npm install
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing zustand framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

Then, in order:
1. Configure `tailwind.config.js` `content` globs + color tokens (§3.1) + font families.
2. Add Tailwind directives + Google Fonts `<link>`s (Fraunces + Hanken Grotesk) +
   range-input/scrollbar styling to `index.css` / `index.html`.
3. Build in §11 order.
4. Test responsive + reduced-motion + no-WebGL + `npm run build && npm run preview`.

---

## 11. Build Order (do them in this sequence)

> Land the **wow-core** first: a drifting field that reacts to the cursor, before any
> store/UI. Each milestone is a visible, debuggable checkpoint.

1. **Scene boots:** `DriftScene.jsx` with `<Canvas camera={{position:[0,0,12], fov:50}}
   gl={{preserveDrawingBuffer:true}}>`, fog + lights (§5.1), a single test
   `InstancedMesh` of ~1000 forms at random positions. Forms visible on screen.
2. **The field lives:** `field.js` + `DriftField.jsx` (§4) — autonomous drift + spring
   physics. It breathes/floats at 60fps with NO cursor yet.
3. **Cursor as current:** add pointer unprojection + repel force. Moving the mouse parts
   the field and it springs back. *This is the magic — confirm it feels tactile.*
4. **Atmosphere:** `Atmosphere.jsx` (§5.2) DOF + Bloom + Noise + Vignette, and
   `CameraRig.jsx` (§5.3) sway/parallax. Now it looks like a dream.
5. **Store:** `useDriftStore.js` + `paramsRef` pattern. Field/atmosphere/camera read
   params via the ref. Hard-code defaults, verify nothing re-renders on a fake slider.
6. **Scenes:** `scenes.js` (6 Scenes) + `SceneChips.jsx` + `applyScene`. Switching
   changes form/palette/fog. Set `--accent` on change (§7.4).
7. **Controls:** `Slider.jsx`, `Segmented.jsx`, `ControlGroup.jsx`, `ControlPanel.jsx`
   wired to the store (FIELD / FORCE / ATMOSPHERE groups). All params tunable live.
8. **Morph + fade-through:** `tween.js`; scene/randomize route through `morphTo` +
   field fade-through (§7.5).
9. **Randomize:** `randomize()` (tasteful, §7.3) + ActionBar dice + keyboard `R`.
10. **Chrome:** `Wordmark.jsx`, `Readout.jsx` (+ `useFpsRef`), entrance stagger.
11. **Actions:** `ActionBar.jsx` (Pause, Fullscreen, Hide chrome, Export) + shortcuts
    `R / Space / F / H / E` and `1–6` for Scenes.
12. **Export:** `exportPng.js`, `ExportDialog.jsx`, `Toast.jsx`; poster PNG + sizes.
13. **URL state:** `urlState.js` + `loadFromUrl` on mount + "Copy link".
14. **Responsive:** desktop card vs mobile bottom sheet (`md:` breakpoint); lower
    `count` cap + lighter effects on small screens.
15. **A11y + reduced-motion + fallback:** `usePrefersReducedMotion` wired to
    `setReducedMotion`; `NoWebGL.jsx` fallback.
16. **Polish pass:** favicon, entrance animations, tune Scene palettes + physics
    constants, confirm `--accent` recolor, keyboard hints.

---

## 12. Interaction & Motion Spec

- **Page load:** canvas fades up from the Scene bg color (0→1 over ~0.9s). Wordmark +
  italic tagline stagger in (Framer Motion, `staggerChildren 0.08`). Panel slides/fades
  in from its edge ~0.25s later. Readout fades in last.
- **Cursor:** moves the field as a 3D current (repel/attract/swirl). Forms spring back
  when the pointer leaves. Always-on subtle camera parallax toward the pointer.
- **Scene change / Randomize:** atmosphere + params tween ~1.0s; the field dissolves
  through fog and re-emerges (§7.5). Active chip highlights; `--accent` recolors UI.
- **Sliders:** drag updates the scene in real time (no debounce — the loop reads the
  ref). Value readout in accent. Thumb scales on active.
- **Hover:** controls lift hairline border toward `--accent` at low alpha; buttons get
  a soft glow.
- **Keyboard shortcuts:** `R` randomize · `Space` pause/play · `F` fullscreen ·
  `H` hide/show all chrome · `E` export · `1`–`6` jump to a Scene. Show a tiny "?" hint.
- **Reduced motion:** cursor force off, `flow`/`drift` = 0 (static field + still
  camera), morphs snap, DOF may stay (it's static blur, not motion), entrance reduced
  to fades.

---

## 13. Accessibility, Fallback & Robustness

- **WCAG AA:** all UI text ≥ AA contrast on the glass chrome (haze scale satisfies
  this; verify against the *lightest* Scene, Pollen, where the canvas is brightest —
  bump panel scrim alpha if needed).
- **Keyboard:** every control reachable/operable; native range inputs; visible focus
  rings in `--accent`. Buttons have `aria-label`. Segmented control is a proper
  radiogroup. Dialog traps focus + `Esc` closes.
- **The canvas is decorative:** `aria-hidden` on the canvas; the experience is conveyed
  by the controls, which are fully labeled.
- **Reduced motion:** `usePrefersReducedMotion` → `setReducedMotion(true)` (see §12).
- **No-WebGL fallback:** if the WebGL context can't be created (wrap `<Canvas>` in an
  error boundary, or check `document.createElement('canvas').getContext('webgl')`),
  render `NoWebGL.jsx`: a tasteful static CSS scene (a radial-gradient dusk + a few
  blurred glowing dots) + a small note "WebGL unavailable — showing a still dream."
- **WebGL context loss:** listen for `webglcontextlost`, prevent default, and show a
  "tap to restore" prompt that re-mounts the Canvas.
- **Color-meaning:** never rely on color alone for state; chips/buttons also use text +
  active outline.

---

## 14. Performance Targets

- **60fps desktop** at default count (1400). The per-instance JS loop is the budget —
  keep `MAX` ≤ 2600; if a device struggles, the count slider + `<PerformanceMonitor>`
  (drei) should auto-drop count and disable DOF.
- **DPR capped:** `<Canvas dpr={[1, 2]}>`; use drei `<AdaptiveDpr pixelated={false} />`.
- **Mobile:** default count ~600, DOF off, bokeh low — still dreamy, stays smooth.
- **Pause when tab hidden** (r3f does this with `frameloop`, but verify) and freeze on
  `paused`.
- **Single instanced draw call** for the field; emissive + Bloom for glow (no per-form
  lights).
- **Lighthouse:** Performance ≥ 85 (3D + post-processing is genuinely heavier than
  Aurora's single shader — be honest; do not claim 90 if it doesn't hit it),
  Accessibility ≥ 95. Fonts `display=swap`. Lazy-mount the EffectComposer after first paint.
- UI animates only `transform`/`opacity`.

---

## 15. Stretch Goals (only after Definition of Done)

- **Loop export:** record a seamless WebM with `MediaRecorder` on the canvas stream.
- **More forces:** a "vortex" or "gravity well" mode; click to spawn a ripple impulse.
- **Saved gallery:** localStorage of favorite dreamscapes, thumbnail grid.
- **Audio-reactive:** mic/track input modulates `flow`/`bloom` (with permission + toggle).
- **More forms:** rings, ribbons (instanced curves), text that shatters into the field.
- **Auto OG image:** generate `og.png` from a signature dreamscape.
- **Day/night chrome:** a light "gallery" UI theme vs the default dusk.

---

## 16. Copy / Content (ready-to-use)

- **Wordmark:** `Drift`
- **Tagline:** *"A dream you can move through."*
- **Readout labels:** `SCENE` · `FPS` · `FORMS` · `SEED`
- **Group titles:** `FIELD` · `FORCE` · `ATMOSPHERE`
- **Slider labels:** Density · Flow · Camera Drift · Reach · Strength · Haze · Focus ·
  Bokeh · Bloom
- **Force modes:** Repel · Attract · Swirl
- **Scene names:** Murmuration · Petals · Orbits · Lanterns · Pollen · Shoal
- **Action tooltips:** "Randomize (R)" · "Pause (Space)" · "Fullscreen (F)" ·
  "Hide UI (H)" · "Export (E)"
- **Export dialog:** title "Export this dream" · "Download PNG" · "Copy link" · size
  labels "Viewport · 1080p · 1440p · 4K"
- **Toasts:** "Link copied" · "Saved drift-….png"
- **No-WebGL note:** "WebGL unavailable — showing a still dream."
- **Footer (tiny, bottom corner):** "Built with React · Vite · three.js — Portfolio
  Project #6"

---

## 17. Definition of Done

- [ ] Full-bleed 3D field of instanced forms renders and **drifts** at ~60fps desktop.
- [ ] Cursor unprojects to 3D and **parts the field**; forms **spring back** (repel /
      attract / swirl modes all work).
- [ ] Depth-of-field bokeh + Bloom + grain + vignette give the dream look (matches §5).
- [ ] Camera sway + pointer parallax produce real, readable depth.
- [ ] All §7.1 params tunable via sliders/segmented, updating the scene live (no jank).
- [ ] ≥ 6 named Scenes; selecting one **morphs** (atmosphere tween + field fade-through).
- [ ] Randomize produces a *tasteful* dreamscape (harmonious palette), routed through morph.
- [ ] `--accent` recolors the UI to the active Scene's glow.
- [ ] Readout shows live Scene / FPS / form count / seed.
- [ ] Poster PNG export downloads (viewport guaranteed; higher sizes if reliable).
- [ ] "Copy link" round-trips full state via URL.
- [ ] Fully responsive (375 / 768 / 1440); panel → bottom sheet; lighter on mobile.
- [ ] `prefers-reduced-motion` respected (static field, still camera, snap morphs).
- [ ] No-WebGL fallback renders an intentional still dream; context-loss handled.
- [ ] Keyboard + focus + aria complete; canvas `aria-hidden`.
- [ ] Lighthouse Performance ≥ 85, Accessibility ≥ 95.
- [ ] `npm run build` succeeds; `preview` looks correct.
- [ ] README with run + deploy instructions; deployed to Vercel.

---

## 18. After Done

1. `git init` in `drift/`, push to `github.com/Kellua404/drift` (private by default;
   audit `.gitignore` — no `.env`/secrets — before the first push).
2. Import to Vercel → auto-deploy → grab the live URL.
3. Update root `PORTFOLIO_PLAN.md`: mark the Drift project ✅ Done with repo + live URL.
4. Capture a signature dreamscape screenshot for the eventual portfolio hub.

---

*End of plan. Hand off to the builder model (Sonnet). Follow §11 build order. Build the
cursor-parts-the-field magic (steps 1–3) before any UI. Protect the "weightless and
dreamlike" feeling above all — that is what makes Drift not generic.*
