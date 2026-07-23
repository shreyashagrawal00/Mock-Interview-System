// A ruled-paper "meter" gauge — the signature element of the results report card.
// Needle rotates from -90deg (score 0) to +90deg (score 10).
export default function ScoreGauge({ score = 0, label = "Overall", size = 200 }) {
  const clamped = Math.max(0, Math.min(10, score));
  const angle = -90 + (clamped / 10) * 180;

  const ticks = Array.from({ length: 11 }, (_, i) => i);

  return (
    <div className="gauge" style={{ width: size }}>
      <svg viewBox="0 0 200 120" className="gauge__svg">
        <path d="M10 110 A90 90 0 0 1 190 110" className="gauge__track" />
        <path
          d="M10 110 A90 90 0 0 1 190 110"
          className="gauge__fill"
          style={{ strokeDasharray: 283, strokeDashoffset: 283 - (clamped / 10) * 283 }}
        />
        {ticks.map((t) => {
          const a = (-90 + (t / 10) * 180) * (Math.PI / 180);
          const x1 = 100 + 78 * Math.sin(a);
          const y1 = 110 - 78 * Math.cos(a);
          const x2 = 100 + 88 * Math.sin(a);
          const y2 = 110 - 88 * Math.cos(a);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} className="gauge__tick" />;
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 110px" }} className="gauge__needle-group">
          <line x1="100" y1="110" x2="100" y2="34" className="gauge__needle" />
        </g>
        <circle cx="100" cy="110" r="6" className="gauge__hub" />
      </svg>
      <div className="gauge__reading">
        <span className="gauge__value">{clamped.toFixed(1)}</span>
        <span className="gauge__max">/10</span>
      </div>
      <div className="gauge__label">{label}</div>
    </div>
  );
}
