import React, { useState, useEffect } from "react";
import Icon from "./Icon";

export function VoiceInterviewer({ text, autoPlay = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      setVoices(avail);
      if (avail.length > 0 && !selectedVoice) {
        // Pick an English voice if possible
        const englishVoice = avail.find((v) => v.lang.startsWith("en")) || avail[0];
        setSelectedVoice(englishVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text && isSupported) {
      speakText();
    }
  }, [text]);

  const speakText = () => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      const vObj = voices.find((v) => v.name === selectedVoice);
      if (vObj) utterance.voice = vObj;
    }
    utterance.rate = rate;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopText = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!isSupported) return null;

  return (
    <div className="voice-interviewer-card">
      <div className="voice-header">
        <div className="voice-title">
          <span className={`audio-pulse-dot ${isPlaying ? "active" : ""}`} />
          <strong>AI Interviewer Voice</strong>
        </div>
        <div className="voice-controls-inline">
          {isPlaying ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={stopText}>
              Pause
            </button>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={speakText}>
              Listen Question
            </button>
          )}
        </div>
      </div>

      <div className="voice-settings">
        {voices.length > 0 && (
          <select
            className="voice-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        )}
        <div className="rate-selector">
          <label>Speed:</label>
          <select
            className="voice-select-sm"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            <option value={0.8}>0.8x</option>
            <option value={1}>1.0x</option>
            <option value={1.2}>1.2x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
