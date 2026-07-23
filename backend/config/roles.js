// Central list of interview roles with Fresher and Upgraded / Senior versions.
// icon values map to inline SVG icons in the frontend.
const ROLES = [
  // 1. Software Engineering Pair
  {
    id: "fresher-software-engineer",
    title: "Software Engineer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "layout",
    focus: "Data Structures, Algorithms, OOP, Basic Debugging, Git",
    description: "Foundational programming concepts, data structures, basic problem solving, and object-oriented design.",
  },
  {
    id: "senior-software-architect",
    title: "Software Architect (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "server",
    focus: "Distributed Systems, System Design, Microservices, Scalability, Concurrency",
    description: "Upgraded senior role focusing on high-scale architecture, trade-off analysis, concurrency, and enterprise systems.",
  },

  // 2. Frontend Engineering Pair
  {
    id: "fresher-frontend-dev",
    title: "Frontend Developer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "layout",
    focus: "HTML5, CSS3, JavaScript basics, React State/Props, DOM manipulation",
    description: "Entry-level role focusing on core web fundamentals, UI components, state management, and React basics.",
  },
  {
    id: "senior-frontend-architect",
    title: "Frontend Architect (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "layout",
    focus: "Micro-frontends, Web Performance, Advanced State, Web Security, Custom Bundlers",
    description: "Upgraded senior role focusing on web performance optimization, large-scale UI architecture, security, and tooling.",
  },

  // 3. Data Analysis & Engineering Pair
  {
    id: "fresher-data-analyst",
    title: "Data Analyst (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "chart",
    focus: "Basic SQL, Excel formulas, data aggregation, basic charts",
    description: "Entry-level role focusing on SQL basics, data cleanup, spreadsheet analytics, and reporting fundamentals.",
  },
  {
    id: "senior-data-engineer",
    title: "Data Engineer (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "cloud",
    focus: "ETL Pipelines, Apache Spark, Data Warehousing, Kafka, Big Data Architecture",
    description: "Upgraded senior role focusing on distributed streaming, big data pipelines, warehouse design, and high throughput.",
  },

  // 4. Product Management Pair
  {
    id: "fresher-product-manager",
    title: "Product Manager (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "compass",
    focus: "User Stories, Wireframing, Product Basics, Feature Prioritization",
    description: "Entry-level role focusing on user research, defining requirements, feature specs, and product fundamentals.",
  },
  {
    id: "senior-product-director",
    title: "Product Director (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "compass",
    focus: "Product Strategy, Executive Stakeholders, Roadmap Economics, Scale Metrics",
    description: "Upgraded senior role focusing on multi-product strategy, revenue models, market positioning, and cross-functional leadership.",
  },
];

function getRoleById(id) {
  return ROLES.find((r) => r.id === id);
}

module.exports = { ROLES, getRoleById };
