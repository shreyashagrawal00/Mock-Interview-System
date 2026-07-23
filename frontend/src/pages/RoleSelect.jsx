import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import RoleCard from "../components/RoleCard.jsx";
import Loader from "../components/Loader.jsx";

export default function RoleSelect() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getRoles()
      .then((data) => setRoles(data.roles))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(role) {
    setError("");
    setStarting(true);
    try {
      const data = await api.startSession(role.id);
      navigate(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  return (
    <section className="hero">
      <div className="hero__intro">
        <span className="eyebrow">Choose your seat across the table</span>
        <h1 className="hero__title">
          Practice like the interview <em>already started.</em>
        </h1>
        <p className="hero__sub">
          Pick a role. Gemini asks the questions, listens to what you actually say — typed or spoken — and
          grades you on communication, technical depth, and confidence, the same way a real panel would.
        </p>
      </div>

      {loading && <Loader text="Setting up the practice room" />}
      {error && <div className="alert">{error}</div>}

      {!loading && (
        <div className="role-grid">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} onSelect={handleSelect} disabled={starting} />
          ))}
        </div>
      )}

      {starting && (
        <div className="overlay">
          <Loader text="Drafting your first question" />
        </div>
      )}
    </section>
  );
}
