import { useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { useDriftStore } from '../store/useDriftStore';
import { DriftField } from './DriftField';
import { CameraRig } from './CameraRig';
import { Atmosphere } from './Atmosphere';
import { TweenRunner } from './TweenRunner';

function SceneContent({ paramsRef, scene, reducedMotion, isMobile, bokeh, bloom, focus, haze, glRef }) {
  return (
    <>
      <color attach="background" args={[scene.bg]} />
      <fogExp2 attach="fog" args={[scene.fog, haze]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={0.6} color={scene.glow} />
      <pointLight position={[-4, -2, 3]} intensity={0.5} color={scene.bg} />
      <DriftField paramsRef={paramsRef} scene={scene} reducedMotion={reducedMotion} />
      <CameraRig paramsRef={paramsRef} />
      <Atmosphere bokeh={bokeh} bloom={bloom} focus={focus} isMobile={isMobile} glRef={glRef} />
      <TweenRunner />
    </>
  );
}

export function DriftScene({ paramsRef, scene, reducedMotion, isMobile, glRef }) {
  const { bokeh, bloom, focus, haze } = useDriftStore();

  const handleCreated = useCallback(({ gl, scene: threeScene, camera }) => {
    if (glRef) glRef.current = { gl, scene: threeScene, camera };
  }, [glRef]);

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      camera={{ position: [0, 0, 12], fov: 50 }}
      gl={{ preserveDrawingBuffer: true, antialias: false }}
      dpr={[1, 2]}
      frameloop="always"
      aria-hidden="true"
      onCreated={handleCreated}
    >
      <AdaptiveDpr pixelated={false} />
      <PerformanceMonitor
        onDecline={() => {
          if (paramsRef.current.count > 600) {
            paramsRef.current.count = Math.max(600, paramsRef.current.count - 200);
          }
        }}
      />
      <SceneContent
        paramsRef={paramsRef}
        scene={scene}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
        bokeh={bokeh}
        bloom={bloom}
        focus={focus}
        haze={haze}
        glRef={glRef}
      />
    </Canvas>
  );
}
