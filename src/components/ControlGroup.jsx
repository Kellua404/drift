export function ControlGroup({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="font-hanken text-haze-400 uppercase tracking-widest border-b border-white/[0.06] pb-1.5"
        style={{ fontSize: 10, letterSpacing: '0.2em' }}
      >
        {title}
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}
