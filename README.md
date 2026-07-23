# 🎙️ AI-Based Mock Interview System

An intelligent, full-stack mock interview platform powered by **Google Gemini AI**. Practice technical and behavioral interviews with real-time AI scoring, text-to-speech question reading, voice dictation, live coding sandboxes, custom resume/JD parsing, downloadable PDF report cards, and performance analytics.

---

## 🌟 Key Features

* **🎙️ Voice & Multimodal Suite**:
  * **Text-to-Speech (TTS) Question Reader**: AI reads questions aloud with customizable voice settings, speed controls (0.8x, 1.0x, 1.2x), and an **Auto-Speak ON/OFF** toggle button.
  * **Voice Answer Dictation**: Speak your answers directly into the microphone using browser speech recognition.
  * **Live Animated Waveform**: Visualizes audio levels in real time while speaking.
  * **Webcam Video Preview Card**: Simulated video call view for practicing interview presentation and body language.

* **🧠 Smart AI & Custom Context**:
  * **Custom Resume File Upload (.txt, .pdf, .docx)**: Upload your resume or paste skills to get tailored questions matching your experience.
  * **Job Description (JD) Targeting**: Paste targeted job descriptions for role-specific question prompts.
  * **✨ AI Benchmark Model Answers**: Generate exemplary senior-level answers on the results page to compare against your responses.
  * **Real-time AI Feedback**: Scoring across **Communication**, **Technical Depth**, and **Confidence** with actionable improvement tips.

* **⚙️ Interview Modes & Customization**:
  * **Interview Modes**:
    * 🎯 **Standard Technical Q&A**
    * ⏱️ **Timed Pressure Mode**: Interactive countdown timer with auto-submission on expiration.
    * ⭐ **STAR Behavioral Mode**: Situation, Task, Action, and Result structured interview.
    * 💻 **Live Code Sandbox**: Code editor interface for technical developer roles.
  * **Seniority Selector**: Choose *Fresher / Entry-Level*, *Mid-Level Specialist*, or *Senior / Lead Architect*.
  * **Question Count**: Select 3, 5, or 10 questions per session.

* **📊 Performance Analytics & Tools**:
  * **Analytics Dashboard (`/analytics`)**: View score progression over time, overall average score gauges, and competency breakdowns.
  * **📄 PDF Scorecard Export**: Download high-quality PDF report cards of your interview feedback.
  * **⭐ Question Bookmarking**: Bookmark challenging questions for targeted revision.
  * **🗑️ Session Management**: Delete past or test sessions permanently from your history log.
  * **🌙 Dark / Light Theme Engine**: Toggle themes with persistent preference saving.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), React Router v6, Web Speech API, `html2pdf.js`, Vanilla CSS (Custom Design System).
* **Backend**: Node.js, Express.js, Mongoose (MongoDB ORM), `@google/generative-ai` SDK (Gemini 3.5 / 3.6 Flash with Mistral API fallback).
* **Database**: MongoDB (Local or MongoDB Atlas Cluster).

---

## 📂 Project Structure

```
mock-interview-system/
├── backend/                        # Express API Server
│   ├── config/
│   │   ├── db.js                   # MongoDB connection handler
│   │   └── roles.js                # Selectable job roles database
│   ├── models/
│   │   └── Session.js              # Mongoose schema (modes, scores, Q&As, bookmarks)
│   ├── routes/
│   │   ├── roles.js                # GET /api/roles
│   │   └── session.js              # Session routes (start, answer, model-answer, analytics, delete)
│   ├── services/
│   │   └── geminiService.js        # Gemini API integration & prompt engineering
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── server.js                   # Backend entry point & CORS middleware
│
├── frontend/                       # React (Vite) Single Page Application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # API HTTP request wrapper
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx   # Voice recording helper
│   │   │   ├── AudioWaveform.jsx   # Live audio visualizer component
│   │   │   ├── CodeSandbox.jsx     # Code editor for technical questions
│   │   │   ├── Icon.jsx            # SVG icon library
│   │   │   ├── Loader.jsx          # Loading spinner component
│   │   │   ├── RoleCard.jsx        # Role selection card
│   │   │   ├── ScoreBar.jsx        # Progress score bar component
│   │   │   ├── ScoreGauge.jsx      # SVG semi-circle score gauge
│   │   │   ├── TimerGauge.jsx      # Timed mode countdown bar
│   │   │   ├── VoiceInterviewer.jsx# TTS Speech synthesis controller
│   │   │   └── WebcamPreview.jsx   # Video camera preview widget
│   │   ├── pages/
│   │   │   ├── Analytics.jsx       # Performance statistics & score trends
│   │   │   ├── History.jsx         # Session history log with delete options
│   │   │   ├── Interview.jsx       # Interactive interview room
│   │   │   ├── Results.jsx         # Report card, AI model answers & PDF export
│   │   │   └── RoleSelect.jsx      # Role selection & session setup panel
│   │   ├── styles/
│   │   │   └── index.css           # Full CSS design tokens & theme engine
│   │   ├── utils/
│   │   │   └── pdfExporter.js      # Client-side PDF export wrapper
│   │   ├── App.jsx                 # Navbar, route definitions & theme toggle
│   │   └── main.jsx                # React app mounting point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md                       # Project documentation (this file)
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
* Node.js 18+
* A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or local MongoDB instance (`mongodb://127.0.0.1:27017`)
* A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 2. Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Copy environment template
cp .env.example .env

# 3. Open .env and set your MongoDB URI & Gemini API Key:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mock-interview
# GEMINI_API_KEY=AIzaSy...

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev
```
The API server will run at `http://localhost:5000`. You can verify it at `http://localhost:5000/api/health`.

---

### 3. Frontend Setup
```bash
# 1. Open a new terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment Guide

### Backend (Render.com)
1. Create a new **Web Service** on Render connected to your repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install` and **Start Command** to `node server.js`.
4. Add environment variables: `MONGO_URI`, `GEMINI_API_KEY`, and `NODE_ENV=production`.

### Frontend (Vercel)
1. Import project into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set Framework Preset to `Vite`.
4. Add environment variable:
   * `VITE_API_BASE_URL` = `https://your-render-backend-url.onrender.com/api`
5. Click **Deploy**.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/roles` | List all available job roles |
| `POST` | `/api/session/start` | Start a new mock interview session |
| `POST` | `/api/session/:id/answer` | Submit answer & retrieve AI evaluation |
| `GET` | `/api/session/:id` | Fetch full session details & question transcript |
| `GET` | `/api/session` | Fetch session history log |
| `POST` | `/api/session/:id/restart` | Restart a session for the same role |
| `POST` | `/api/session/:id/question/:index/model-answer` | Generate AI benchmark model answer |
| `POST` | `/api/session/:id/question/:index/bookmark` | Toggle question bookmark status |
| `GET` | `/api/session/analytics/overview` | Fetch aggregate performance stats & trends |
| `DELETE`| `/api/session/:id` | Permanently delete a session |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
