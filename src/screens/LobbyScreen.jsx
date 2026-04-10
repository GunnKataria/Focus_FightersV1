import { useState, useRef } from "react";
import { DEMO_SQUAD, DEMO_ROOMS, AVATARS } from "../constants";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import InputField from "../components/ui/InputField";
import { RuneDivider, Label, SectionTitle } from "../components/ui/Typography";
import PlayerCard from "../components/game/PlayerCard";

export default function LobbyScreen({ player, onUpdatePlayer, onStartRaid }) {
  const { push } = useApp();
  const { profile, googleAvatar, signOut, updateProfile, uploadAvatar } = useAuth();

  // ── Room state ───────────────────────────────────────────────
  const [roomName, setRoomName]       = useState("");
  const [duration, setDuration]       = useState(25);
  const [bossType, setBossType]       = useState("🐲");
  const [joinCode, setJoinCode]       = useState("");
  const [room, setRoom]               = useState(null);
  const [isHost, setIsHost]           = useState(false);
  const [squadExtras, setSquadExtras] = useState(0);

  // ── Profile modal state ──────────────────────────────────────
  const [profileOpen, setProfileOpen]     = useState(false);
  const [editName, setEditName]           = useState("");
  const [editAvatar, setEditAvatar]       = useState("");
  const [previewUrl, setPreviewUrl]       = useState(""); // local blob preview
  const [uploadFile, setUploadFile]       = useState(null); // File object to upload
  const [saving, setSaving]               = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [dragOver, setDragOver]           = useState(false);
  const fileInputRef = useRef(null);

  // ── Open profile modal ───────────────────────────────────────
  const openProfile = () => {
    setEditName(profile?.display_name ?? player.name);
    setEditAvatar(profile?.avatar_emoji ?? player.avatar);
    setPreviewUrl(profile?.photo_url ?? player.photoUrl ?? "");
    setUploadFile(null);
    setProfileOpen(true);
  };

  // ── Handle image file selection ──────────────────────────────
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      push("⚠️ Please select an image file", "danger"); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      push("⚠️ Image must be under 5MB", "danger"); return;
    }
    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // instant local preview
  };

  const handleFileInput = (e) => handleImageFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const removePhoto = () => {
    setUploadFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Save profile ─────────────────────────────────────────────
  const saveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);

    let photoUrl = profile?.photo_url ?? null;

    // Upload new image if one was selected
    if (uploadFile) {
      setUploading(true);
      const url = await uploadAvatar(uploadFile);
      setUploading(false);
      if (url) {
        photoUrl = url;
      } else {
        push("⚠️ Image upload failed, profile saved without new photo", "danger");
      }
    } else if (previewUrl === "") {
      // User explicitly removed photo
      photoUrl = null;
    }

    await updateProfile({
      display_name: editName.trim(),
      avatar_emoji: editAvatar,
      photo_url:    photoUrl,
    });

    onUpdatePlayer(p => ({
      ...p,
      name:     editName.trim(),
      avatar:   editAvatar,
      photoUrl: photoUrl,
    }));

    setSaving(false);
    setProfileOpen(false);
    push("✅ Profile updated!", "success");
  };

  // ── Room helpers ─────────────────────────────────────────────
  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom({ name: roomName || "Study Session", duration, boss: bossType, code });
    setIsHost(true);
    push(`Room created! Code: ${code}`, "success");
    setTimeout(() => { setSquadExtras(1); push(`${DEMO_SQUAD[0].name} joined!`, "info"); }, 1200);
    setTimeout(() => { setSquadExtras(2); push(`${DEMO_SQUAD[1].name} joined!`, "info"); }, 2200);
  };

  const joinRoom = (r) => {
    setRoom(r || { name: "Study Session", duration: 25, boss: "🐲", code: joinCode.toUpperCase() });
    setIsHost(false);
    push("Joined room!", "success");
    setTimeout(() => { setSquadExtras(1); push(`${DEMO_SQUAD[0].name} is here!`, "info"); }, 800);
  };

  const squad        = [player, ...DEMO_SQUAD.slice(0, squadExtras)];
  const displayPhoto = player.photoUrl || googleAvatar;

  const selectStyle = {
    background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6,
    padding: ".65rem 1rem", color: "var(--text-primary)", fontFamily: "var(--font-body)",
    fontSize: "1rem", width: "100%", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: 900, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", textShadow: "0 0 30px rgba(124,92,224,.6)" }}>
          ⚔️ Focus Fighters
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {[["⚡", "XP", player.xp], ["🪙", "", player.coins], ["🏆", "Lv.", player.level]].map(([icon, label, val]) => (
            <div key={icon} style={{ display: "flex", alignItems: "center", gap: ".35rem", fontFamily: "var(--font-heading)", fontSize: ".82rem", color: "var(--text-secondary)" }}>
              <span>{icon}</span><span>{label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{val}</span>
            </div>
          ))}

          <div style={{ width: 1, height: 28, background: "var(--border)" }} />

          {/* Clickable profile chip */}
          <div
            onClick={openProfile}
            title="Edit Profile"
            style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer", padding: ".4rem .75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-violet)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt="avatar" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-violet)" }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-surface)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                {player.avatar}
              </div>
            )}
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: ".78rem", color: "var(--text-primary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {player.name}
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: ".6rem", color: "var(--accent-violet)", letterSpacing: ".05em" }}>
                {profile?.is_guest ? "👤 Guest" : "✏️ Edit Profile"}
              </div>
            </div>
          </div>

          <Btn variant="ghost" size="sm" onClick={signOut}>
            {profile?.is_guest ? "Sign In" : "Sign Out"}
          </Btn>
        </div>
      </div>

      {/* ── Room Grid ── */}
      <div style={{ width: "100%", maxWidth: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        <Card>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--accent-violet)", marginBottom: "1rem" }}>⚔️ Create a Boss Raid</div>
          <div style={{ marginBottom: ".85rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Session Name</Label>
            <InputField value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="e.g. Biology Finals…" />
          </div>
          <div style={{ marginBottom: ".85rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Duration</Label>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={selectStyle}>
              <option value={25}>25 minutes (Pomodoro)</option>
              <option value={45}>45 minutes (Standard)</option>
              <option value={60}>60 minutes (Endurance)</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Boss</Label>
            <select value={bossType} onChange={e => setBossType(e.target.value)} style={selectStyle}>
              <option value="🐲">🐲 Shadow Drake — Medium</option>
              <option value="💀">💀 Lich King — Hard</option>
              <option value="👾">👾 Void Titan — Extreme</option>
              <option value="🧿">🧿 Crystal Golem — Easy</option>
            </select>
          </div>
          <Btn variant="primary" style={{ width: "100%" }} onClick={createRoom}>Create Raid Room</Btn>
        </Card>

        <Card>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--accent-gold)", marginBottom: "1rem" }}>🔗 Join a Raid</div>
          <div style={{ marginBottom: ".85rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Room Code</Label>
            <InputField value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-digit code…" style={{ letterSpacing: ".2em", fontFamily: "var(--font-heading)" }} />
          </div>
          <Btn variant="gold" style={{ width: "100%", marginBottom: "1rem" }} onClick={() => joinRoom(null)}>Join Raid</Btn>
          <RuneDivider glyph="or" />
          <SectionTitle style={{ marginTop: ".75rem" }}>Active Rooms</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginTop: ".4rem" }}>
            {DEMO_ROOMS.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".6rem .75rem", background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: ".82rem" }}>{r.boss} {r.name}</div>
                  <Label>{r.players} players · {r.duration}min</Label>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => joinRoom(r)}>Join</Btn>
              </div>
            ))}
          </div>
        </Card>

        {room && (
          <div style={{ gridColumn: "1/-1" }}>
            <Card glow>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem" }}>⚔️ {room.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".25rem" }}>
                    <Label>Room Code:</Label>
                    <span style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)", fontSize: "1rem", letterSpacing: ".2em" }}>{room.code}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <Btn variant="ghost" size="sm" onClick={() => setRoom(null)}>Leave</Btn>
                  {isHost && <Btn variant="primary" onClick={() => onStartRaid(room)}>⚔️ Start Raid</Btn>}
                </div>
              </div>
              <SectionTitle>Warriors ({squad.length}/6)</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", marginTop: ".5rem" }}>
                {squad.map((p, i) => (
                  <PlayerCard key={p.id || "me"} player={p} status="focused" showHost={i === 0} />
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Profile Edit Modal ── */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth={480}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--accent-violet)" }}>⚔️ Edit Profile</div>
          <Btn variant="ghost" size="sm" onClick={() => setProfileOpen(false)}>✕</Btn>
        </div>

        {/* ── Photo upload area ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem", gap: ".75rem" }}>

          {/* Preview circle */}
          <div style={{ position: "relative" }}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--accent-violet)", display: "block" }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--bg-elevated)", border: "3px solid var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem" }}>
                {editAvatar}
              </div>
            )}
            {/* Camera overlay button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--accent-violet)", border: "2px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: ".9rem" }}
              title="Upload photo"
            >
              📷
            </div>
          </div>

          {/* Drag & drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: ".75rem", borderRadius: 8, cursor: "pointer",
              border: `2px dashed ${dragOver ? "var(--accent-violet)" : "var(--border)"}`,
              background: dragOver ? "rgba(124,92,224,.08)" : "transparent",
              textAlign: "center", transition: "all .2s",
            }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontSize: ".72rem", color: dragOver ? "var(--accent-violet)" : "var(--text-muted)", letterSpacing: ".08em" }}>
              {uploading ? "⏳ Uploading…" : "📁 Click or drag & drop an image"}
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: ".6rem", color: "var(--text-muted)", marginTop: ".25rem" }}>
              JPG, PNG, GIF, WebP · Max 5MB
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileInput}
          />

          {/* Remove photo button */}
          {previewUrl && (
            <Btn variant="ghost" size="sm" onClick={removePhoto}>
              🗑 Remove Photo
            </Btn>
          )}
        </div>

        {/* Display name */}
        <div style={{ marginBottom: "1rem" }}>
          <Label style={{ display: "block", marginBottom: ".4rem" }}>Display Name</Label>
          <InputField
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="Enter warrior name…"
            onKeyDown={e => e.key === "Enter" && saveProfile()}
          />
        </div>

        {/* Email read-only */}
        {profile?.email && (
          <div style={{ marginBottom: "1rem" }}>
            <Label style={{ display: "block", marginBottom: ".4rem" }}>Email</Label>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6, padding: ".65rem 1rem", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: ".95rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span>📧</span>{profile.email}
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-heading)", fontSize: ".6rem", color: "var(--accent-green)", background: "rgba(82,224,122,.1)", padding: ".2rem .5rem", borderRadius: 10, border: "1px solid rgba(82,224,122,.2)" }}>Verified</span>
            </div>
          </div>
        )}

        <RuneDivider />

        {/* Avatar emoji picker */}
        <div style={{ margin: "1rem 0" }}>
          <Label style={{ display: "block", marginBottom: ".6rem" }}>Warrior Avatar <span style={{ color: "var(--text-muted)", fontSize: ".6rem" }}>(used when no photo)</span></Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
            {AVATARS.map(a => (
              <span key={a} onClick={() => setEditAvatar(a)} style={{
                fontSize: "1.8rem", cursor: "pointer", padding: ".3rem", borderRadius: 6,
                border: `2px solid ${editAvatar === a ? "var(--accent-violet)" : "transparent"}`,
                background: editAvatar === a ? "rgba(124,92,224,.12)" : "transparent",
                transition: "all .15s",
              }}>{a}</span>
            ))}
          </div>
        </div>

        {/* Guest nudge */}
        {profile?.is_guest && (
          <div style={{ background: "rgba(245,200,66,.08)", border: "1px solid rgba(245,200,66,.2)", borderRadius: 8, padding: ".75rem 1rem", marginBottom: "1rem", fontFamily: "var(--font-heading)", fontSize: ".75rem", color: "var(--accent-gold)", lineHeight: 1.6 }}>
            🌟 Sign in with Google to sync your profile and XP across all devices!
          </div>
        )}

        <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
          <Btn variant="ghost" style={{ flex: 1 }} onClick={() => setProfileOpen(false)}>Cancel</Btn>
          <Btn variant="primary" style={{ flex: 2 }} onClick={saveProfile} disabled={saving || uploading || !editName.trim()}>
            {uploading ? "⏳ Uploading…" : saving ? "💾 Saving…" : "💾 Save Profile"}
          </Btn>
        </div>
      </Modal>

    </div>
  );
}