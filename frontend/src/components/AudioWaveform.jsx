import React from "react";

export function AudioWaveform({ active = false }) {
  return (
    <div className={`waveform-container ${active ? "is-active" : ""}`}>
      <span className="wave-bar bar1" />
      <span className="wave-bar bar2" />
      <span className="wave-bar bar3" />
      <span className="wave-bar bar4" />
      <span className="wave-bar bar5" />
      <span className="wave-bar bar6" />
    </div>
  );
}
