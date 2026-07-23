export default function ScoreBar({ label, value = 0 }) {
  const pct = Math.max(0, Math.min(10, value)) * 10;
  return (
    <div className="scorebar">
      <div className="scorebar__head">
        <span className="scorebar__label">{label}</span>
        <span className="scorebar__value">{value.toFixed(1)}</span>
      </div>
      <div className="scorebar__track">
        <div className="scorebar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
