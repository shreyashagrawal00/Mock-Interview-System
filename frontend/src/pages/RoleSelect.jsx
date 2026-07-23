import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import RoleCard from "../components/RoleCard.jsx";
import Loader from "../components/Loader.jsx";

export default function RoleSelect() {
  const [roles, setRoles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "fresher" | "upgraded"
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getRoles()
      .then((data) => setRoles(data?.roles || []))
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
        <span className="eyebrow">Choose your seat across the table</span>
        <h1 className="hero__title">
          Practice like the interview <em>already started.</em>
        </h1>
        <p className="hero__sub">
          Pick your role and target level below. Questions and scoring criteria automatically adapt — from fundamental concepts for Freshers to high-scale architecture for Senior Engineers.
        </p>
      </div>

      {loading && <Loader text="Setting up the practice room" />}
      {error && <div className="alert">{error}</div>}

      {!loading && (
        <>
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
          <Loader text="Drafting your first question" />
        </div>
      )}
    </section>
  );
}
