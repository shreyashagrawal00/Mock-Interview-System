// Central list of interview roles.
// icon values are simple keywords the frontend maps to inline SVG icons.
const ROLES = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    icon: "layout",
    focus: "React, JavaScript, CSS, browser performance, accessibility",
    description: "Component architecture, state management, styling systems, and UI performance.",
  },
  {
    id: "backend-dev",
    title: "Backend Developer",
    icon: "server",
    focus: "APIs, databases, system design, authentication, scaling",
    description: "API design, data modeling, reliability, and server-side trade-offs.",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    icon: "chart",
    focus: "SQL, statistics, data visualization, business metrics",
    description: "Turning raw data into decisions with SQL, visualization, and clear storytelling.",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    icon: "compass",
    focus: "Prioritization, roadmaps, stakeholder communication, metrics",
    description: "Prioritization frameworks, roadmap trade-offs, and cross-team communication.",
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    icon: "brain",
    focus: "Model training, evaluation, MLOps, deployment",
    description: "Model selection, evaluation rigor, and shipping ML systems that hold up in production.",
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    icon: "cloud",
    focus: "CI/CD, containers, infrastructure, monitoring",
    description: "Pipelines, infrastructure-as-code, observability, and incident response.",
  },
];

function getRoleById(id) {
  return ROLES.find((r) => r.id === id);
}

module.exports = { ROLES, getRoleById };
