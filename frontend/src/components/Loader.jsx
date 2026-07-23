export default function Loader({ text = "Thinking..." }) {
  return (
    <div className="loader">
      <div className="loader__dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="loader__text">{text}</p>
    </div>
  );
}
