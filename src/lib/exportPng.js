import * as THREE from 'three';

export async function exportPng(glRef, size, sceneName, seed) {
  const { gl, scene: threeScene, camera, composer } = glRef.current;
  if (!gl) return;

  const SIZES = {
    viewport: null,
    '1080p': [1920, 1080],
    '1440p': [2560, 1440],
    '4k': [3840, 2160],
  };

  const dims = SIZES[size];
  const origSize = gl.getSize(new THREE.Vector2()); // logical (CSS) size
  const origPixelRatio = gl.getPixelRatio();
  const origAspect = camera.aspect;

  // Render through the post-processing composer so the export includes bloom,
  // depth-of-field, grain and vignette. Falling back to gl.render would capture
  // only the raw particles with no effects.
  function renderFrame() {
    if (composer) composer.render();
    else gl.render(threeScene, camera);
  }

  try {
    if (dims) {
      const [w, h] = dims;
      gl.setPixelRatio(1); // exact output dimensions, not multiplied by DPR
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (composer) composer.setSize(w, h);
      else gl.setSize(w, h, false);
    }

    renderFrame();

    const blob = await new Promise(resolve => gl.domElement.toBlob(resolve, 'image/png'));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const seedHex = (seed >>> 0).toString(16).padStart(8, '0');
    a.download = `drift-${sceneName.toLowerCase()}-${seedHex}.png`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    if (dims) {
      gl.setPixelRatio(origPixelRatio);
      camera.aspect = origAspect;
      camera.updateProjectionMatrix();
      if (composer) composer.setSize(origSize.x, origSize.y);
      else gl.setSize(origSize.x, origSize.y, false);
      renderFrame(); // restore the on-screen frame at the original size
    }
  }
}
