import { useRef, useEffect, useState } from 'react';
import { useDriftStore } from './store/useDriftStore';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { DriftScene } from './three/DriftScene';
import { Wordmark } from './components/Wordmark';
import { Readout } from './components/Readout';
import { ControlPanel } from './components/ControlPanel';
import { ActionBar } from './components/ActionBar';
import { ExportDialog } from './components/ExportDialog';
import { ToastContainer } from './components/Toast';
import { NoWebGL } from './components/NoWebGL';
import { SCENES } from './lib/scenes';
import { Eye } from 'lucide-react';

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Release the probe context immediately so it doesn't count against the
    // browser's WebGL-context limit (otherwise repeated calls steal the real one).
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const glRef = useRef({ gl: null, scene: null, camera: null });
  const fpsRef = useRef(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const [hasWebGL] = useState(checkWebGL); // lazy initializer → runs exactly once
  const [exportOpen, setExportOpen] = useState(false);

  const reducedMotion = usePrefersReducedMotion();

  const {
    paramsRef, scene, sceneName, seed, count,
    applyScene, randomize, togglePause, toggleUI,
    setReducedMotion, loadFromUrl, uiVisible,
  } = useDriftStore();

  // scene already has seed merged by the store
  const sceneWithSeed = scene?.seed !== undefined ? scene : { ...scene, seed };

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', SCENES[0].glow);
    loadFromUrl();
  }, []);

  useEffect(() => {
    setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    let rafId;
    function tick() {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 500) {
        fpsRef.current = Math.round((frameCount.current / (now - lastTime.current)) * 1000);
        frameCount.current = 0;
        lastTime.current = now;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case 'r': randomize(); break;
        case ' ': e.preventDefault(); togglePause(); break;
        case 'f': {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
          else document.exitFullscreen?.();
          break;
        }
        case 'h': toggleUI(); break;
        case 'e': setExportOpen(true); break;
        case '1': applyScene(SCENES[0].name); break;
        case '2': applyScene(SCENES[1].name); break;
        case '3': applyScene(SCENES[2].name); break;
        case '4': applyScene(SCENES[3].name); break;
        case '5': applyScene(SCENES[4].name); break;
        case '6': applyScene(SCENES[5].name); break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [randomize, togglePause, toggleUI, applyScene]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!hasWebGL) {
    return <NoWebGL />;
  }

  return (
    <>
      <DriftScene
        paramsRef={paramsRef}
        scene={sceneWithSeed}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
        glRef={glRef}
      />

      {uiVisible ? (
        <>
          <Wordmark />
          <Readout fpsRef={fpsRef} sceneName={sceneName} count={count} seed={seed} />
          <ControlPanel isMobile={isMobile} />
          <ActionBar glRef={glRef} onExport={() => setExportOpen(true)} />
        </>
      ) : (
        <button
          onClick={toggleUI}
          title="Show UI (H)"
          aria-label="Show UI"
          className="fixed bottom-6 right-6 z-20 w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 text-haze-400 hover:text-haze-200 hover:border-white/25 transition-all"
          style={{
            background: 'rgba(16,13,28,0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Eye size={14} />
        </button>
      )}

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} glRef={glRef} />
      <ToastContainer />

      <div
        className="fixed bottom-2 left-1/2 -translate-x-1/2 font-hanken text-haze-400 pointer-events-none select-none z-10"
        style={{ fontSize: 10, opacity: 0.3, letterSpacing: '0.06em' }}
      >
        Built with React · Vite · three.js — Portfolio Project #6
      </div>
    </>
  );
}
