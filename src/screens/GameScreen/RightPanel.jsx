import HpBar from "../../components/ui/HpBar";
import Btn from "../../components/ui/Btn";
import InputField from "../../components/ui/InputField";
import { SectionTitle, RuneDivider } from "../../components/ui/Typography";

export default function RightPanel({
  quests,
  setQuests,
  questInput,
  setQuestInput,
  player,
  focusStreak,
  combatLog,
  onQuestComplete,
}) {
  return (
    <aside
      style={{
        gridRow: "1 / 4",            // ← ADD THIS
        gridColumn: 3,               // ← ADD THIS
        background: "var(--bg-mid)",
        borderLeft: "1px solid var(--border)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: ".85rem",
        overflowY: "auto",
      }}
    >
      {/* Quest Log */}
      <div>
        <SectionTitle>📋 Quest Log</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: ".25rem" }}>
          {quests.map((q, i) => (
            <div
              key={i}
              onClick={() => {
                setQuests((qs) => {
                  const updated = [...qs];
                  updated[i].done = !updated[i].done;
                  if (updated[i].done) onQuestComplete();
                  return updated;
                });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".55rem",
                padding: ".45rem .4rem",
                borderRadius: 4,
                cursor: "pointer",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 15,
                  height: 15,
                  border: `1.5px solid ${q.done ? "var(--accent-green)" : "var(--border)"}`,
                  borderRadius: 3,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: q.done ? "var(--accent-green)" : "transparent",
                  transition: "all .2s",
                  fontSize: 9,
                  color: "white",
                }}
              >
                {q.done ? "✓" : ""}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: ".72rem",
                  color: q.done ? "var(--text-muted)" : "var(--text-secondary)",
                  textDecoration: q.done ? "line-through" : "none",
                }}
              >
                {q.text}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: ".4rem", marginTop: ".6rem" }}>
          <InputField
            value={questInput}
            onChange={(e) => setQuestInput(e.target.value)}
            placeholder="Add quest…"
            style={{ flex: 1, padding: ".45rem .75rem", fontSize: ".85rem" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && questInput.trim()) {
                setQuests((q) => [...q, { text: questInput.trim(), done: false }]);
                setQuestInput("");
              }
            }}
          />
          <Btn
            variant="primary"
            size="sm"
            onClick={() => {
              if (questInput.trim()) {
                setQuests((q) => [...q, { text: questInput.trim(), done: false }]);
                setQuestInput("");
              }
            }}
          >
            +
          </Btn>
        </div>
      </div>

      <RuneDivider />

      {/* XP Bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: ".4rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".68rem",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Level {player.level}
          </span>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".75rem",
              color: "var(--accent-gold)",
            }}
          >
            {player.xp} / {player.xpToNext} XP
          </span>
        </div>
        <HpBar value={player.xp} max={player.xpToNext} variant="xp" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".78rem",
            color: "var(--text-secondary)",
          }}
        >
          🪙 {player.coins}
        </span>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".78rem",
            color: "var(--accent-gold)",
          }}
        >
          🔥 Streak: {focusStreak}s
        </span>
      </div>

      <RuneDivider />

      {/* Combat Log */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <SectionTitle>⚔️ Combat Log</SectionTitle>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: ".25rem",
          }}
        >
          {combatLog.map((entry, i) => (
            <div
              key={i}
              style={{
                fontSize: ".78rem",
                color: {
                  info: "var(--text-muted)",
                  success: "var(--accent-green)",
                  danger: "var(--accent-red)",
                  gold: "var(--accent-gold)",
                }[entry.type],
              }}
            >
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}