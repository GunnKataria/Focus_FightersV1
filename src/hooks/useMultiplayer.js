import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useMultiplayer(profile) {
  const [liveRoom, setLiveRoom]             = useState(null);
  const [liveMembers, setLiveMembers]       = useState([]);
  const [friends, setFriends]               = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingRoom, setLoadingRoom]       = useState(false);

  const roomChannelRef    = useRef(null);
  const inviteChannelRef  = useRef(null);
  const friendsChannelRef = useRef(null);
  const currentRoomIdRef  = useRef(null);
  const loadingRef        = useRef(false);

  const userId  = profile?.id;
  const isGuest = profile?.is_guest;

  // ── Fetch members ─────────────────────────────────────────
  const fetchMembers = useCallback(async (roomId) => {
    const { data } = await supabase
      .from("ff_room_members")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    if (data) setLiveMembers(data);
  }, []);

  // ── Unsubscribe room ──────────────────────────────────────
  const unsubscribeRoom = useCallback(() => {
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
    currentRoomIdRef.current = null;
  }, []);

  // ── Subscribe to room ─────────────────────────────────────
  const subscribeToRoom = useCallback((roomId) => {
    if (currentRoomIdRef.current === roomId) return;
    unsubscribeRoom();
    currentRoomIdRef.current = roomId;
    fetchMembers(roomId);

    const channel = supabase
      .channel(`room:${roomId}:${userId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setLiveRoom(null); setLiveMembers([]); unsubscribeRoom();
          } else if (payload.new) {
            setLiveRoom(payload.new);
          }
        }
      )
      .on("postgres_changes",
        { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        () => fetchMembers(roomId)
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") fetchMembers(roomId);
      });

    roomChannelRef.current = channel;
  }, [userId, fetchMembers, unsubscribeRoom]);

  // ── Friends ───────────────────────────────────────────────
  const fetchFriends = useCallback(async () => {
    if (!userId || isGuest) return;

    const { data: rows, error } = await supabase
      .from("ff_friends")
      .select("id, status, requester_id, addressee_id")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) { console.error("fetchFriends:", error); return; }
    if (!rows?.length) { setFriends([]); return; }

    const otherIds = [...new Set(rows.map(f =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    ))];

    const { data: profileRows } = await supabase
      .from("ff_profiles")
      .select("id, display_name, avatar_emoji, photo_url, email")
      .in("id", otherIds);

    const profileMap = {};
    profileRows?.forEach(p => { profileMap[p.id] = p; });

    setFriends(rows.map(f => {
      const isRequester = f.requester_id === userId;
      const otherId = isRequester ? f.addressee_id : f.requester_id;
      return {
        friendshipId: f.id,
        status: f.status,
        isRequester,
        ...(profileMap[otherId] ?? { id: otherId, display_name: "Unknown", avatar_emoji: "🧙", photo_url: null }),
      };
    }));
  }, [userId, isGuest]);

  const searchByEmail = async (email) => {
    if (!email.trim()) return null;
    const { data } = await supabase
      .from("ff_profiles")
      .select("id, display_name, avatar_emoji, photo_url, email")
      .eq("email", email.trim().toLowerCase())
      .neq("id", userId)
      .limit(1);
    if (!data?.length) return null;
    const alreadyFriend = friends.some(f => f.id === data[0].id);
    return alreadyFriend ? { ...data[0], alreadyFriend: true } : data[0];
  };

  const sendFriendRequest = async (addresseeId) => {
    if (!userId || isGuest) return { error: "Must be signed in" };
    const { error } = await supabase.from("ff_friends").insert({
      requester_id: userId, addressee_id: addresseeId, status: "pending",
    });
    if (!error) await fetchFriends();
    return { error: error?.message ?? null };
  };

  const respondFriendRequest = async (friendshipId, accept) => {
    if (accept) {
      await supabase.from("ff_friends").update({ status: "accepted" }).eq("id", friendshipId);
    } else {
      await supabase.from("ff_friends").delete().eq("id", friendshipId);
    }
    await fetchFriends();
  };

  const removeFriend = async (friendshipId) => {
    await supabase.from("ff_friends").delete().eq("id", friendshipId);
    await fetchFriends();
  };

  // ── Create room ───────────────────────────────────────────
  const createLiveRoom = async ({ name, duration, boss }) => {
    if (!userId || !profile) {
      console.error("[MP] no userId/profile");
      return null;
    }
    if (loadingRef.current) {
      console.warn("[MP] already loading");
      return null;
    }

    loadingRef.current = true;
    setLoadingRoom(true);

    const cleanup = () => {
      loadingRef.current = false;
      setLoadingRoom(false);
    };

    try {
      const code   = Math.random().toString(36).substring(2, 8).toUpperCase();
      const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

      // Clean up old room membership
      if (currentRoomIdRef.current) {
        const oldId = currentRoomIdRef.current;
        unsubscribeRoom();
        await supabase.from("ff_room_members")
          .delete().eq("room_id", oldId).eq("user_id", userId);
      }

      console.log("[MP] inserting room:", code, "for user:", userId);

      const { data: room, error: roomErr } = await supabase
        .from("ff_rooms")
        .insert({
          code,
          name:     name || "Study Session",
          host_id:  userId,
          boss:     boss  || "🐲",
          duration: duration || 25,
          status:   "waiting",
        })
        .select()
        .single();

      if (roomErr) {
        console.error("[MP] room insert FAILED:", roomErr.message, roomErr.code, roomErr.details);
        cleanup();
        return null;
      }

      console.log("[MP] room insert OK:", room.code, room.id);

      const { error: memberErr } = await supabase
        .from("ff_room_members")
        .insert({
          room_id:      room.id,
          user_id:      userId,
          display_name: profile.display_name ?? "Warrior",
          avatar_emoji: profile.avatar_emoji ?? "🧙",
          photo_url:    profile.photo_url    ?? null,
          device,
          status:       "focused",
          joined_at:    new Date().toISOString(),
        });

      if (memberErr) {
        console.warn("[MP] member insert error:", memberErr.message, "trying upsert...");
        await supabase.from("ff_room_members").upsert({
          room_id:      room.id,
          user_id:      userId,
          display_name: profile.display_name ?? "Warrior",
          avatar_emoji: profile.avatar_emoji ?? "🧙",
          photo_url:    profile.photo_url    ?? null,
          device,
          status:       "focused",
        }, { onConflict: "room_id,user_id" });
      } else {
        console.log("[MP] member insert OK");
      }

      setLiveRoom(room);
      setLiveMembers([{
        id:           `${room.id}-${userId}`,
        room_id:      room.id,
        user_id:      userId,
        display_name: profile.display_name ?? "Warrior",
        avatar_emoji: profile.avatar_emoji ?? "🧙",
        photo_url:    profile.photo_url    ?? null,
        device,
        status:       "focused",
        joined_at:    new Date().toISOString(),
      }]);

      subscribeToRoom(room.id);
      cleanup();
      console.log("[MP] createLiveRoom DONE:", room.code);
      return room;

    } catch (err) {
      console.error("[MP] createLiveRoom EXCEPTION:", err.message);
      cleanup();
      return null;
    }
  };

  // ── Join room by code ─────────────────────────────────────
  const joinLiveRoomByCode = async (code) => {
    if (!code?.trim() || !userId || !profile) return null;
    try {
      const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

      const { data: room } = await supabase
        .from("ff_rooms")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .in("status", ["waiting", "active"])
        .maybeSingle();

      if (!room) { console.warn("[MP] room not found:", code); return null; }

      if (currentRoomIdRef.current && currentRoomIdRef.current !== room.id) {
        const oldId = currentRoomIdRef.current;
        unsubscribeRoom();
        await supabase.from("ff_room_members").delete().eq("room_id", oldId).eq("user_id", userId);
      }

      await supabase.from("ff_room_members").upsert({
        room_id:      room.id,
        user_id:      userId,
        display_name: profile.display_name ?? "Warrior",
        avatar_emoji: profile.avatar_emoji ?? "🧙",
        photo_url:    profile.photo_url    ?? null,
        device,
        status:       "focused",
        joined_at:    new Date().toISOString(),
      }, { onConflict: "room_id,user_id" });

      setLiveRoom(room);
      subscribeToRoom(room.id);
      return room;
    } catch (err) {
      console.error("[MP] joinLiveRoomByCode EXCEPTION:", err);
      return null;
    }
  };

  // ── Start raid (host only) ───────────────────────────────
  // Flips rooms.status → "active" so non-host members get a postgres_changes
  // event and can navigate into the game. Also stamps started_at so every
  // client can derive a shared session clock instead of drifting locally.
  const startLiveRoom = useCallback(async () => {
    const roomId = currentRoomIdRef.current;
    if (!roomId) return null;
    const startedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("ff_rooms")
      .update({ status: "active", started_at: startedAt })
      .eq("id", roomId)
      .select()
      .maybeSingle();
    if (error) {
      // started_at column may not exist yet — retry without it so the raid
      // still starts (clients will fall back to local clocks).
      const { data: data2, error: err2 } = await supabase
        .from("ff_rooms")
        .update({ status: "active" })
        .eq("id", roomId)
        .select()
        .maybeSingle();
      if (err2) { console.error("[MP] startLiveRoom failed:", err2); return null; }
      if (data2) setLiveRoom(data2);
      return data2;
    }
    if (data) setLiveRoom(data);
    return data;
  }, []);

  // ── Leave room ────────────────────────────────────────────
  const leaveLiveRoom = useCallback(async () => {
    const roomId = currentRoomIdRef.current;
    if (!roomId || !userId) return;

    unsubscribeRoom();
    setLiveRoom(null);
    setLiveMembers([]);

    await supabase.from("ff_room_members")
      .delete().eq("room_id", roomId).eq("user_id", userId);

    const { data: roomData } = await supabase
      .from("ff_rooms").select("host_id").eq("id", roomId).maybeSingle();

    if (roomData?.host_id === userId) {
      await supabase.from("ff_rooms").update({ status: "finished" }).eq("id", roomId);
      setTimeout(() => supabase.from("ff_rooms").delete().eq("id", roomId), 1500);
    }
  }, [userId, unsubscribeRoom]);

  // ── Invites ───────────────────────────────────────────────
  const inviteFriend = async (toId, room) => {
    if (!userId || !room) return;
    const { data: existing } = await supabase.from("ff_invites")
      .select("id").eq("room_id", room.id).eq("to_id", toId).eq("status", "pending").limit(1);
    if (existing?.length) return;
    await supabase.from("ff_invites").insert({
      room_id:   room.id,
      from_id:   userId,
      to_id:     toId,
      room_code: room.code,
      room_name: room.name,
      status:    "pending",
    });
  };

  const acceptInvite = async (invite) => {
    await supabase.from("ff_invites").update({ status: "accepted" }).eq("id", invite.id);
    setPendingInvites(prev => prev.filter(i => i.id !== invite.id));
    return joinLiveRoomByCode(invite.room_code);
  };

  const declineInvite = async (inviteId) => {
    await supabase.from("ff_invites").update({ status: "declined" }).eq("id", inviteId);
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  // ── Realtime subscriptions ────────────────────────────────
  useEffect(() => {
    if (!userId || isGuest) return;
    fetchFriends();

    const inviteCh = supabase
      .channel(`invites:${userId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "invites", filter: `to_id=eq.${userId}` },
        async (payload) => {
          const { data: sender } = await supabase
            .from("ff_profiles").select("display_name, avatar_emoji, photo_url")
            .eq("id", payload.new.from_id).single();
          setPendingInvites(prev =>
            prev.some(i => i.id === payload.new.id)
              ? prev
              : [...prev, { ...payload.new, sender }]
          );
        }
      ).subscribe();

    const friendsCh = supabase
      .channel(`friends:${userId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "friends", filter: `requester_id=eq.${userId}` },
        () => fetchFriends()
      )
      .on("postgres_changes",
        { event: "*", schema: "public", table: "friends", filter: `addressee_id=eq.${userId}` },
        () => fetchFriends()
      ).subscribe();

    inviteChannelRef.current  = inviteCh;
    friendsChannelRef.current = friendsCh;

    return () => {
      supabase.removeChannel(inviteCh);
      supabase.removeChannel(friendsCh);
      // NOTE: do NOT call unsubscribeRoom() here — room channel lifecycle is
      // owned by createLiveRoom / joinLiveRoomByCode / leaveLiveRoom. Tearing
      // it down on every effect re-run (e.g. StrictMode) silently disconnects
      // realtime updates and freezes joiners on "waiting".
    };
  }, [userId, isGuest, fetchFriends]);

  return {
    liveRoom, liveMembers, friends, pendingInvites, loadingRoom,
    fetchFriends, searchByEmail, sendFriendRequest, respondFriendRequest,
    removeFriend, createLiveRoom, joinLiveRoomByCode, leaveLiveRoom,
    startLiveRoom, inviteFriend, acceptInvite, declineInvite,
  };
}