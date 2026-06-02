import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, geometryFor } from './field';

const MAX = 2600;
const dummy = new THREE.Object3D();
const a = new THREE.Vector3();
const pointer3D = new THREE.Vector3();
const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const raycaster = new THREE.Raycaster();

export function DriftField({ paramsRef, scene, reducedMotion }) {
  const meshRef = useRef();
  const { camera } = useThree();

  const geometry = useMemo(() => geometryFor(scene.form), [scene.form]);

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: new THREE.Color(scene.glow),
      emissiveIntensity: scene.emissive ?? 1.4,
      roughness: 0.55,
      metalness: 0.0,
      transparent: true,
      opacity: 0.96,
    }),
    [scene.glow, scene.emissive]
  );

  const data = useMemo(() => {
    const rnd = mulberry32(scene.seed ?? 42);
    const home = new Float32Array(MAX * 3);
    const pos  = new Float32Array(MAX * 3);
    const vel  = new Float32Array(MAX * 3);
    const phase = new Float32Array(MAX);
    const scale = new Float32Array(MAX);
    const spin  = new Float32Array(MAX);
    const S = scene.spread ?? 9;
    for (let i = 0; i < MAX; i++) {
      const x = (rnd() - 0.5) * 2 * S;
      const y = (rnd() - 0.5) * 2 * S * 0.7;
      const z = (rnd() - 0.5) * 2 * S * 0.9;
      home[i*3] = x; home[i*3+1] = y; home[i*3+2] = z;
      pos[i*3]  = x; pos[i*3+1]  = y; pos[i*3+2]  = z;
      phase[i]  = rnd() * Math.PI * 2;
      scale[i]  = 0.6 + rnd() * 0.9;
      spin[i]   = (rnd() - 0.5) * 0.6;
    }
    return { home, pos, vel, phase, scale, spin };
  }, [scene.seed, scene.spread, scene.form]);

  const colored = useRef(null);

  useFrame(() => {
    const mesh = meshRef.current;
    if (mesh && colored.current !== scene.seed) {
      const base = new THREE.Color(scene.glow);
      const c = new THREE.Color();
      const rnd = mulberry32((scene.seed ?? 42) ^ 0x9e3779b9);
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

    // update material opacity for morph fade-through
    if (material.opacity !== (p.morphOpacity ?? 0.96)) {
      material.opacity = p.morphOpacity ?? 0.96;
    }

    if (p.paused) return;

    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;

    raycaster.setFromCamera(state.pointer, camera);
    const hit = raycaster.ray.intersectPlane(planeZ0, pointer3D);
    const hasPointer = !!hit && !reducedMotion;

    const k = 2.4;
    const damp = Math.pow(0.86, dt * 60);
    const { home, pos, vel, phase, scale, spin } = data;
    const n = Math.min(p.count, MAX);

    for (let i = 0; i < n; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;

      vel[ix] += (home[ix] - pos[ix]) * k * dt;
      vel[iy] += (home[iy] - pos[iy]) * k * dt;
      vel[iz] += (home[iz] - pos[iz]) * k * dt;

      const ph = phase[i];
      const fl = (p.flow ?? 0.7) * 0.9;
      if (!reducedMotion) {
        vel[ix] += Math.sin(t * 0.18 + ph) * 0.018 * fl * dt * 60;
        vel[iy] += Math.cos(t * 0.15 + ph * 1.3) * 0.020 * fl * dt * 60;
        vel[iz] += Math.sin(t * 0.12 + ph * 0.7) * 0.014 * fl * dt * 60;
      }

      if (hasPointer) {
        a.set(pos[ix] - pointer3D.x, pos[iy] - pointer3D.y, pos[iz] - pointer3D.z);
        const d = a.length();
        if (d < p.forceRadius && d > 1e-4) {
          const fall = 1 - d / p.forceRadius;
          const mag = fall * fall * p.forceStrength * dt * 60;
          a.multiplyScalar(1 / d);
          if (p.forceMode === 'repel') {
            vel[ix] += a.x * mag; vel[iy] += a.y * mag; vel[iz] += a.z * mag;
          } else if (p.forceMode === 'attract') {
            vel[ix] -= a.x * mag; vel[iy] -= a.y * mag; vel[iz] -= a.z * mag;
          } else {
            vel[ix] += -a.y * mag; vel[iy] += a.x * mag; vel[iz] += a.z * mag * 0.2;
          }
        }
      }

      vel[ix] *= damp; vel[iy] *= damp; vel[iz] *= damp;
      pos[ix] += vel[ix] * dt; pos[iy] += vel[iy] * dt; pos[iz] += vel[iz] * dt;

      dummy.position.set(pos[ix], pos[iy], pos[iz]);
      dummy.rotation.set(t * spin[i] * 0.2, t * spin[i] * 0.3 + ph, 0);
      const s = scale[i] * (scene.scale ?? 1);
      dummy.scale.set(s, scene.form === 'petal' ? s * 0.35 : s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = n;
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
