import { useState } from "react";
import Btn from "../ui/Btn";
import InputField from "../ui/InputField";
import { SectionTitle, Label } from "../ui/Typography";

export default function FriendsPanel({ friends, onSearch, onAdd, onRespond, onRemove, onInvite, hasRoom }) {
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResult, setSearchResult] = useState(null); // found user
    const [searching, setSearching] = useState(false);
    const [searchErr, setSearchErr] = useState("");

    const accepted = friends.filter(f => f.status === "accepted");
    const pending = friends.filter(f => f.status === "pending");
    const incoming = pending.filter(f => !f.isRequester);
    const outgoing = pending.filter(f => f.isRequester);

    const handleSearch = async () => {
        if (!searchEmail.trim()) return;
        setSearching(true);
        setSearchErr("");
        setSearchResult(null);
        const result = await onSearch(searchEmail);
        if (!result) setSearchErr("No user found with that email.");
        else setSearchResult(result);
        setSearching(false);
    };

    const handleAdd = async (id) => {
        const { error } = await onAdd(id);
        if (error) setSearchErr(error);
        else { setSearchResult(null); setSearchEmail(""); }
    };

    const Avatar = ({ p, size = 32 }) => (
        p.photo_url
            ? <img src={p.photo_url} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }} />
            : <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--bg-surface)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, flexShrink: 0 }}>{p.avatar_emoji || "🧙"}</div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Search */}
            <div>
                <SectionTitle>🔍 Add Friend by Email</SectionTitle>
                <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
                    <InputField
                        value={searchEmail}
                        onChange={e => { setSearchEmail(e.target.value); setSearchErr(""); setSearchResult(null); }}
                        placeholder="friend@email.com"
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                        style={{ flex: 1, padding: ".55rem .85rem", fontSize: ".9rem" }}
                    />
                    <Btn variant="primary" size="sm" onClick={handleSearch} disabled={searching}>
                        {searching ? "…" : "Search"}
                    </Btn>
                </div>

                {/* Search result */}
                {searchResult && (
                    <div style={{ marginTop: ".6rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".6rem .75rem", background: "var(--bg-elevated)", borderRadius: 8, border: `1px solid ${searchResult.alreadyFriend ? "rgba(82,224,122,.3)" : "var(--border)"}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                            <Avatar p={searchResult} />
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontSize: ".82rem" }}>{searchResult.display_name}</div>
                                <Label>{searchResult.email}</Label>
                            </div>
                        </div>
                        {searchResult.alreadyFriend
                            ? <span style={{ fontFamily: "var(--font-heading)", fontSize: ".7rem", color: "var(--accent-green)" }}>✓ Already friends</span>
                            : <Btn variant="primary" size="sm" onClick={() => handleAdd(searchResult.id)}>+ Add</Btn>
                        }
                    </div>
                )}
                {searchErr && <div style={{ fontFamily: "var(--font-heading)", fontSize: ".72rem", color: "var(--accent-red)", marginTop: ".4rem" }}>{searchErr}</div>}
            </div>

            {/* Incoming requests */}
            {incoming.length > 0 && (
                <div>
                    <SectionTitle>📬 Friend Requests ({incoming.length})</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginTop: ".5rem" }}>
                        {incoming.map(f => (
                            <div key={f.friendshipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".6rem .75rem", background: "rgba(82,224,122,.06)", borderRadius: 8, border: "1px solid rgba(82,224,122,.2)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                    <Avatar p={f} />
                                    <div style={{ fontFamily: "var(--font-heading)", fontSize: ".82rem" }}>{f.display_name}</div>
                                </div>
                                <div style={{ display: "flex", gap: ".4rem" }}>
                                    <Btn variant="primary" size="sm" onClick={() => onRespond(f.friendshipId, true)}>✓ Accept</Btn>
                                    <Btn variant="ghost" size="sm" onClick={() => onRespond(f.friendshipId, false)}>✕</Btn>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends list */}
            <div>
                <SectionTitle>⚔️ Friends ({accepted.length})</SectionTitle>
                {accepted.length === 0 && (
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: ".72rem", color: "var(--text-muted)", marginTop: ".5rem", textAlign: "center", padding: "1rem" }}>
                        No friends yet. Search by email to add warriors!
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginTop: ".5rem" }}>
                    {accepted.map(f => (
                        <div key={f.friendshipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".6rem .75rem", background: "var(--bg-elevated)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                <Avatar p={f} />
                                <div style={{ fontFamily: "var(--font-heading)", fontSize: ".82rem" }}>{f.display_name}</div>
                            </div>
                            <div style={{ display: "flex", gap: ".4rem" }}>
                                {hasRoom && (
                                    <Btn variant="primary" size="sm" onClick={() => onInvite(f.id)}
                                        style={{ background: "linear-gradient(135deg,#1a7a3a,var(--accent-green))", color: "#0a1a0f" }}>
                                        ⚔️ Invite
                                    </Btn>
                                )}
                                <Btn variant="ghost" size="sm" onClick={() => onRemove(f.friendshipId)}>Remove</Btn>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Outgoing pending */}
            {outgoing.length > 0 && (
                <div>
                    <SectionTitle>⏳ Pending Sent ({outgoing.length})</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginTop: ".5rem" }}>
                        {outgoing.map(f => (
                            <div key={f.friendshipId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".6rem .75rem", background: "var(--bg-elevated)", borderRadius: 8, border: "1px solid var(--border)", opacity: 0.7 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                    <Avatar p={f} />
                                    <div style={{ fontFamily: "var(--font-heading)", fontSize: ".82rem" }}>{f.display_name}</div>
                                </div>
                                <Label>Awaiting…</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}