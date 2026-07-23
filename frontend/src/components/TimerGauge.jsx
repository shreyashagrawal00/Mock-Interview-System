import React, { useState, useEffect } from "react";

export function TimerGauge({ durationSeconds, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!durationSeconds || durationSeconds <= 0) return;

    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, durationSeconds]);

  if (!durationSeconds || durationSeconds <= 0) return null;

  const percentage = Math.max(0, (timeLeft / durationSeconds) * 100);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 30;

  return (
    <div className={`timer-container ${isWarning ? "timer-warning" : ""}`}>
      <div className="timer-header">
        <span>Interview Question Timer</span>
        <strong>
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </strong>
      </div>
      <div className="timer-bar-bg">
        <div
          className="timer-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
