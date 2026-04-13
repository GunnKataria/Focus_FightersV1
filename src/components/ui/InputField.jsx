export default function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  style = {},
  onKeyDown,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: ".65rem 1rem",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        fontSize: "1rem",
        outline: "none",
        width: "100%",
        transition: "border-color .2s",
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent-violet)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
    />
  );
}