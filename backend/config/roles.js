// Central list of interview roles with Fresher and Upgraded / Senior versions.
// icon values map to inline SVG icons in the frontend.
const ROLES = [
  // 1. Core Software Engineering Pair
  {
    id: "fresher-software-engineer",
    title: "Software Engineer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "code",
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

  // 3. Backend Engineering Pair
  {
    id: "fresher-backend-dev",
    title: "Backend Developer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "server",
    focus: "REST APIs, Node.js/Express, SQL basics, Authentication, HTTP status codes",
    description: "Entry-level role focusing on server-side basics, API endpoints, CRUD operations, and database fundamentals.",
  },
  {
    id: "senior-backend-engineer",
    title: "Backend Lead Engineer (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "database",
    focus: "High-throughput APIs, Database Indexing, Caching, Event-Driven Architecture, gRPC",
    description: "Upgraded senior role focusing on database performance, caching strategies, message queues, and low-latency APIs.",
  },

  // 4. Data Science & Machine Learning Pair
  {
    id: "fresher-ml-engineer",
    title: "ML / AI Engineer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "brain",
    focus: "Python, Pandas, Scikit-Learn, Supervised Learning, Data Preprocessing",
    description: "Entry-level role focusing on ML fundamentals, regression, classification, feature engineering, and model evaluation.",
  },
  {
    id: "senior-ai-architect",
    title: "AI & LLM Architect (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "brain",
    focus: "LLM Fine-tuning, RAG Architecture, MLOps, Distributed Training, Model Serving",
    description: "Upgraded senior role focusing on production LLM pipelines, vector databases, MLOps, and deep learning deployment.",
  },

  // 5. Cybersecurity Pair
  {
    id: "fresher-security-analyst",
    title: "Security Analyst (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "shield",
    focus: "OWASP Top 10, Network Protocols, Basic Cryptography, Vulnerability Assessment",
    description: "Entry-level role focusing on web security basics, vulnerability scanning, authentication security, and network basics.",
  },
  {
    id: "senior-secops-architect",
    title: "Cybersecurity Architect (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "shield",
    focus: "Zero Trust Architecture, Threat Modeling, Incident Response, DevSecOps, Identity Federation",
    description: "Upgraded senior role focusing on enterprise security architecture, threat vectors, pen-testing, and compliance.",
  },

  // 6. Mobile App Engineering Pair
  {
    id: "fresher-mobile-developer",
    title: "Mobile App Developer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "mobile",
    focus: "React Native / Flutter, UI Layouts, API Integration, Local Storage",
    description: "Entry-level role focusing on cross-platform mobile development, UI components, state management, and mobile APIs.",
  },
  {
    id: "senior-mobile-architect",
    title: "Mobile Lead Architect (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "mobile",
    focus: "Native Modules, Offline Synchronization, App Performance, CI/CD for App Store, Memory Management",
    description: "Upgraded senior role focusing on mobile app performance, native bridging, offline-first sync, and release architecture.",
  },

  // 7. DevOps & SRE Pair
  {
    id: "fresher-devops-engineer",
    title: "DevOps Engineer (Fresher)",
    level: "Fresher / Entry Level",
    levelType: "fresher",
    icon: "cloud",
    focus: "Linux CLI, Docker containers, Basic CI/CD, Git workflows, Cloud basics",
    description: "Entry-level role focusing on containerization, basic deployment pipelines, shell scripting, and cloud infrastructure.",
  },
  {
    id: "senior-sre-architect",
    title: "Site Reliability Engineer (Upgraded)",
    level: "Senior / Upgraded",
    levelType: "upgraded",
    icon: "cloud",
    focus: "Kubernetes, Terraform (IaC), Observability, Multi-Cloud DR, Chaos Engineering",
    description: "Upgraded senior role focusing on zero-downtime deployments, incident response, auto-scaling, and infrastructure-as-code.",
  },

  // 8. Data Analysis & Big Data Pair
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
];

function getRoleById(id) {
  return ROLES.find((r) => r.id === id);
}

module.exports = { ROLES, getRoleById };
