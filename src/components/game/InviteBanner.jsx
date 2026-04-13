export default function InviteBanner({ invites, onAccept, onDecline }) {
  if (!invites.length) return null;

  return (
    <div style={{ position: "fixed", top: "1rem", left: "50%", transform: "translateX(-50%)", zIndex: 3000, display: "flex", flexDirection: "column", gap: ".5rem", alignItems: "center", pointerEvents: "all" }}>
      {invites.map(invite => (
        <div key={invite.id} style={{
          background: "linear-gradient(135deg, #1a7a3a, #0d5c2a)",
          border: "2px solid var(--accent-green)",
          borderRadius: 12,
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          boxShadow: "0 0 30px rgba(82,224,122,0.5), 0 4px 20px rgba(0,0,0,0.5)",
          animation: "invite-bounce 0.6s ease, invite-glow 1.5s ease-in-out infinite",
          minWidth: 360,
          maxWidth: 480,
        }}>
          <style>{`
            @keyframes invite-bounce {
              0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
              60% { transform: translateY(4px) scale(1.02); opacity: 1; }
              100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes invite-glow {
              0%,100% { box-shadow: 0 0 30px rgba(82,224,122,0.5), 0 4px 20px rgba(0,0,0,0.5); }
              50% { box-shadow: 0 0 50px rgba(82,224,122,0.8), 0 4px 20px rgba(0,0,0,0.5); }
            }
          `}</style>

          {/* Sender avatar */}
          <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>
            {invite.sender?.photo_url
              ? <img src={invite.sender.photo_url} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-green)" }} alt="" />
              : invite.sender?.avatar_emoji || "🧙"}
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: ".75rem", color: "rgba(255,255,255,0.7)", letterSpacing: ".1em", textTransform: "uppercase" }}>
              Squad Invite
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: ".95rem", color: "white", marginTop: ".15rem" }}>
              <span style={{ color: "var(--accent-green)" }}>{invite.sender?.display_name || "A friend"}</span> invited you to
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: ".85rem", color: "white", marginTop: ".1rem" }}>
              ⚔️ {invite.room_name}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", flexShrink: 0 }}>
            <button
              onClick={() => onAccept(invite)}
              style={{
                fontFamily: "var(--font-heading)", fontSize: ".72rem", letterSpacing: ".1em",
                textTransform: "uppercase", padding: ".45rem 1rem", borderRadius: 6,
                background: "var(--accent-green)", border: "none", color: "#0a1a0f",
                cursor: "pointer", fontWeight: 700, transition: "all .15s",
              }}
            >
              JOIN SQUAD
            </button>
            <button
              onClick={() => onDecline(invite.id)}
              style={{
                fontFamily: "var(--font-heading)", fontSize: ".72rem", letterSpacing: ".1em",
                textTransform: "uppercase", padding: ".45rem 1rem", borderRadius: 6,
                background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all .15s",
              }}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}