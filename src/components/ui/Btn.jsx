export default function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  className = "",
  style = {},
}) {
  const base = {
    fontFamily: "var(--font-heading)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 4,
    transition: "all .2s",
    position: "relative",
    overflow: "hidden",
    opacity: disabled ? 0.5 : 1,
  };

  const sizes = {
    sm: { padding: ".45rem 1rem", fontSize: ".72rem" },
    md: { padding: ".7rem 1.8rem", fontSize: ".82rem" },
    lg: { padding: "1rem 2.4rem", fontSize: ".95rem" },
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg,var(--accent-purple),var(--accent-violet))",
      color: "#fff",
      boxShadow: "var(--glow-purple),inset 0 1px 0 rgba(255,255,255,.12)",
    },
    gold: {
      background: "linear-gradient(135deg,var(--accent-gold-dim),var(--accent-gold))",
      color: "#1a1200",
      boxShadow: "var(--glow-gold)",
    },
    danger: {
      background: "linear-gradient(135deg,#b02040,var(--accent-red))",
      color: "#fff",
      boxShadow: "var(--glow-red)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}