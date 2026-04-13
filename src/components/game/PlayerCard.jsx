export default function PlayerCard({
  player,
  status = "focused",
  showHost = false,
  compact = false,
}) {
  const borderColor = {
    focused: "rgba(82,224,122,.35)",
    distracted: "rgba(224,92,92,.35)",
    warning: "rgba(245,200,66,.35)",
  }[status];

  const statusLabel = {
    focused: "🟢 Focused",
    distracted: "🔴 Distracted",
    warning: "🟡 Warning",
  }[status];

  const statusColor = {
    focused: "var(--accent-green)",
    distracted: "var(--accent-red)",
    warning: "var(--accent-gold)",
  }[status];

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: compact ? ".5rem" : ".75rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: ".35rem",
        minWidth: compact ? 70 : 88,
        position: "relative",
      }}
    >
      <div style={{ fontSize: compact ? "1.4rem" : "1.8rem", position: "relative" }}>
        {player.avatar}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: statusColor,
            border: "1px solid var(--bg-deep)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: ".68rem",
          color: "var(--text-secondary)",
          textAlign: "center",
          maxWidth: 80,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {player.name}
      </div>
      {!compact && (
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".6rem",
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: statusColor,
          }}
        >
          {statusLabel}
        </span>
      )}
      {showHost && (
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".55rem",
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "var(--accent-gold)",
          }}
        >
          HOST
        </span>
      )}
    </div>
  );
}