export function Slider({ label, value, min, max, step = 0.001, onChange, displayValue }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span
          className="font-hanken text-haze-400 uppercase"
          style={{ fontSize: 11, letterSpacing: '0.16em' }}
        >
          {label}
        </span>
        <span
          className="font-hanken tabular-nums"
          style={{ fontSize: 12, color: 'var(--accent)' }}
        >
          {displayValue ?? (typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        aria-label={label}
        style={{ '--pct': `${pct}%` }}
      />
    </div>
  );
}
