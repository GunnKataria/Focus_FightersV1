export default function StudyPage({ page }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1.5rem",
        minHeight: 260,
        animation: "fadeSlideUp .3s ease",
      }}
    >
      {page.content.map((block, i) => {
        if (block.type === "h2")
          return (
            <div
              key={i}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.2rem",
                color: "var(--accent-violet)",
                marginBottom: "1rem",
                paddingBottom: ".5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {block.text}
            </div>
          );

        if (block.type === "h3")
          return (
            <div
              key={i}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: ".95rem",
                color: "var(--text-primary)",
                margin: ".9rem 0 .4rem",
              }}
            >
              {block.text}
            </div>
          );

        if (block.type === "p")
          return (
            <p
              key={i}
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                marginBottom: ".65rem",
                fontSize: ".97rem",
              }}
            >
              {block.text}
            </p>
          );

        if (block.type === "definition")
          return (
            <div
              key={i}
              style={{
                background: "rgba(124,92,224,.1)",
                borderLeft: "3px solid var(--accent-purple)",
                padding: ".7rem 1rem",
                borderRadius: "0 4px 4px 0",
                margin: ".7rem 0",
                fontStyle: "italic",
                color: "var(--text-secondary)",
                fontSize: ".95rem",
              }}
            >
              ⟨ {block.text} ⟩
            </div>
          );

        if (block.type === "highlight")
          return (
            <div
              key={i}
              style={{
                background: "rgba(245,200,66,.08)",
                borderLeft: "3px solid var(--accent-gold)",
                padding: ".7rem 1rem",
                borderRadius: "0 4px 4px 0",
                margin: ".7rem 0",
                color: "var(--text-secondary)",
                fontSize: ".95rem",
              }}
            >
              {block.text}
            </div>
          );

        if (block.type === "ul")
          return (
            <ul
              key={i}
              style={{
                paddingLeft: "1.4rem",
                color: "var(--text-secondary)",
                lineHeight: 1.85,
                fontSize: ".95rem",
              }}
            >
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );

        return null;
      })}
    </div>
  );
}