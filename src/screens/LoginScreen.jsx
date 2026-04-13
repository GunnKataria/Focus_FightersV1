import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import { RuneDivider } from "../components/ui/Typography";

export default function LoginScreen() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleEnter = () => {
    if (!name.trim()) return;
    signInAsGuest(name);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3.5rem" }}>⚔️</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", textShadow: "0 0 40px rgba(124,92,224,.8)", marginTop: ".5rem" }}>
            Focus Fighters
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: ".75rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: ".3rem" }}>
            Productivity · Combat · Victory
          </div>
        </div>

        <Card glow>
          {/* Name input */}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleEnter()}
            placeholder="Enter your warrior name"
            maxLength={24}
            style={{
              width: "100%", padding: ".9rem 1rem", marginBottom: "1rem",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.15)", borderRadius: 8,
              fontFamily: "var(--font-heading)", fontSize: ".9rem",
              letterSpacing: ".05em", color: "var(--text-primary)", outline: "none",
            }}
          />

          <button
            onClick={handleEnter}
            disabled={!name.trim()}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: ".75rem", padding: ".9rem 1.5rem", marginTop: "1rem",
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 8, cursor: "pointer", transition: "all .2s",
              fontFamily: "var(--font-heading)", fontSize: ".85rem",
              letterSpacing: ".08em", color: "var(--text-muted)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-violet)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <span>⚔️</span> Enter the Arena
          </button>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: ".75rem", fontFamily: "var(--font-heading)", letterSpacing: ".05em", marginTop: "1rem", lineHeight: 1.6 }}>
            Progress is saved locally on this device.
          </p>
        </Card>
      </div>
    </div>
  );
}