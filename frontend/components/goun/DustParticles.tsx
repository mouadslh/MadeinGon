"use client";

const COUNT = 20;

function particleStyle(i: number): React.CSSProperties {
  const size = 2 + (i % 3);
  const left = (i * 17 + 7) % 100;
  const delay = (i * 0.31) % 4;
  const duration = 4 + (i % 5);
  return {
    width: size,
    height: size,
    left: `${left}%`,
    bottom: `${(i * 11) % 40}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: 0.35 + (i % 4) * 0.1,
  };
}

export function DustParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]" aria-hidden>
      {Array.from({ length: COUNT }, (_, i) => (
        <span key={i} className="goun-dust-particle" style={particleStyle(i)} />
      ))}
    </div>
  );
}
