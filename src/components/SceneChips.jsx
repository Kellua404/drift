import { SCENES } from '../lib/scenes';

export function SceneChips({ activeScene, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="font-hanken text-haze-400 uppercase border-b border-white/[0.06] pb-1.5"
        style={{ fontSize: 10, letterSpacing: '0.2em' }}
      >
        Currents
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SCENES.map((scene, i) => {
          const active = activeScene === scene.name;
          return (
            <button
              key={scene.name}
              onClick={() => onSelect(scene.name)}
              className="px-2.5 py-1 rounded-full font-hanken text-xs transition-all border"
              title={`Switch to ${scene.name} (${i + 1})`}
              style={{
                fontSize: 11,
                background: active ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                color: active ? '#0A0813' : '#C3BFD6',
                borderColor: active ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {scene.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
