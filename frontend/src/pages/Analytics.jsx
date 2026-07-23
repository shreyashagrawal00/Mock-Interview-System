import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ScoreGauge from "../components/ScoreGauge";
import ScoreBar from "../components/ScoreBar";
import Loader from "../components/Loader";

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAnalytics()
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading your performance analytics..." />;

  if (error) {
    return (
      <div className="container page">
        <div className="card error-card">
          <h2>Failed to load analytics</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn--primary">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { totalCompleted, avgComm, avgTech, avgConf, avgOverall, recentTrends } = data || {};

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Performance Analytics</h1>
          <p className="subtitle">Track your mock interview progress, score trends, and key skill breakdowns</p>
        </div>
        <Link to="/" className="btn btn--primary">
          + Start New Interview
        </Link>
      </div>

      {totalCompleted === 0 ? (
        <div className="card empty-card">
          <h3>No Completed Sessions Yet</h3>
          <p>Complete at least one mock interview session to unlock performance insights and score trends.</p>
          <Link to="/" className="btn btn--primary">
            Pick a Role & Start
          </Link>
        </div>
      ) : (
        <>
          <div className="analytics-grid">
            <div className="card gauge-card">
              <h3>Overall Mastery</h3>
              <ScoreGauge score={avgOverall} label="Overall Avg" size={200} />
              <p className="metric-caption">Based on {totalCompleted} completed interview sessions</p>
            </div>

            <div className="card breakdown-card">
              <h3>Skill Breakdown Averages</h3>
              <div className="bars-vertical">
                <ScoreBar label="Technical Depth" value={avgTech} />
                <ScoreBar label="Communication" value={avgComm} />
                <ScoreBar label="Confidence" value={avgConf} />
              </div>
            </div>
          </div>

          <div className="card trends-section">
            <h3>Recent Session Trends</h3>
            <div className="trends-table-wrapper">
              <table className="trends-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Role</th>
                    <th>Technical</th>
                    <th>Communication</th>
                    <th>Confidence</th>
                    <th>Overall</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrends && recentTrends.length > 0 ? (
                    recentTrends.map((s) => (
                      <tr key={s.id}>
                        <td>{s.date || "N/A"}</td>
                        <td>
                          <strong>{s.roleTitle}</strong>
                        </td>
                        <td>{s.technicalDepth}/10</td>
                        <td>{s.communication}/10</td>
                        <td>{s.confidence}/10</td>
                        <td>
                          <span className="badge badge-primary">{s.overallAverage}/10</span>
                        </td>
                        <td>
                          <Link to={`/results/${s.id}`} className="btn btn--ghost btn-sm">
                            View Report
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No session trend data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
