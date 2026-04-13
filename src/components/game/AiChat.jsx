import { useRef, useEffect } from "react";
import InputField from "../ui/InputField";
import Btn from "../ui/Btn";

export default function AiChat({ messages, loading, input, setInput, onSend }) {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div>
      <div
        ref={chatRef}
        style={{
          height: 200,
          overflowY: "auto",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: ".75rem",
          marginBottom: ".5rem",
          display: "flex",
          flexDirection: "column",
          gap: ".5rem",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              fontSize: ".88rem",
              lineHeight: 1.6,
              padding: ".45rem .7rem",
              borderRadius: 6,
              maxWidth: "90%",
              alignSelf: m.role === "ai" ? "flex-start" : "flex-end",
              background:
                m.role === "ai" ? "rgba(124,92,224,.1)" : "rgba(82,224,122,.07)",
              border: `1px solid ${
                m.role === "ai" ? "rgba(124,92,224,.2)" : "rgba(82,224,122,.15)"
              }`,
              color: "var(--text-secondary)",
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
              padding: ".45rem .7rem",
              background: "rgba(124,92,224,.08)",
              border: "1px solid rgba(124,92,224,.15)",
              borderRadius: 6,
              alignSelf: "flex-start",
            }}
          >
            <div
              className="dot-bounce1"
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-violet)" }}
            />
            <div
              className="dot-bounce2"
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-violet)" }}
            />
            <div
              className="dot-bounce3"
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-violet)" }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: ".5rem" }}>
        <InputField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the material…"
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          style={{ flex: 1 }}
        />
        <Btn variant="primary" size="sm" onClick={onSend}>
          Send
        </Btn>
      </div>
    </div>
  );
}