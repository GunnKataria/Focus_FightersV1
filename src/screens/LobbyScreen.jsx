import { useState } from "react";
import { DEMO_SQUAD, DEMO_ROOMS } from "../constants";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import { RuneDivider, Label, SectionTitle } from "../components/ui/Typography";
import PlayerCard from "../components/game/PlayerCard";

export default function LobbyScreen({ player, onStartRaid }) {
  const { push } = useApp();
  const { googleAvatar, googleName, signOut } = useAuth();
  const [roomName, setRoomName] = useState("");
  const [duration, setDuration] = useState(25);
  const [bossType, setBossType] = useState("🐲");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [squadExtras, setSquadExtras] = useState(0);

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom({ name: roomName || "Study Session", duration, boss: bossType, code });
    setIsHost(true);
    push(`Room created! Code: ${code}`, "success");
    setTimeout(() => {
      setSquadExtras(1);
      push(`${DEMO_SQUAD[0].name} joined!`, "info");
    }, 1200);
    setTimeout(() => {
      setSquadExtras(2);
      push(`${DEMO_SQUAD[1].name} joined!`, "info");
    }, 2200);
  };

  const joinRoom = (r) => {
    setRoom(
      r || {
        name: "Study Session",
        duration: 25,
        boss: "🐲",
        code: joinCode.toUpperCase(),
      }
    );
    setIsHost(false);
    push("Joined room!", "success");
    setTimeout(() => {
      setSquadExtras(1);
      push(`${DEMO_SQUAD[0].name} is here!`, "info");
    }, 800);
  };

  const squad = [player, ...DEMO_SQUAD.slice(0, squadExtras)];

  const selectStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: ".65rem 1rem",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              textShadow: "0 0 30px rgba(124,92,224,.6)",
              marginBottom: "1rem"
            }}
          >
            ⚔️ Focus Fighters
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            {/* Google profile photo */}
            {googleAvatar ? (
              <img
                src={googleAvatar}
                alt="profile"
                style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--accent-violet)", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                {player.avatar}
              </div>
            )}
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: ".85rem", color: "var(--text-primary)" }}>
                {player.name}
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: ".65rem", color: "var(--text-muted)", letterSpacing: ".1em" }}>
                {googleName}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {[
            ["⚡", "XP", player.xp],
            ["🪙", "", player.coins],
            ["🏆", "Lv.", player.level],
          ].map(([icon, label, val]) => (
            <div
              key={icon}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".35rem",
                fontFamily: "var(--font-heading)",
                fontSize: ".82rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{val}</span>
            </div>
          ))}
          
          {/* Sign out button */}
          <div style={{ marginLeft: "1rem", borderLeft: "1px solid var(--border)", paddingLeft: "1rem" }}>
            <Btn variant="ghost" size="sm" onClick={signOut}>Sign Out</Btn>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Create Room */}
        <Card>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              color: "var(--accent-violet)",
              marginBottom: "1rem",
            }}
          >
            ⚔️ Create a Boss Raid
          </div>
          <div style={{ marginBottom: ".85rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Session Name</Label>
            <InputField
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Biology Finals…"
            />
          </div>
          <div style={{ marginBottom: ".85rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Duration</Label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={selectStyle}
            >
              <option value={25}>25 minutes (Pomodoro)</option>
              <option value={45}>45 minutes (Standard)</option>
              <option value={60}>60 minutes (Endurance)</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Boss</Label>
            <select
              value={bossType}
              onChange={(e) => setBossType(e.target.value)}
              style={selectStyle}
            >
              <option value="🐲">🐲 Shadow Drake — Medium</option>
              <option value="💀">💀 Lich King — Hard</option>
              <option value="👾">👾 Void Titan — Extreme</option>
              <option value="🧿">🧿 Crystal Golem — Easy</option>
            </select>
          </div>
          <Btn variant="primary" style={{ width: "100%" }} onClick={createRoom}>
            Create Raid Room
          </Btn>
        </Card>

        {/* Join Room */}
        <Card>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              color: "var(--accent-gold)",
              marginBottom: "1rem",
            }}
          >
            🔗 Join a Raid
          </div>
          <div style={{ marginBottom: ".85rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Room Code</Label>
            <InputField
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code…"
              style={{ letterSpacing: ".2em", fontFamily: "var(--font-heading)" }}
            />
          </div>
          <Btn
            variant="gold"
            style={{ width: "100%", marginBottom: "1rem" }}
            onClick={() => joinRoom(null)}
          >
            Join Raid
          </Btn>
          <RuneDivider glyph="or" />
          <SectionTitle style={{ marginTop: ".75rem" }}>Active Rooms</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginTop: ".4rem" }}>
            {DEMO_ROOMS.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: ".6rem .75rem",
                  background: "var(--bg-elevated)",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: ".82rem" }}>
                    {r.boss} {r.name}
                  </div>
                  <Label>
                    {r.players} players · {r.duration}min
                  </Label>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => joinRoom(r)}>
                  Join
                </Btn>
              </div>
            ))}
          </div>
        </Card>

        {/* Waiting Room */}
        {room && (
          <div style={{ gridColumn: "1/-1" }}>
            <Card glow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem" }}>
                    ⚔️ {room.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      marginTop: ".25rem",
                    }}
                  >
                    <Label>Room Code:</Label>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--accent-gold)",
                        fontSize: "1rem",
                        letterSpacing: ".2em",
                      }}
                    >
                      {room.code}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <Btn variant="ghost" size="sm" onClick={() => setRoom(null)}>
                    Leave
                  </Btn>
                  {isHost && (
                    <Btn variant="primary" onClick={() => onStartRaid(room)}>
                      ⚔️ Start Raid
                    </Btn>
                  )}
                </div>
              </div>
              <SectionTitle>Warriors ({squad.length}/6)</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", marginTop: ".5rem" }}>
                {squad.map((p, i) => (
                  <PlayerCard
                    key={p.id || "me"}
                    player={p}
                    status="focused"
                    showHost={i === 0}
                  />
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}