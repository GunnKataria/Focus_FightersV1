export default function HpBar({ value, max, variant = "boss", shake = false }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const fills = {
    boss: {
      background: "linear-gradient(90deg,#8b0000,#e0395a,#ff6b8a)",
      boxShadow: "0 0 12px rgba(224,57,90,.6)",
    },
    team: {
      background: "linear-gradient(90deg,#1a7a3a,#52e07a,#8cf5ae)",
      boxShadow: "0 0 12px rgba(82,224,122,.5)",
    },
    xp: {
      background: "linear-gradient(90deg,var(--accent-gold-dim),var(--accent-gold))",
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: 16,
        background: "rgba(0,0,0,.5)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,.07)",
        overflow: "hidden",
      }}
      className={shake ? "hp-shake" : ""}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 8,
          transition: "width .5s ease",
          width: `${pct}%`,
          position: "relative",
          ...fills[variant],
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 0,
            right: 0,
            height: 4,
            background: "rgba(255,255,255,.25)",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}