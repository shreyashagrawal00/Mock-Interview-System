import React, { useState, useEffect, useRef } from "react";

export function WebcamPreview() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setError("");
        })
        .catch((err) => {
          console.error("Webcam error:", err);
          setError("Camera access denied or unavailable");
          setEnabled(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enabled]);

  return (
    <div className="webcam-card">
      <div className="webcam-header">
        <span>Video Preview</span>
        <button
          type="button"
          className={`btn btn-sm ${enabled ? "btn-secondary" : "btn-outline"}`}
          onClick={() => setEnabled(!enabled)}
        >
          {enabled ? "Cam Off" : "Cam On"}
        </button>
      </div>
      {error && <p className="webcam-error">{error}</p>}
      {enabled ? (
        <video ref={videoRef} autoPlay playsInline muted className="webcam-feed" />
      ) : (
        <div className="webcam-placeholder">
          <span>Camera Disabled</span>
        </div>
      )}
    </div>
  );
}
