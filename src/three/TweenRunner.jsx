import { useFrame } from '@react-three/fiber';
import { tweener } from '../lib/tween';

export function TweenRunner() {
  useFrame((_, delta) => {
    tweener.tick(Math.min(delta, 1 / 30));
  });
  return null;
}
