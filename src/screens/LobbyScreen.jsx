import { useState, useRef, useEffect } from "react";
import { AVATARS } from "../constants";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import InputField from "../components/ui/InputField";
import { RuneDivider, Label, SectionTitle } from "../components/ui/Typography";
import PlayerCard from "../components/game/PlayerCard";
import FriendsPanel from "../components/game/FriendsPanel";
import InviteBanner from "../components/game/InviteBanner";

export default function LobbyScreen({ player, onUpdatePlayer, onStartRaid }) {
  const { push, multiplayer } = useApp();
  const { profile, googleAvatar, signOut, updateProfile, uploadAvatar } = useAuth();
  const {
    liveRoom, liveMembers, friends, pendingInvites, loadingRoom,
    searchByEmail, sendFriendRequest, respondFriendRequest,
    removeFriend, createLiveRoom, joinLiveRoomByCode, leaveLiveRoom,
    startLiveRoom, inviteFriend, acceptInvite, declineInvite,
  } = multiplayer;

  // ── Room form state ──────────────────────────────────────────
  const [roomName, setRoomName] = useState("");
  const [duration, setDuration] = useState(25);
  const [bossType, setBossType] = useState("🐲");
  const [joinCode, setJoinCode] = useState("");

  // ── UI state ─────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState("rooms"); // "rooms" | "friends"
  const [profileOpen, setProfileOpen] = useState(false);

  // ── Profile edit state ───────────────────────────────────────
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── Profile handlers ─────────────────────────────────────────
  const openProfile = () => {
    setEditName(profile?.display_name ?? player.name);
    setEditAvatar(profile?.avatar_emoji ?? player.avatar);
    setPreviewUrl(profile?.photo_url ?? player.photoUrl ?? "");
    setUploadFile(null);
    setProfileOpen(true);
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { push("⚠️ Select an image file", "danger"); return; }
    if (file.size > 5 * 1024 * 1024) { push("⚠️ Image must be under 5MB", "danger"); return; }
    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    let photoUrl = profile?.photo_url ?? null;
    if (uploadFile) {
      setUploading(true);
      const url = await uploadAvatar(uploadFile);
      setUploading(false);
      if (url) photoUrl = url;
      else push("⚠️ Image upload failed", "danger");
    } else if (previewUrl === "") {
      photoUrl = null;
    }
    await updateProfile({ display_name: editName.trim(), avatar_emoji: editAvatar, photo_url: photoUrl });
    onUpdatePlayer(p => ({ ...p, name: editName.trim(), avatar: editAvatar, photoUrl }));
    setSaving(false);
    setProfileOpen(false);
    push("✅ Profile updated!", "success");
  };

  // ── Room handlers ─────────────────────────────────────────────
  const handleCreateRoom = async () => {
  console.log("[UI] handleCreateRoom called");
  const room = await createLiveRoom({
    name: roomName || "Study Session",
    duration,
    boss: bossType,
  });
  if (room) {
    push(`Room created! Code: ${room.code}`, "success");
  } else {
    push("⚠️ Failed to create room — try again", "danger");
  }
};
  const handleJoinRoom = async (codeOverride) => {
    const code = codeOverride || joinCode;
    if (!code.trim()) return;
    const room = await joinLiveRoomByCode(code);
    if (room) push(`Joined ${room.name}!`, "success");
    else push("⚠️ Room not found or already started", "danger");
  };

  const handleStartRaid = async () => {
    if (!liveRoom) return;
    // Host writes status='active' to the DB so all members receive a
    // postgres_changes event. Without this, non-host clients sit forever
    // on "Waiting for host to start…" because nothing flips the flag.
    const updated = await startLiveRoom();
    const room = updated || liveRoom;
    onStartRaid({ ...room, members: liveMembers });
  };

  // Non-host auto-navigation: when realtime delivers status='active', jump
  // into the game screen the same way the host does. Fires exactly once
  // because LobbyScreen unmounts on navigation.
  const isHostRef = useRef(false);
  isHostRef.current = liveRoom?.host_id === profile?.id;
  useEffect(() => {
    if (liveRoom?.status === "active" && !isHostRef.current) {
      onStartRaid({ ...liveRoom, members: liveMembers });
    }
  }, [liveRoom?.status, liveRoom?.id]);

  const handleAcceptInvite = async (invite) => {
    const room = await acceptInvite(invite);
    if (room) push(`Joined ${room.name}!`, "success");
  };

  const handleInviteFriend = async (friendId) => {
    await inviteFriend(friendId, liveRoom);
    push("⚔️ Invite sent!", "success");
  };

  const isHost = liveRoom?.host_id === profile?.id;
  const displayPhoto = player.photoUrl || googleAvatar;

  const selectStyle = {
    background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6,
    padding: ".65rem 1rem", color: "var(--text-primary)", fontFamily: "var(--font-body)",
    fontSize: "1rem", width: "100%", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── Live invite banners ── */}
      <InviteBanner
        invites={pendingInvites}
        onAccept={handleAcceptInvite}
        onDecline={declineInvite}
      />

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: 1000, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
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
          <div onClick={openProfile} title="Edit Profile"
            style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer", padding: ".4rem .75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-violet)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}>
            {displayPhoto
              ? <img src={displayPhoto} alt="avatar" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-violet)" }} />
              : <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-surface)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{player.avatar}</div>
            }
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: ".78rem", color: "var(--text-primary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: ".6rem", color: "var(--accent-violet)", letterSpacing: ".05em" }}>{profile?.is_guest ? "👤 Guest" : "✏️ Edit Profile"}</div>
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={signOut}>{profile?.is_guest ? "Sign In" : "Sign Out"}</Btn>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ width: "100%", maxWidth: 1000, display: "flex", gap: ".5rem", marginBottom: "1.25rem" }}>
        {[["rooms", "⚔️ Raids"], ["friends", `👥 Friends${friends.filter(f => f.status === "accepted").length ? ` (${friends.filter(f => f.status === "accepted").length})` : ""}`]].map(([id, label]) => (
          <button key={id} onClick={() => setActivePanel(id)} style={{
            fontFamily: "var(--font-heading)", fontSize: ".8rem", letterSpacing: ".1em",
            textTransform: "uppercase", padding: ".6rem 1.5rem", borderRadius: 6,
            background: activePanel === id ? "rgba(124,92,224,.2)" : "transparent",
            border: `1px solid ${activePanel === id ? "var(--accent-violet)" : "var(--border)"}`,
            color: activePanel === id ? "var(--accent-violet)" : "var(--text-muted)",
            cursor: "pointer", transition: "all .2s",
          }}>{label}</button>
        ))}
        {/* Pending invite badge */}
        {friends.filter(f => f.status === "pending" && !f.isRequester).length > 0 && (
          <div onClick={() => setActivePanel("friends")} style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".6rem 1rem", borderRadius: 6, background: "rgba(245,200,66,.1)", border: "1px solid rgba(245,200,66,.3)", cursor: "pointer" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: ".75rem", color: "var(--accent-gold)" }}>
              📬 {friends.filter(f => f.status === "pending" && !f.isRequester).length} request{friends.filter(f => f.status === "pending" && !f.isRequester).length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── RAIDS PANEL ── */}
      {activePanel === "rooms" && (
        <div style={{ width: "100%", maxWidth: 1000, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

          {/* Create Room */}
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
            <Btn variant="primary" style={{ width: "100%" }} onClick={handleCreateRoom} disabled={loadingRoom}>
              {loadingRoom ? "Creating…" : "Create Raid Room"}
            </Btn>
          </Card>

          {/* Join Room */}
          <Card>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--accent-gold)", marginBottom: "1rem" }}>🔗 Join a Raid</div>
            <div style={{ marginBottom: ".85rem" }}>
              <Label style={{ display: "block", marginBottom: ".4rem" }}>Room Code</Label>
              <InputField value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-digit code…" style={{ letterSpacing: ".2em", fontFamily: "var(--font-heading)" }}
                onKeyDown={e => e.key === "Enter" && handleJoinRoom()} />
            </div>
            <Btn variant="gold" style={{ width: "100%", marginBottom: "1rem" }} onClick={() => handleJoinRoom()}>Join Raid</Btn>
          </Card>

          {/* Live Waiting Room */}
          {liveRoom && (
            <div style={{ gridColumn: "1/-1" }}>
              <Card glow>
                {/* Mission Briefing header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: ".68rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: ".3rem" }}>
                      🎯 Mission Briefing
                    </div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem" }}>
                      {liveRoom.boss} {liveRoom.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: ".4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                        <Label>Code:</Label>
                        <span style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)", fontSize: "1rem", letterSpacing: ".2em" }}>{liveRoom.code}</span>
                        <button onClick={() => { navigator.clipboard.writeText(liveRoom.code); push("Copied!", "success"); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: ".8rem" }}>📋</button>
                      </div>
                      <Label>{liveRoom.duration}min · {liveMembers.length}/6 warriors</Label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                    <Btn variant="ghost" size="sm" onClick={() => leaveLiveRoom()}>Leave</Btn>
                    <Btn variant="primary" onClick={handleStartRaid}>
                      ⚔️ Start Raid ({liveMembers.length})
                    </Btn>
                  </div>
                </div>

                <RuneDivider />

                {/* Live squad list */}
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
                    <SectionTitle>⚔️ Warriors ({liveMembers.length}/6)</SectionTitle>
                    {!isHost && <Label style={{ color: "var(--text-muted)" }}>Waiting for host to start…</Label>}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
                    {liveMembers.map((m, i) => (
                      <div key={m.id} style={{
                        background: "var(--bg-elevated)", border: `1px solid ${m.user_id === liveRoom.host_id ? "rgba(124,92,224,.4)" : "var(--border)"}`,
                        borderRadius: 8, padding: ".75rem", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: ".35rem", minWidth: 90, position: "relative",
                        animation: "fadeSlideUp .3s ease",
                      }}>
                        {/* Avatar */}
                        {m.photo_url
                          ? <img src={m.photo_url} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-violet)" }} alt="" />
                          : <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-surface)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{m.avatar_emoji}</div>
                        }
                        {/* Name */}
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: ".7rem", color: "var(--text-secondary)", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.display_name}</div>
                        {/* Device indicator */}
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: ".6rem", color: "var(--text-muted)" }}>
                          {m.device === "mobile" ? "📱" : "💻"}
                        </div>
                        {/* Host badge */}
                        {m.user_id === liveRoom.host_id && (
                          <div style={{ position: "absolute", top: -6, right: -6, background: "var(--accent-gold)", color: "#1a1200", borderRadius: 10, padding: ".1rem .4rem", fontFamily: "var(--font-heading)", fontSize: ".55rem", fontWeight: 700 }}>HOST</div>
                        )}
                        {/* Online pulse */}
                        <div style={{ position: "absolute", bottom: 6, left: 6, width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px var(--accent-green)", animation: "ring-pulse 2s ease-in-out infinite" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite friends shortcut */}
                {!profile?.is_guest && friends.filter(f => f.status === "accepted").length > 0 && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <SectionTitle style={{ marginBottom: ".6rem" }}>⚡ Quick Invite Friends</SectionTitle>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
                      {friends.filter(f => f.status === "accepted").map(f => (
                        <button key={f.friendshipId} onClick={() => handleInviteFriend(f.id)} style={{
                          display: "flex", alignItems: "center", gap: ".5rem", padding: ".4rem .75rem",
                          background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20,
                          cursor: "pointer", fontFamily: "var(--font-heading)", fontSize: ".72rem",
                          color: "var(--text-secondary)", transition: "all .2s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-green)"; e.currentTarget.style.color = "var(--accent-green)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                          {f.photo_url
                            ? <img src={f.photo_url} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} alt="" />
                            : <span>{f.avatar_emoji}</span>
                          }
                          {f.display_name} ⚔️
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── FRIENDS PANEL ── */}
      {activePanel === "friends" && (
        <div style={{ width: "100%", maxWidth: 1000 }}>
          {profile?.is_guest ? (
            <Card>
              <div style={{ textAlign: "center", padding: "2rem", fontFamily: "var(--font-heading)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>👥</div>
                <div style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: ".5rem" }}>Friends require an account</div>
                <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Sign in with Google to add friends and invite them to raids.</div>
                <Btn variant="primary" onClick={signOut}>Sign In with Google</Btn>
              </div>
            </Card>
          ) : (
            <Card>
              <FriendsPanel
                friends={friends}
                onSearch={searchByEmail}
                onAdd={sendFriendRequest}
                onRespond={respondFriendRequest}
                onRemove={removeFriend}
                onInvite={handleInviteFriend}
                hasRoom={!!liveRoom}
              />
            </Card>
          )}
        </div>
      )}

      {/* ── Profile Edit Modal ── */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth={480}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--accent-violet)" }}>⚔️ Edit Profile</div>
          <Btn variant="ghost" size="sm" onClick={() => setProfileOpen(false)}>✕</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem", gap: ".75rem" }}>
          <div style={{ position: "relative" }}>
            {previewUrl
              ? <img src={previewUrl} alt="preview" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--accent-violet)", display: "block" }} />
              : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--bg-elevated)", border: "3px solid var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem" }}>{editAvatar}</div>
            }
            <div onClick={() => fileInputRef.current?.click()}
              style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--accent-violet)", border: "2px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: ".9rem" }}>📷</div>
          </div>
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files?.[0]); }}
            onClick={() => fileInputRef.current?.click()}
            style={{ width: "100%", padding: ".75rem", borderRadius: 8, cursor: "pointer", border: `2px dashed ${dragOver ? "var(--accent-violet)" : "var(--border)"}`, background: dragOver ? "rgba(124,92,224,.08)" : "transparent", textAlign: "center", transition: "all .2s" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: ".72rem", color: dragOver ? "var(--accent-violet)" : "var(--text-muted)", letterSpacing: ".08em" }}>
              {uploading ? "⏳ Uploading…" : "📁 Click or drag & drop an image"}
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: ".6rem", color: "var(--text-muted)", marginTop: ".25rem" }}>JPG, PNG, GIF, WebP · Max 5MB</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageFile(e.target.files?.[0])} />
          {previewUrl && <Btn variant="ghost" size="sm" onClick={() => { setUploadFile(null); setPreviewUrl(""); }}>🗑 Remove Photo</Btn>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <Label style={{ display: "block", marginBottom: ".4rem" }}>Display Name</Label>
          <InputField value={editName} onChange={e => setEditName(e.target.value)} placeholder="Enter warrior name…" onKeyDown={e => e.key === "Enter" && saveProfile()} />
        </div>
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
        <div style={{ margin: "1rem 0" }}>
          <Label style={{ display: "block", marginBottom: ".6rem" }}>Warrior Avatar <span style={{ color: "var(--text-muted)", fontSize: ".6rem" }}>(used when no photo)</span></Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
            {AVATARS.map(a => (
              <span key={a} onClick={() => setEditAvatar(a)} style={{ fontSize: "1.8rem", cursor: "pointer", padding: ".3rem", borderRadius: 6, border: `2px solid ${editAvatar === a ? "var(--accent-violet)" : "transparent"}`, background: editAvatar === a ? "rgba(124,92,224,.12)" : "transparent", transition: "all .15s" }}>{a}</span>
            ))}
          </div>
        </div>
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