# Drift

> *A dream you can move through.*

A real-time 3D field of thousands of GPU-instanced glowing forms suspended in luminous fog. Your cursor moves through the field like a current — forms scatter on approach and spring back when you leave. Portfolio Project #6.

## Running

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build & deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

Deploy to Vercel: import the repo, zero config needed. The `vite.config.js` sets `base: '/'`.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `R` | Randomize dreamscape |
| `Space` | Pause / play |
| `F` | Fullscreen |
| `H` | Hide / show UI |
| `E` | Export PNG |
| `1`–`6` | Switch to a named Scene |

## Tech

React 19 · Vite 5 · three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing · Zustand · Framer Motion · Tailwind CSS
