import { useEffect, useRef } from 'react';
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function Atmosphere({ bokeh, bloom, focus, isMobile, glRef }) {
  const composerRef = useRef();

  // Expose the post-processing composer so the PNG export can render THROUGH it
  // (otherwise the export captures the raw scene with no bloom/DOF/grain/vignette).
  useEffect(() => {
    if (glRef?.current) glRef.current.composer = composerRef.current;
  });

  return (
    <EffectComposer ref={composerRef} multisampling={0}>
      {!isMobile && (
        <DepthOfField
          focusDistance={focus}
          focalLength={0.025}
          bokehScale={bokeh}
        />
      )}
      <Bloom
        intensity={bloom}
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}
