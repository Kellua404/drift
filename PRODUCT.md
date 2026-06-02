# Drift — Product Definition

> The "why and for whom." `PLAN.md` is the "how." When a build decision isn't
> covered by the plan, decide in favor of these principles.

## One-liner

**A dream you can move through** — a real-time 3D field of glowing forms, suspended in
luminous fog, that parts around your cursor like a current and settles back on springs.

## What it actually is

A single-page web app whose canvas is a live react-three-fiber scene: thousands of
GPU-instanced forms with real spring physics, lit by emissive glow + bloom and seen
through depth-of-field bokeh and grain. The cursor is unprojected into 3D space and
acts as a force field. Visitors tune the field (density, flow, force, atmosphere),
switch between named **Scenes** (dreamscapes), then export a high-res poster PNG or a
shareable permalink.

## Who it's for

- **Recruiters / peers** evaluating the portfolio — Drift is the proof of real-time
  **3D / WebGL / interaction** craft, completing the front-end trio (Creeper Glory =
  motion, Aurora = 2D shaders, Drift = 3D).
- **Curious visitors** who will lose a minute just sweeping the cursor through the field.
- **Designers/developers** who want an original, atmospheric hero visual or wallpaper
  poster and are tired of flat particle demos.

## The job it does

> "Make me feel like I'm reaching into a 3D dream — let the world respond to my hand,
> and let me keep a frame of it."

## Brand & personality

- **Mood:** lucid dream; weightless dusk; calm but always alive. Soft-focus, atmospheric.
- **Voice:** quiet, poetic, unhurried. A few words, well chosen. (Aurora reads like
  telemetry; Drift reads like a line of verse.)
- **Visual signature:** deep twilight color from the scene itself, luminous fog, bokeh
  depth, glowing forms, and the lightest floating glass chrome — with a UI accent that
  *recolors itself* from the current dreamscape.
- **Type signature:** Fraunces (display, dreamy italic tagline) + Hanken Grotesk (airy
  UI labels). Deliberately not Aurora's fonts.
- **Anti-brand:** NOT a flat particle-plane "mouse-follower" demo. NOT a hard, neon,
  techy WebGL showcase. No Inter/Roboto, no dense instrument panel, no harsh edges —
  if it feels heavy, sharp, or fully still, it's wrong.

## Design principles (in priority order)

1. **The field is the product.** Chrome stays out of its way; let the dream bleed past
   the edges and fill the screen.
2. **Depth over flatness.** Real 3D volume, parallax, and bokeh — it must read as space
   you could fall into, never a 2D picture.
3. **It responds to you.** The cursor parting the field and the spring-back are the
   soul; protect that tactile feeling above any visual flourish.
4. **Weightless and alive.** Everything drifts on slow motion; transitions dissolve
   through fog, never cut. Nothing is ever fully still (except in reduced-motion).
5. **Discovery is delight.** Randomize and Scene-switching should feel like waking into
   a new dream worth keeping.
6. **Genuinely useful.** The poster PNG and permalink must be real, good, and shippable.
7. **Fast and inclusive.** 60fps desktop, AA accessible, reduced-motion graceful,
   no-WebGL safe.

## Success looks like

- A visitor instinctively sweeps the cursor back and forth, watching the field part
  and settle — and grins.
- A peer's reaction is "wait — that's actual 3D physics running in the browser?" — the
  §0 North Star feeling.
- The exported poster is beautiful enough that someone sets it as a wallpaper.

## Explicit non-goals (v1)

Accounts, cloud saves, galleries, video/loop export, audio reactivity, multiple
simultaneous form types, VR/AR. (Several live in `PLAN.md` §15 as stretch goals.)
Keep v1 small and perfect — one dream, done flawlessly.
