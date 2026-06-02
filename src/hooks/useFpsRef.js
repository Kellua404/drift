import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function useFpsRef() {
  const fpsRef = useRef(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;
    if (elapsed >= 500) {
      fpsRef.current = Math.round((frameCount.current / elapsed) * 1000);
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return fpsRef;
}
