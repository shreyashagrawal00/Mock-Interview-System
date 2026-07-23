import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Icon from "./components/Icon.jsx";
import RoleSelect from "./pages/RoleSelect.jsx";
import Interview from "./pages/Interview.jsx";
import Results from "./pages/Results.jsx";
import History from "./pages/History.jsx";
import { Analytics } from "./pages/Analytics.jsx";

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="topbar__brand">
          <span className="topbar__mark">
            <Icon name="sparkle" size={18} />
          </span>
          <span>
            Mock Interview <em>Practice Room</em>
          </span>
        </Link>
        <nav className="topbar__nav">
          <Link to="/" className={location.pathname === "/" ? "is-active" : ""}>
            New Session
          </Link>
          <Link to="/analytics" className={location.pathname === "/analytics" ? "is-active" : ""}>
            Analytics
          </Link>
          <Link to="/history" className={location.pathname === "/history" ? "is-active" : ""}>
            <Icon name="history" size={16} /> History
          </Link>
          <button type="button" className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </nav>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/interview/:sessionId" element={<Interview />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      <footer className="app__footer">
        Practice deliberately with AI feedback on communication, technical depth, and confidence.
      </footer>
    </div>
  );
}
