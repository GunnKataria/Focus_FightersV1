export function Label({ children, style = {} }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: ".68rem",
        letterSpacing: ".15em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: ".7rem",
        letterSpacing: ".15em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: ".5rem",
      }}
    >
      {children}
    </div>
  );
}

export function RuneDivider({ glyph = "⟡" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".2rem 0" }}>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(90deg,transparent,var(--border))",
        }}
      />
      <span style={{ color: "var(--text-muted)", fontSize: ".65rem" }}>{glyph}</span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(90deg,var(--border),transparent)",
        }}
      />
    </div>
  );
}