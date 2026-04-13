import { useState } from "react";
import Modal from "../ui/Modal";
import { QUIZ_QUESTIONS } from "../../constants";

export default function QuizModal({ onClose, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);

  const q = QUIZ_QUESTIONS[idx];
  const letters = ["A", "B", "C", "D"];

  const handleAnswer = (chosen) => {
    if (answered !== null) return;
    setAnswered(chosen);
    const correct = chosen === q.ans;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (idx + 1 < QUIZ_QUESTIONS.length) {
        setIdx(idx + 1);
        setAnswered(null);
      } else {
        onComplete({
          correct: newScore,
          passed: newScore >= Math.ceil(QUIZ_QUESTIONS.length * 0.6),
        });
      }
    }, 900);
  };

  return (
    <Modal open={true} maxWidth={540}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1rem",
            color: "var(--accent-gold)",
          }}
        >
          🏆 Final Boss Quiz!
        </div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".8rem",
            color: "var(--text-muted)",
          }}
        >
          Score: <span style={{ color: "var(--accent-gold)" }}>{score}</span> /{" "}
          {QUIZ_QUESTIONS.length}
        </div>
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          gap: ".4rem",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        {QUIZ_QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                i < idx
                  ? "var(--accent-green)"
                  : i === idx
                  ? "var(--accent-gold)"
                  : "var(--border)",
              animation: i === idx ? "pdot-glow 1s ease infinite" : "none",
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1rem",
          color: "var(--text-primary)",
          marginBottom: "1.25rem",
          lineHeight: 1.5,
        }}
      >
        {idx + 1}. {q.q}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        {q.opts.map((opt, i) => {
          let bg = "var(--bg-elevated)",
            border = "var(--border)",
            color = "var(--text-secondary)";
          if (answered !== null) {
            if (i === q.ans) {
              bg = "rgba(82,224,122,.12)";
              border = "var(--accent-green)";
              color = "var(--accent-green)";
            } else if (i === answered && answered !== q.ans) {
              bg = "rgba(224,92,92,.12)";
              border = "var(--accent-red)";
              color = "var(--accent-red)";
            }
          }
          return (
            <div
              key={i}
              onClick={() => handleAnswer(i)}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 6,
                padding: ".7rem 1rem",
                cursor: answered !== null ? "default" : "pointer",
                fontFamily: "var(--font-body)",
                fontSize: ".97rem",
                color,
                display: "flex",
                alignItems: "center",
                gap: ".75rem",
                transition: "all .2s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: ".72rem",
                  color: "var(--text-muted)",
                  width: 20,
                }}
              >
                {letters[i]}.
              </span>
              <span>{opt}</span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}