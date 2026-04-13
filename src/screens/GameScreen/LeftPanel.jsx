import HpBar from "../../components/ui/HpBar";
import Btn from "../../components/ui/Btn";
import { Label, SectionTitle, RuneDivider } from "../../components/ui/Typography";
import { BOSS_NAMES } from "../../constants";
import { formatTime } from "../../utils/formatTime";

export default function LeftPanel({
  room,
  bossHP,
  bossMaxHP,
  teamHP,
  teamMaxHP,
  bossShaking,
  teamHpShaking,
  damageNums,
  allPlayers,
  dps,
  totalDamage,
  secondsLeft,
  focusStreak,
  focused,
  onToggleFocus,
}) {
  return (
    <aside
      style={{
        gridRow: "1 / 4",            // ← ADD THIS
        gridColumn: 1,               // ← ADD THIS
        background: "var(--bg-mid)",
        borderRight: "1px solid var(--border)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: ".85rem",
        overflowY: "auto",
      }}
    >
      {/* Boss */}
      <div style={{ textAlign: "center", position: "relative", padding: ".75rem 0" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 30%,rgba(224,57,90,.06),transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            border: "1px solid rgba(224,57,90,.15)",
            pointerEvents: "none",
          }}
          className="expand-ring"
        />
        <div
          style={{
            fontSize: "4.5rem",
            filter: "drop-shadow(0 0 18px rgba(224,57,90,.6))",
            display: "inline-block",
            position: "relative",
          }}
          className={`boss-idle ${bossShaking ? "boss-attacking" : ""}`}
        >
          {room?.boss || "🐲"}
          {damageNums.map((d) => (
            <div
              key={d.id}
              style={{
                position: "absolute",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                color: d.critical ? "var(--accent-gold)" : "var(--accent-red)",
                fontSize: "1.1rem",
                top: 0,
                left: `calc(50% + ${d.x}px)`,
                transform: "translateX(-50%)",
                pointerEvents: "none",
                textShadow: "var(--glow-gold)",
                animation: "float-up 1.2s ease forwards",
                whiteSpace: "nowrap",
              }}
            >
              {d.critical ? `⚡${d.dmg}!` : `-${d.dmg}`}
            </div>
          ))}
        </div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".85rem",
            color: "var(--accent-red)",
            marginTop: ".5rem",
          }}
        >
          {BOSS_NAMES[room?.boss] || "Boss"}
        </div>
      </div>

      {/* Boss HP */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".4rem" }}>
          <Label style={{ color: "var(--accent-red)" }}>Boss HP</Label>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".78rem",
              color: "var(--accent-red)",
            }}
          >
            {Math.ceil(bossHP)}/{bossMaxHP}
          </span>
        </div>
        <HpBar value={bossHP} max={bossMaxHP} variant="boss" />
      </div>

      {/* Team HP */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".4rem" }}>
          <Label style={{ color: "var(--accent-green)" }}>Team HP</Label>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".78rem",
              color: "var(--accent-green)",
            }}
          >
            {Math.ceil(teamHP)}/{teamMaxHP}
          </span>
        </div>
        <HpBar value={teamHP} max={teamMaxHP} variant="team" shake={teamHpShaking} />
      </div>

      <RuneDivider glyph="⚔" />

      {/* Room code share */}
      {room?.code && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: ".5rem",
            padding: ".55rem .75rem",
            background: "rgba(124,92,224,.12)",
            border: "1px solid var(--accent-violet)",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Room Code
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", letterSpacing: ".15em", color: "var(--text-primary)" }}>
              {room.code}
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(room.code);
              const el = document.getElementById("ff-copy-tip");
              if (el) { el.textContent = "Copied!"; setTimeout(() => { el.textContent = "Copy"; }, 1200); }
            }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".7rem",
              letterSpacing: ".08em",
              padding: ".4rem .75rem",
              background: "var(--accent-violet)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <span id="ff-copy-tip">Copy</span>
          </button>
        </div>
      )}

      {/* Squad */}
      <div>
        <SectionTitle>⚔️ Your Squad</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
          {allPlayers.map((p) => (
            <div
              key={p.id || "me"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                padding: ".4rem .6rem",
                background: "var(--bg-elevated)",
                borderRadius: 6,
                border: `1px solid ${p.status === "focused"
                    ? "rgba(82,224,122,.3)"
                    : p.status === "distracted"
                      ? "rgba(224,92,92,.3)"
                      : "rgba(245,200,66,.3)"
                  }`,
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{p.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: ".72rem" }}>
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: ".58rem",
                    color:
                      p.status === "focused"
                        ? "var(--accent-green)"
                        : p.status === "distracted"
                          ? "var(--accent-red)"
                          : "var(--accent-gold)",
                  }}
                >
                  {p.status === "focused"
                    ? "🟢 Focused"
                    : p.status === "distracted"
                      ? "🔴 Distracted"
                      : "🟡 Warning"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RuneDivider />

      {/* Session Stats */}
      <div>
        <SectionTitle>Session Stats</SectionTitle>
        {[
          ["Damage/sec", dps, "var(--accent-violet)"],
          ["Total Damage", Math.floor(totalDamage), "var(--accent-gold)"],
          ["Time Left", formatTime(secondsLeft), "var(--text-primary)"],
          ["Focus Streak", focusStreak + "s", "var(--accent-green)"],
        ].map(([label, val, color]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: ".82rem",
              marginBottom: ".3rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-heading)", color }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <Btn
        variant="ghost"
        size="sm"
        style={{ width: "100%", fontSize: ".7rem" }}
        onClick={onToggleFocus}
      >
        {focused ? "🔴 Simulate Distraction" : "🟢 Return to Focus"}
      </Btn>
    </aside>
  );
}