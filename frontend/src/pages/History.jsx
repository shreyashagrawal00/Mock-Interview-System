import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Loader from "../components/Loader.jsx";
import Icon from "../components/Icon.jsx";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getHistory()
      .then((data) => setSessions(data?.sessions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interview session?")) return;
    try {
      await api.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert("Failed to delete session: " + err.message);
    }
  }

  if (loading) return <Loader text="Pulling your session log" />;
  if (error) return <div className="alert">{error}</div>;

  return (
    <section className="history">
      <span className="eyebrow">Session log</span>
      <h1 className="history__title">Every rep, on the record.</h1>

      {sessions.length === 0 && (
        <div className="empty-state">
          <p>No sessions yet. Your first practice round will show up here.</p>
          <Link to="/" className="btn btn--primary">
            Start a session <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      )}

      <div className="history__list">
        {sessions.map((s) => (
          <div key={s._id} className="history__row-wrapper">
            <Link
              to={s.status === "completed" ? `/results/${s._id}` : `/interview/${s._id}`}
              className="history__row"
            >
              <div className="history__row-main">
                <span className="history__role">{s.roleTitle}</span>
                <span className={`badge badge--${s.status}`}>
                  {s.status === "completed" ? "Completed" : "In progress"}
                </span>
              </div>
              <div className="history__row-meta">
                <span>{s.createdAt ? new Date(s.createdAt).toLocaleString() : ""}</span>
                {s.status === "completed" && (
                  <span className="history__score">{(Number(s.overallAverage) || 0).toFixed(1)}/10</span>
                )}
              </div>
            </Link>
            <button
              type="button"
              className="btn-delete-session"
              onClick={(e) => handleDelete(e, s._id)}
              title="Delete session"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
