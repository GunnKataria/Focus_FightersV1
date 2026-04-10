import { useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useNotifications } from "./hooks/useNotifications";
import StarField from "./components/layout/StarField";
import NotifContainer from "./components/layout/NotifContainer";
import LoginScreen from "./screens/LoginScreen";
import LobbyScreen from "./screens/LobbyScreen";
import GameScreen from "./screens/GameScreen";

function AppInner() {
  const { notifs, push } = useNotifications();
  const { authLoading, isLoggedIn, profile, signOut } = useAuth();

  const [screen, setScreen]       = useState("login");
  const [player, setPlayer]       = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);

  // ── Sync player state from profile ──────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn && profile) {
      setPlayer({
        name:     profile.display_name,
        avatar:   profile.avatar_emoji,
        photoUrl: profile.photo_url,
        email:    profile.email,
        xp:       profile.xp       ?? 0,
        coins:    profile.coins     ?? 0,
        level:    profile.level     ?? 1,
        xpToNext: profile.xp_to_next ?? 100,
        isGuest:  profile.is_guest  ?? false,
      });
      setScreen(s => s === "login" ? "lobby" : s);
      if (screen === "login") {
        push(`Welcome, ${profile.display_name?.split(" ")[0]}! ⚔️`, "success");
      }
    } else if (!isLoggedIn) {
      setScreen("login");
      setPlayer(null);
    }
  }, [isLoggedIn, profile, authLoading]);

  const handleStartRaid = (room) => { setActiveRoom(room); setScreen("game"); };
  const handleGoLobby   = () => { setScreen("lobby"); setActiveRoom(null); };

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

        {screen === "login"  && <LoginScreen />}
        {screen === "lobby"  && player && <LobbyScreen player={player} onUpdatePlayer={setPlayer} onStartRaid={handleStartRaid} />}
        {screen === "game"   && player && <GameScreen  player={player} room={activeRoom} onUpdatePlayer={setPlayer} onGoLobby={handleGoLobby} />}

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