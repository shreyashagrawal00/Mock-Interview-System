import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import RoleCard from "../components/RoleCard.jsx";
import Loader from "../components/Loader.jsx";

export default function RoleSelect() {
  const [roles, setRoles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Customization Options
  const [mode, setMode] = useState("standard");
  const [level, setLevel] = useState("Fresher / Entry-Level");
  const [questionCount, setQuestionCount] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showCustomCtx, setShowCustomCtx] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const fetchRoles = () => {
    setError("");
    setLoading(true);
    api
      .getRoles()
      .then((data) => setRoles(data?.roles || []))
      .catch((err) => {
        const msg = err.message === "Failed to fetch" 
          ? "Unable to connect to the backend server. If running locally, make sure 'node server.js' is running in the backend folder. If on Render, please wait ~30s for the free server instance to wake up."
          : err.message;
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  async function handleSelect(role) {
    setError("");
    setStarting(true);
    try {
      const data = await api.startSession({
        roleId: role.id,
        mode,
        level: role.level || level,
        totalQuestions: questionCount,
        timerSeconds: mode === "timed" ? (timerSeconds || 120) : 0,
        resumeText,
        jobDescription,
      });
      navigate(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  const filteredRoles = roles.filter((role) => {
    const isFresher =
      role.levelType === "fresher" ||
      (role.level && role.level.toLowerCase().includes("fresher")) ||
      (role.title && role.title.toLowerCase().includes("fresher"));

    const isUpgraded =
      role.levelType === "upgraded" ||
      (role.level && (role.level.toLowerCase().includes("upgraded") || role.level.toLowerCase().includes("senior"))) ||
      (role.title && (role.title.toLowerCase().includes("upgraded") || role.title.toLowerCase().includes("senior")));

    if (activeFilter === "fresher") return isFresher;
    if (activeFilter === "upgraded") return isUpgraded;
    return true;
  });

  return (
    <section className="hero">
      <div className="hero__intro">
        <span className="eyebrow">Interactive AI Interview Simulator</span>
        <h1 className="hero__title">
          Practice like the interview <em>already started.</em>
        </h1>
        <p className="hero__sub">
          Customize your session settings below, pick a role, and practice with real-time AI feedback, voice synthesis, and performance scoring.
        </p>
      </div>

      {loading && <Loader text="Setting up the practice room" />}
      {error && (
        <div className="alert alert-with-action">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={fetchRoles}>
            🔄 Retry Connection
          </button>
        </div>
      )}

      {!loading && (
        <>
          {/* Customization Settings Bar */}
          <div className="card config-panel">
            <h3 className="config-title">⚙️ Session Configuration</h3>
            <div className="config-grid">
              <div className="config-group">
                <label>Interview Mode</label>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="config-select">
                  <option value="standard">🎯 Standard Technical Q&A</option>
                  <option value="timed">⏱️ Timed Pressure Mode</option>
                  <option value="star">⭐ STAR Behavioral Mode</option>
                  <option value="coding">💻 Live Coding Sandbox</option>
                </select>
              </div>

              <div className="config-group">
                <label>Target Seniority</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="config-select">
                  <option value="Fresher / Entry-Level">🌱 Fresher / Entry-Level</option>
                  <option value="Mid-Level Specialist">🚀 Mid-Level Specialist</option>
                  <option value="Senior / Lead Architect">⚡ Senior / Lead Architect</option>
                </select>
              </div>

              <div className="config-group">
                <label>Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="config-select"
                >
                  <option value={3}>3 Questions (Quick Sprint)</option>
                  <option value={5}>5 Questions (Standard Session)</option>
                  <option value={10}>10 Questions (Deep Dive)</option>
                </select>
              </div>

              {mode === "timed" && (
                <div className="config-group">
                  <label>Timer per Question</label>
                  <select
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(Number(e.target.value))}
                    className="config-select"
                  >
                    <option value={60}>60 Seconds (Sprint)</option>
                    <option value={120}>2 Minutes (Standard)</option>
                    <option value={300}>5 Minutes (Thoughtful)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="custom-ctx-toggle">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setShowCustomCtx(!showCustomCtx)}
              >
                {showCustomCtx ? "▲ Hide Resume & Job Description Setup" : "▼ Add Custom Resume or Job Description"}
              </button>
            </div>

            {showCustomCtx && (
              <div className="custom-ctx-box">
                <div className="config-group">
                  <div className="resume-label-bar">
                    <label>Candidate Resume / Key Skills</label>
                    <label className="file-upload-btn btn btn-sm btn-outline">
                      📁 Upload Resume File (.txt, .pdf, .docx)
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,.doc"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const raw = event.target?.result || "";
                            // Filter out non-printable binary bytes for clean text
                            const cleanedText = typeof raw === "string" 
                              ? raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").replace(/\s+/g, " ").trim()
                              : "";
                            setResumeText(cleanedText || `[Uploaded file: ${file.name}]`);
                          };
                          reader.readAsText(file);
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Upload your resume file above or paste text here (e.g. 2 years experience in React, Node.js, REST APIs, MongoDB...)"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="config-textarea"
                  />
                  {resumeText && (
                    <span className="upload-status-badge">
                      ✓ Resume text ready ({resumeText.length} characters)
                    </span>
                  )}
                </div>
                <div className="config-group">
                  <label>Target Job Description (JD)</label>
                  <textarea
                    rows={4}
                    placeholder="Paste targeted job description here (e.g. Looking for a Frontend Developer proficient in TypeScript, State Management, and Performance Optimization...)"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="config-textarea"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="role-filter-tabs">
            <button
              className={`filter-tab ${activeFilter === "all" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Roles ({roles.length})
            </button>
            <button
              className={`filter-tab filter-tab--fresher ${activeFilter === "fresher" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("fresher")}
            >
              🌱 Fresher / Entry Level
            </button>
            <button
              className={`filter-tab filter-tab--upgraded ${activeFilter === "upgraded" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("upgraded")}
            >
              ⚡ Senior / Upgraded
            </button>
          </div>

          <div className="role-grid">
            {filteredRoles.map((role) => (
              <RoleCard key={role.id} role={role} onSelect={handleSelect} disabled={starting} />
            ))}
          </div>
        </>
      )}

      {starting && (
        <div className="overlay">
          <Loader text="Drafting your tailored interview question..." />
        </div>
      )}
    </section>
  );
}
