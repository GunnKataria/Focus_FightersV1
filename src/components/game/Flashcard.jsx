import { Label } from "../ui/Typography";

export default function Flashcard({ card, flipped, answered, onFlip, onAnswer }) {
  return (
    <div>
      <div
        className="card-flip-wrap"
        style={{ height: 180, cursor: "pointer" }}
        onClick={() => !answered && onFlip()}
      >
        <div className={`card-flip ${flipped ? "flipped" : ""}`} style={{ height: "100%" }}>
          {/* Front */}
          <div
            className="card-face"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <Label style={{ marginBottom: ".75rem" }}>Question</Label>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: ".95rem",
                color: "var(--text-primary)",
                lineHeight: 1.5,
              }}
            >
              {card.q}
            </p>
            {!flipped && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: ".75rem",
                  marginTop: ".75rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Click to flip
              </p>
            )}
          </div>

          {/* Back */}
          <div
            className="card-face card-face-back"
            style={{
              background: "linear-gradient(135deg,rgba(82,224,122,.1),rgba(82,224,122,.04))",
              border: "1px solid rgba(82,224,122,.25)",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <Label style={{ color: "var(--accent-green)", marginBottom: ".5rem" }}>Answer</Label>
            <p
              style={{
                color: "var(--accent-green)",
                fontStyle: "italic",
                fontSize: ".9rem",
                lineHeight: 1.5,
              }}
            >
              {card.a}
            </p>
          </div>
        </div>
      </div>

      {!answered && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: ".5rem",
            marginTop: ".75rem",
          }}
        >
          {card.opts.map((opt, i) => (
            <div
              key={i}
              onClick={() => onAnswer(i === card.correct)}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: ".75rem",
                padding: ".55rem .75rem",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                cursor: "pointer",
                color: "var(--text-secondary)",
                transition: "all .15s",
                textAlign: "center",
                letterSpacing: ".04em",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--accent-violet)";
                e.target.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.color = "var(--text-secondary)";
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}