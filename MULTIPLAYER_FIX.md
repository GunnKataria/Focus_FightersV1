# Multiplayer Fix — Change Log & Action Items

**Date:** 2026-04-13
**Bug:** When more than one user logs in, multiplayer doesn't work and screens get stuck.

---

## Root causes (from team audit)

1. **Host never told the DB the raid started.** `handleStartRaid` only fired a local callback — `rooms.status` was never updated, so non-host clients never got a realtime event and sat forever on "Waiting for host to start…".
2. **`useMultiplayer` lived only inside `LobbyScreen`.** On Lobby → Game navigation the hook unmounted, tearing down `liveRoom` / `liveMembers` and the realtime channel. `GameScreen` mounted with empty multiplayer state.
3. **Effect cleanup nuked the room channel on every re-run.** The invites/friends `useEffect` cleanup called `unsubscribeRoom()`, which fired on every React StrictMode remount and silently disconnected realtime updates. Nothing ever re-subscribed.
4. **Channel names included `Date.now()`.** Each remount created a brand-new channel; old ones leaked. Eventually hit Supabase's 100-channel/client limit and new subscriptions silently failed.
5. **GameScreen had zero multiplayer wiring.** Hardcoded `DEMO_SQUAD`, local-only `bossHP`/`teamHP`/`secondsLeft`, no shared clock, no presence, no broadcast.
6. **Likely RLS / publication blocker on `rooms` + `room_members`.** `postgres_changes` enforces RLS — if SELECT policies restrict to the host or own row, joiners never see the host's status flip or other members.

---

## Code changes

### 1. `src/hooks/useMultiplayer.js`

- **Stable channel names** — dropped `Date.now()` from `room:*`, `invites:*`, `friends:*` channels. Prevents channel leaks under StrictMode / remounts.
- **Removed `unsubscribeRoom()` from the invites/friends effect cleanup.** Room channel lifecycle is now owned exclusively by `createLiveRoom` / `joinLiveRoomByCode` / `leaveLiveRoom`. Added an inline comment explaining why.
- **Added `startLiveRoom()`** — host-only function that updates the `rooms` row with `status: 'active'` and `started_at: <ISO timestamp>`. Falls back gracefully (status-only update) if the `started_at` column doesn't exist yet.
- **Exported `startLiveRoom`** from the hook return value.

### 2. `src/App.jsx`

- **Hoisted `useMultiplayer(profile)` into `AppInner`.** Was previously called inside `LobbyScreen`, which meant its state died on navigation. Now lives at the app root so `liveRoom`, `liveMembers`, channels, and presence persist across Lobby ↔ Game.
- **Exposed multiplayer via `AppContext.Provider`** as `{ push, multiplayer }`.

### 3. `src/screens/LobbyScreen.jsx`

- **Removed the local `useMultiplayer(profile)` call**; now pulls from `useApp().multiplayer`.
- **`handleStartRaid` is now async** and awaits `startLiveRoom()` before calling `onStartRaid`. This writes `status='active'` to the DB so non-host clients receive a `postgres_changes` event.
- **Added auto-navigation `useEffect` for non-host clients.** When `liveRoom.status === 'active'` and the user isn't the host, it calls `onStartRaid` automatically. Fires once because `LobbyScreen` unmounts on navigation. Uses a ref to read the latest `isHost` without re-triggering the effect.

### 4. `src/screens/GameScreen/index.jsx`

- **Imported `useAuth`** to get the current user's `profile.id`.
- **Reads `multiplayer.liveMembers` and `multiplayer.liveRoom`** from `useApp()`.
- **`remoteSquad` derived from real members** (all `liveMembers` except self) via `useMemo`. Falls back to `DEMO_SQUAD` only when there's no multiplayer room (solo dev runs).
- **`useEffect` mirror** keeps `squadRef` and `squad` state in sync when members join/leave mid-raid.
- **Shared session clock** — `initialSeconds` is computed from `liveRoom.started_at + duration - elapsed`, so all clients count down from the same anchor. Falls back to local-only countdown if `started_at` is missing.
- **`secondsRef`** initialised from the shared clock.

---

## Files modified

```
src/hooks/useMultiplayer.js
src/App.jsx
src/screens/LobbyScreen.jsx
src/screens/GameScreen/index.jsx
```

No new files. No deleted files.

---

## Action items — Supabase dashboard

These are required for the fix to fully work. They cannot be done from code.

### 1. Add `started_at` column to `rooms` table (recommended)

Without this, the shared session clock falls back to per-client clocks (raid still starts, but countdown drifts between clients).

**Dashboard → Database → Tables → `rooms` → New column:**

| Field        | Value                       |
|--------------|-----------------------------|
| Name         | `started_at`                |
| Type         | `timestamptz`               |
| Default      | `null`                      |
| Nullable     | yes                         |

Or via SQL:

```sql
alter table public.rooms
  add column if not exists started_at timestamptz;
```

### 2. Confirm Realtime publication includes the multiplayer tables

**Dashboard → Database → Replication → `supabase_realtime` publication.**

Verify all four tables are toggled on:

- `rooms`
- `room_members`
- `invites`
- `friends`

If any are missing, toggle them on. Without this, `postgres_changes` events are never delivered for those tables.

### 3. RLS policies — the critical one

`postgres_changes` enforces Row Level Security. If the subscribing user can't `SELECT` a row, they don't get events for it. This is the single most likely reason joiners still get stuck after the code fixes.

**Dashboard → Authentication → Policies →** check each table:

#### `rooms`

SELECT policy must allow **any authenticated user who is a member of the room**, not just the host. Example:

```sql
create policy "rooms_select_members"
on public.rooms for select
to authenticated
using (
  exists (
    select 1 from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
  )
  or host_id = auth.uid()
);
```

INSERT policy (host creates room):

```sql
create policy "rooms_insert_self_host"
on public.rooms for insert
to authenticated
with check (host_id = auth.uid());
```

UPDATE policy (host can flip status / set started_at):

```sql
create policy "rooms_update_host"
on public.rooms for update
to authenticated
using (host_id = auth.uid())
with check (host_id = auth.uid());
```

DELETE policy (host can delete their room):

```sql
create policy "rooms_delete_host"
on public.rooms for delete
to authenticated
using (host_id = auth.uid());
```

#### `room_members`

SELECT must allow **any member of the same room** to see all rows in that room (otherwise nobody sees anyone else):

```sql
create policy "room_members_select_same_room"
on public.room_members for select
to authenticated
using (
  exists (
    select 1 from public.room_members rm
    where rm.room_id = room_members.room_id
      and rm.user_id = auth.uid()
  )
);
```

INSERT (user adds themselves):

```sql
create policy "room_members_insert_self"
on public.room_members for insert
to authenticated
with check (user_id = auth.uid());
```

DELETE (user removes themselves):

```sql
create policy "room_members_delete_self"
on public.room_members for delete
to authenticated
using (user_id = auth.uid());
```

#### `invites`

SELECT — sender or recipient:

```sql
create policy "invites_select_party"
on public.invites for select
to authenticated
using (from_id = auth.uid() or to_id = auth.uid());
```

INSERT — sender only:

```sql
create policy "invites_insert_self"
on public.invites for insert
to authenticated
with check (from_id = auth.uid());
```

UPDATE — recipient can accept/decline:

```sql
create policy "invites_update_recipient"
on public.invites for update
to authenticated
using (to_id = auth.uid())
with check (to_id = auth.uid());
```

#### `friends`

SELECT — either side of the friendship:

```sql
create policy "friends_select_party"
on public.friends for select
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());
```

INSERT — requester only:

```sql
create policy "friends_insert_self"
on public.friends for insert
to authenticated
with check (requester_id = auth.uid());
```

UPDATE — addressee can accept:

```sql
create policy "friends_update_addressee"
on public.friends for update
to authenticated
using (addressee_id = auth.uid())
with check (addressee_id = auth.uid());
```

DELETE — either side:

```sql
create policy "friends_delete_party"
on public.friends for delete
to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());
```

> **Important:** These are example policies. If you already have policies on these tables, audit them — the bug is most often `rooms` or `room_members` SELECT being too restrictive (e.g. `host_id = auth.uid()` only).

### 4. Reinstall local dependencies (build env fix)

The local `vite build` currently fails with a rolldown native binding error — unrelated to this fix, but blocks verification:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## How to test the fix

1. Apply the Supabase changes above.
2. Open the app in two browser windows (one in incognito or a different profile so they're different users).
3. Sign in with two different Google accounts.
4. User A: create a raid room. Note the code.
5. User B: join via the room code (or via invite from User A's friends list).
6. Verify both users appear in the warriors list on **both** screens.
7. User A clicks **Start Raid**.
8. Both users should navigate into `GameScreen` simultaneously, with the same countdown timer, and see each other in the squad list.

If User B is still stuck on "Waiting for host to start…", the most likely culprit is RLS on `rooms` blocking the SELECT for postgres_changes — re-check action item #3.

---

## Known remaining limitations (not in scope of this fix)

- `bossHP`, `teamHP`, and damage events are still simulated locally per client. The two players see independent boss healthbars even though they're in the same room with a shared clock and shared roster. Wiring these to a host-authoritative DB row + broadcast channel is a substantial follow-up.
- Squad member `status` (focused / distracted) is not yet broadcast — each client randomly toggles its remote teammates' status for visual effect only.
- No presence tracking — if a player closes their tab mid-raid, the other player won't see them disappear until the raid ends.
