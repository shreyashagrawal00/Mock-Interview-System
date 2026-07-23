import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import ScoreGauge from "../components/ScoreGauge.jsx";
import ScoreBar from "../components/ScoreBar.jsx";
import Loader from "../components/Loader.jsx";

export default function Results() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    api
      .getSession(sessionId)
      .then((data) => setSession(data.session))
      .catch((err) => setError(err.message));
  }, [sessionId]);

  async function handlePracticeAgain() {
    setRestarting(true);
    try {
      const data = await api.restartSession(sessionId);
      navigate(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err.message);
      setRestarting(false);
    }
  }

  if (error) return <div className="alert">{error}</div>;
  if (!session) return <Loader text="Pulling up your report card" />;

  const { overallScore = {}, overallAverage = 0, questions = [], roleTitle, summary } = session;

  return (
    <section className="results">
      <div className="results__header">
        <span className="eyebrow">Report card &middot; {roleTitle}</span>
        <h1 className="results__title">Here&apos;s how it went.</h1>
      </div>

      <div className="card results__summary">
        <ScoreGauge score={overallAverage} label="Overall score" size={220} />
        <div className="results__breakdown">
          <ScoreBar label="Communication" value={overallScore.communication || 0} />
          <ScoreBar label="Technical depth" value={overallScore.technicalDepth || 0} />
          <ScoreBar label="Confidence" value={overallScore.confidence || 0} />
        </div>
      </div>

      {summary && (
        <div className="card results__coach">
          <p className="results__coach-eyebrow">
            <Icon name="sparkle" size={16} /> Coach&apos;s note
          </p>
          <p>{summary}</p>
        </div>
      )}

      <h2 className="results__subhead">Question by question</h2>
      <div className="results__questions">
        {questions.map((q, i) => (
          <div className="card qa-card" key={i}>
            <p className="qa-card__eyebrow">Question {i + 1}</p>
            <p className="qa-card__question">{q.question}</p>
            <p className="qa-card__answer">{q.answer || <em>No answer given</em>}</p>
            <div className="qa-card__scores">
              <ScoreBar label="Communication" value={q.score?.communication || 0} />
              <ScoreBar label="Technical depth" value={q.score?.technicalDepth || 0} />
              <ScoreBar label="Confidence" value={q.score?.confidence || 0} />
            </div>
            <p className="qa-card__feedback">{q.feedback}</p>
            {q.improvementTips?.length > 0 && (
              <ul className="qa-card__tips">
                {q.improvementTips.map((tip, ti) => (
                  <li key={ti}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="results__actions">
        <button className="btn btn--primary" onClick={handlePracticeAgain} disabled={restarting}>
          <Icon name="refresh" size={16} />
          {restarting ? "Setting up..." : "Practice again"}
        </button>
        <button className="btn btn--ghost" onClick={() => navigate("/")}>
          Choose a different role
        </button>
      </div>
    </section>
  );
}
