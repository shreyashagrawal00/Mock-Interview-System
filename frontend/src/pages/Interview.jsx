import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import ScoreBar from "../components/ScoreBar.jsx";
import Loader from "../components/Loader.jsx";

const SpeechRecognitionAPI =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [pendingNext, setPendingNext] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Hydrate from an existing session on refresh/navigation.
    api
      .getSession(sessionId)
      .then(({ session }) => {
        const last = session.questions[session.questions.length - 1];
        setQuestionNumber(session.questions.length);
        setTotalQuestions(session.totalQuestions);
        setQuestion(last.question);
        if (session.status === "completed") {
          navigate(`/results/${sessionId}`, { replace: true });
        }
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  function toggleListening() {
    if (!SpeechRecognitionAPI) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const data = await api.submitAnswer(sessionId, answer.trim());
      setEvaluation(data.evaluation);
      setIsComplete(data.isComplete);
      if (data.isComplete) {
        setFinalResult(data.result);
      } else {
        setPendingNext(data.nextQuestion);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (isComplete) {
      navigate(`/results/${sessionId}`);
      return;
    }
    setQuestion(pendingNext.question);
    setQuestionNumber(pendingNext.questionNumber);
    setTotalQuestions(pendingNext.totalQuestions);
    setAnswer("");
    setEvaluation(null);
    setPendingNext(null);
  }

  const progressPct = (questionNumber / totalQuestions) * 100;

  return (
    <section className="interview">
      <div className="interview__progress">
        <div className="interview__progress-track">
          <div className="interview__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="interview__progress-label">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      <div className="card notecard">
        <span className="notecard__pin" aria-hidden="true" />
        <p className="notecard__eyebrow">Interviewer asks</p>
        <h2 className="notecard__question">{question || "Loading question..."}</h2>
      </div>

      {error && <div className="alert">{error}</div>}

      {!evaluation && (
        <form className="answer-form" onSubmit={handleSubmit}>
          <label className="answer-form__label" htmlFor="answer">
            Your answer
          </label>
          <textarea
            id="answer"
            className="answer-form__textarea"
            rows={7}
            placeholder="Type your answer here, or use the microphone to speak it..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitting}
          />
          <div className="answer-form__actions">
            {SpeechRecognitionAPI && (
              <button
                type="button"
                className={`btn btn--ghost ${listening ? "is-listening" : ""}`}
                onClick={toggleListening}
              >
                <Icon name="mic" size={17} />
                {listening ? "Listening..." : "Speak answer"}
              </button>
            )}
            <button type="submit" className="btn btn--primary" disabled={submitting || !answer.trim()}>
              {submitting ? "Grading..." : "Submit answer"}
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
          {submitting && <Loader text="Reviewing your answer" />}
        </form>
      )}

      {evaluation && (
        <div className="card eval-card">
          <p className="eval-card__eyebrow">
            <Icon name="check" size={16} /> Evaluation
          </p>
          <div className="eval-card__scores">
            <ScoreBar label="Communication" value={evaluation.score.communication} />
            <ScoreBar label="Technical depth" value={evaluation.score.technicalDepth} />
            <ScoreBar label="Confidence" value={evaluation.score.confidence} />
          </div>
          <p className="eval-card__feedback">{evaluation.feedback}</p>
          {evaluation.improvementTips?.length > 0 && (
            <ul className="eval-card__tips">
              {evaluation.improvementTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
          <button className="btn btn--primary" onClick={handleContinue}>
            {isComplete ? "View full report" : "Next question"}
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
