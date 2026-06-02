const NUMERIC_KEYS = ['count','flow','drift','forceRadius','forceStrength','haze','focus','bokeh','bloom','seed'];
const STRING_KEYS = ['forceMode','sceneName'];

export function toUrl(params) {
  const parts = [
    ...NUMERIC_KEYS.map(k => `${k}=${parseFloat(params[k]).toFixed(3)}`),
    ...STRING_KEYS.map(k => `${k}=${encodeURIComponent(params[k] ?? '')}`),
  ];
  const hash = btoa(parts.join('&'));
  return `${window.location.origin}${window.location.pathname}#${hash}`;
}

export function fromUrl() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const decoded = atob(hash);
    const pairs = decoded.split('&');
    const result = {};
    for (const pair of pairs) {
      const eq = pair.indexOf('=');
      if (eq < 0) continue;
      const k = pair.slice(0, eq);
      const v = pair.slice(eq + 1);
      if (NUMERIC_KEYS.includes(k)) result[k] = parseFloat(v);
      else result[k] = decodeURIComponent(v);
    }
    return result;
  } catch {
    return null;
  }
}
