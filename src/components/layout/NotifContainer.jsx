export default function NotifContainer({ notifs }) {
  const icons = { success: "✅", danger: "⚠️", info: "ℹ️", gold: "⭐" };
  const colors = {
    success: "var(--accent-green)",
    danger: "var(--accent-red)",
    info: "var(--accent-violet)",
    gold: "var(--accent-gold)",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: ".4rem",
        pointerEvents: "none",
      }}
    >
      {notifs.map((n) => (
        <div
          key={n.id}
          className="animate-notif"
          style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${colors[n.type]}`,
            borderRadius: 8,
            padding: ".65rem 1.1rem",
            fontFamily: "var(--font-heading)",
            fontSize: ".75rem",
            letterSpacing: ".05em",
            maxWidth: 300,
            display: "flex",
            alignItems: "center",
            gap: ".6rem",
            color: colors[n.type],
            boxShadow:
              n.type === "gold"
                ? "var(--glow-gold)"
                : n.type === "success"
                ? "var(--glow-green)"
                : "none",
          }}
        >
          <span>{icons[n.type]}</span>
          <span>{n.msg}</span>
        </div>
      ))}
    </div>
  );
}