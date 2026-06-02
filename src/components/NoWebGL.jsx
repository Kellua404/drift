export function NoWebGL() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 40% 60%, #1A1040 0%, #0A0813 60%)',
      }}
    >
      {/* Blurred glowing dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: '30%', left: '20%', size: 80, color: '#9FC7FF' },
          { top: '60%', left: '70%', size: 60, color: '#C9A8FF' },
          { top: '20%', left: '65%', size: 50, color: '#FFB4C4' },
          { top: '70%', left: '30%', size: 40, color: '#7FE9D6' },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: dot.top, left: dot.left,
              width: dot.size, height: dot.size,
              background: dot.color,
              opacity: 0.18,
              filter: 'blur(30px)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-8">
        <h1
          className="font-fraunces text-haze-50 mb-3"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 340 }}
        >
          Drift
        </h1>
        <p className="font-fraunces text-haze-200 italic mb-6" style={{ fontSize: '1rem' }}>
          A dream you can move through.
        </p>
        <p className="font-hanken text-haze-400" style={{ fontSize: 12, letterSpacing: '0.06em' }}>
          WebGL unavailable — showing a still dream.
        </p>
      </div>
    </div>
  );
}
