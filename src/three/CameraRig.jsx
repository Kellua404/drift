import { useFrame } from '@react-three/fiber';

export function CameraRig({ paramsRef }) {
  useFrame((state, delta) => {
    const p = paramsRef.current;
    if (p.paused) return;
    const t = state.clock.elapsedTime;
    const sway = p.reducedMotion ? 0 : (p.drift ?? 0.8);
    const tx = Math.sin(t * 0.10) * 0.8 * sway + state.pointer.x * 1.2 * sway;
    const ty = Math.cos(t * 0.13) * 0.5 * sway + state.pointer.y * 0.8 * sway;
    const lerp = 1 - Math.pow(0.9, delta * 60);
    state.camera.position.x += (tx - state.camera.position.x) * lerp;
    state.camera.position.y += (ty - state.camera.position.y) * lerp;
    state.camera.position.z += (12 - state.camera.position.z) * lerp;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
