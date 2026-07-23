const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.detail ? `${data.error || "Request failed"}: ${data.detail}` : data.error || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  getRoles: () => request("/roles"),
  startSession: (config) =>
    request("/session/start", {
      method: "POST",
      body: JSON.stringify(typeof config === "string" ? { roleId: config } : config),
    }),
  submitAnswer: (sessionId, answer) =>
    request(`/session/${sessionId}/answer`, { method: "POST", body: JSON.stringify({ answer }) }),
  getSession: (sessionId) => request(`/session/${sessionId}`),
  getHistory: () => request("/session"),
  restartSession: (sessionId) => request(`/session/${sessionId}/restart`, { method: "POST" }),
  getModelAnswer: (sessionId, qIndex) =>
    request(`/session/${sessionId}/question/${qIndex}/model-answer`, { method: "POST" }),
  toggleBookmark: (sessionId, qIndex) =>
    request(`/session/${sessionId}/question/${qIndex}/bookmark`, { method: "POST" }),
  getAnalytics: () => request("/session/analytics/overview"),
  deleteSession: (sessionId) => request(`/session/${sessionId}`, { method: "DELETE" }),
};
