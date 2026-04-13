export default function Card({ children, glow = false, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${glow ? "rgba(107,90,237,.4)" : "var(--border)"}`,
        borderRadius: 8,
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: glow ? "var(--glow-purple)" : "none",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg,transparent,var(--border-glow),transparent)",
          opacity: 0.4,
        }}
      />
      {children}
    </div>
  );
}