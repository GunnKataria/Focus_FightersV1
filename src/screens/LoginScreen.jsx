import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import { RuneDivider } from "../components/ui/Typography";

export default function LoginScreen() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);

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
          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: ".75rem", padding: ".9rem 1.5rem",
              background: loading ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)", borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer", transition: "all .2s",
              fontFamily: "var(--font-heading)", fontSize: ".85rem",
              letterSpacing: ".08em", color: "var(--text-primary)", marginBottom: "1rem",
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "rgba(255,255,255,.13)")}
            onMouseLeave={e => (e.currentTarget.style.background = loading ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.08)")}
          >
            {loading ? (
              <span style={{ fontSize: "1.2rem" }}>⚔️</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {loading ? "Entering the Arena…" : "Continue with Google"}
          </button>

          <RuneDivider glyph="or" />

          {/* Guest login */}
          <button
            onClick={signInAsGuest}
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
            <span>👤</span> Continue as Guest
          </button>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: ".75rem", fontFamily: "var(--font-heading)", letterSpacing: ".05em", marginTop: "1rem", lineHeight: 1.6 }}>
            Guest progress is saved locally only.<br />Sign in with Google to sync across devices.
          </p>
        </Card>
      </div>
    </div>
  );
}