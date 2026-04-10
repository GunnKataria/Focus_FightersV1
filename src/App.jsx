import { useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useNotifications } from "./hooks/useNotifications";
import StarField from "./components/layout/StarField";
import NotifContainer from "./components/layout/NotifContainer";
import LoginScreen from "./screens/LoginScreen";
import LobbyScreen from "./screens/LobbyScreen";
import GameScreen from "./screens/GameScreen";
import { AVATARS } from "./constants";

// Inner app — has access to AuthContext
function AppInner() {
  const { notifs, push } = useNotifications();
  const { session, authLoading, googleName, googleAvatar, signOut } = useAuth();

  const [screen, setScreen] = useState("login");
  const [player, setPlayer] = useState({
    name: "",
    avatar: "🧙",
    xp: 0,
    coins: 0,
    level: 1,
    xpToNext: 100,
    photoUrl: null,
  });
  const [activeRoom, setActiveRoom] = useState(null);

  // ── Auto-redirect based on session ──────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (session) {
      // Seed player from Google profile (only on first login)
      setPlayer((p) => ({
        ...p,
        name: p.name || googleName || "Warrior",
        photoUrl: p.photoUrl || googleAvatar || null,
        // Pick a random avatar if they haven't customised yet
        avatar: p.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      }));
      // Only redirect to lobby if we're on the login screen
      setScreen((s) => (s === "login" ? "lobby" : s));
      if (screen === "login") {
        push(`Welcome back, ${googleName?.split(" ")[0] || "Warrior"}! ⚔️`, "success");
      }
    } else {
      // Session expired or signed out — back to login
      setScreen("login");
    }
  }, [session, authLoading]);

  const handleStartRaid = (room) => { setActiveRoom(room); setScreen("game"); };
  const handleGoLobby = () => { setScreen("lobby"); setActiveRoom(null); };

  // Show nothing while checking session (prevents flash)
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--accent-violet)", textShadow: "0 0 30px rgba(124,92,224,.8)", animation: "boss-idle 2s ease-in-out infinite" }}>
          ⚔️ Loading…
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ push }}>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <StarField />
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 50% at 20% 0%,rgba(124,92,224,.1) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 100%,rgba(82,224,122,.05) 0%,transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

        {screen === "login" && <LoginScreen />}

        {screen === "lobby" && (
          <LobbyScreen
            player={player}
            onUpdatePlayer={setPlayer}
            onStartRaid={handleStartRaid}
            onSignOut={signOut}
          />
        )}

        {screen === "game" && (
          <GameScreen
            player={player}
            room={activeRoom}
            onUpdatePlayer={setPlayer}
            onGoLobby={handleGoLobby}
          />
        )}

        <NotifContainer notifs={notifs} />
      </div>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}