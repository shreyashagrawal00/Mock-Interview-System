# AI-Based Mock Interview System

Users pick a job role (Frontend Developer, Data Analyst, Product Manager, and more). Gemini generates
role-specific interview questions one at a time, evaluates each typed or spoken answer in real time,
scores it on **communication**, **technical depth**, and **confidence**, and gives personalized
improvement tips. Every session is saved so you can review your history and "practice again" whenever
you like.

Stack: **React (Vite) + Express + MongoDB + Gemini API**

---

## Project structure

```
mock-interview-system/
├── backend/                 Express API server
│   ├── config/
│   │   ├── db.js            MongoDB connection
│   │   └── roles.js         List of selectable interview roles
│   ├── models/
│   │   └── Session.js       Mongoose schema for interview sessions
│   ├── routes/
│   │   ├── roles.js         GET /api/roles
│   │   └── session.js       Start / answer / fetch / history / restart
│   ├── services/
│   │   └── geminiService.js Question generation + answer evaluation prompts
│   ├── server.js            App entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                 React (Vite) app
│   ├── src/
│   │   ├── api/client.js     Fetch wrapper for the backend API
│   │   ├── components/       Icon, RoleCard, ScoreGauge, ScoreBar, Loader
│   │   ├── pages/             RoleSelect, Interview, Results, History
│   │   ├── styles/index.css   Full design system (light mode)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── .env.example
│   └── package.json
│
└── README.md (this file)
```

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongodb://127.0.0.1:27017`) or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI and GEMINI_API_KEY
npm install
npm run dev        # or: npm start
```

The API starts on `http://localhost:5000` by default. Check it's alive at
`http://localhost:5000/api/health`.

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:5000
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## How it works

1. **Role select** — pick a role from the grid. This calls `POST /api/session/start`,
   which asks Gemini for the first question and creates a session document in MongoDB.
2. **Interview** — answer by typing, or press **Speak answer** to dictate via the
   browser's built-in speech recognition (Chrome/Edge). Submitting calls
   `POST /api/session/:id/answer`, which asks Gemini to score the answer
   (communication / technical depth / confidence) and either returns the next
   question or, on the last question, a final summary.
3. **Results** — a report-card view with an overall score gauge, a per-category
   breakdown, a short coaching note, and a full question-by-question transcript
   with feedback and tips. **Practice again** starts a brand-new session for the
   same role.
4. **History** — every session (in-progress or completed) is listed, newest first,
   so you can jump back into an unfinished one or revisit an old report card.

## Notes on scoring

Scoring is entirely delegated to Gemini via structured-JSON prompts in
`backend/services/geminiService.js` — there's no hardcoded rubric on the backend
besides clamping scores to a 0–10 range. Adjust the prompts there if you want a
stricter or differently-weighted rubric.

## Customizing roles

Edit `backend/config/roles.js` to add, remove, or tweak roles. Each role just needs
an `id`, `title`, `icon` (see `frontend/src/components/Icon.jsx` for available
icon keys), `focus`, and `description`.
