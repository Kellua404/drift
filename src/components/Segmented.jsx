export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="font-hanken text-haze-400 uppercase"
        style={{ fontSize: 11, letterSpacing: '0.16em' }}
      >
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex rounded-lg overflow-hidden border border-white/10"
      >
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className="flex-1 py-1.5 font-hanken text-xs transition-colors relative"
              style={{
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#0A0813' : '#8A85A6',
                fontWeight: active ? 600 : 400,
                fontSize: 11,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
