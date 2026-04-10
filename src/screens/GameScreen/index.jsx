import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { DEMO_SQUAD, STUDY_PAGES, DEFAULT_QUESTS, BOSS_NAMES, QUIZ_QUESTIONS } from "../../constants";
import { formatTime } from "../../utils/formatTime";
import Btn from "../../components/ui/Btn";
import Modal from "../../components/ui/Modal";
import { SectionTitle } from "../../components/ui/Typography";
import QuizModal from "../../components/game/QuizModal";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import StudyTab from "./tabs/StudyTab";
import FlashcardTab from "./tabs/FlashcardTab";
import NotesTab from "./tabs/NotesTab";
import AiTab from "./tabs/AiTab";

export default function GameScreen({ player, room, onUpdatePlayer, onGoLobby }) {
  const { push } = useApp();

  // ── Combat state ──────────────────────────────────────────
  const [bossHP, setBossHP] = useState(1000);
  const [bossMaxHP] = useState(1000);
  const [teamHP, setTeamHP] = useState(500);
  const [teamMaxHP] = useState(500);
  const [secondsLeft, setSecondsLeft] = useState((room?.duration || 25) * 60);
  const [focused, setFocused] = useState(true);
  const [focusStreak, setFocusStreak] = useState(0);
  const [totalDamage, setTotalDamage] = useState(0);
  const [squad, setSquad] = useState(DEMO_SQUAD.map((p) => ({ ...p })));
  const [damageNums, setDamageNums] = useState([]);
  const [bossShaking, setBossShaking] = useState(false);
  const [teamHpShaking, setTeamHpShaking] = useState(false);
  const [combatLog, setCombatLog] = useState([
    { msg: "⚔️ Boss raid started! Stay focused!", type: "info" },
  ]);
  const [sessionRunning, setSessionRunning] = useState(true);

  // ── UI state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("study");
  const [currentPage, setCurrentPage] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardAnswered, setCardAnswered] = useState(false);
  const [quests, setQuests] = useState(DEFAULT_QUESTS.map((q) => ({ ...q })));
  const [questInput, setQuestInput] = useState("");
  const [notes, setNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: "ai",
      text: "Greetings, warrior! Ask me anything about the study material to gain knowledge and defeat the boss! ⚔️",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ── Modals ────────────────────────────────────────────────
  const [engageOpen, setEngageOpen] = useState(false);
  const [engageTimer, setEngageTimer] = useState(7);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [defeatOpen, setDefeatOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizComplete, setQuizComplete] = useState(null);
  const [xpReward, setXpReward] = useState(0);
  const [coinsReward, setCoinsReward] = useState(0);

  // ── Refs ──────────────────────────────────────────────────
  const gameLoopRef = useRef(null);
  const engageIntervalRef = useRef(null);
  const engageTimeoutRef = useRef(null);
  const focusedRef = useRef(true);
  const sessionRunningRef = useRef(true);
  const bossHPRef = useRef(1000);
  const teamHPRef = useRef(500);
  const secondsRef = useRef((room?.duration || 25) * 60);
  const totalDamageRef = useRef(0);
  const focusStreakRef = useRef(0);
  const squadRef = useRef(DEMO_SQUAD.map((p) => ({ ...p })));

  // Keep refs in sync with state
  useEffect(() => { focusedRef.current = focused; }, [focused]);
  useEffect(() => { bossHPRef.current = bossHP; }, [bossHP]);
  useEffect(() => { teamHPRef.current = teamHP; }, [teamHP]);

  // ── Helpers ───────────────────────────────────────────────
  const addLog = useCallback((msg, type = "info") => {
    setCombatLog((prev) => [{ msg, type }, ...prev.slice(0, 19)]);
  }, []);

  const spawnDmgNum = useCallback((dmg, critical = false) => {
    const id = Date.now() + Math.random();
    setDamageNums((prev) => [...prev, { id, dmg, critical, x: Math.random() * 60 - 30 }]);
    setTimeout(() => setDamageNums((prev) => prev.filter((d) => d.id !== id)), 1200);
  }, []);

  const addXP = useCallback(
    (amount) => {
      onUpdatePlayer((prev) => {
        let xp = prev.xp + amount;
        let level = prev.level;
        let xpToNext = prev.xpToNext;
        while (xp >= xpToNext) {
          xp -= xpToNext;
          level++;
          xpToNext = Math.floor(xpToNext * 1.5);
          push(`🎉 Level Up! Now Level ${level}!`, "gold");
        }
        return { ...prev, xp, level, xpToNext };
      });
    },
    [onUpdatePlayer, push]
  );

  // ── End session ───────────────────────────────────────────
  const endSession = useCallback(
    (reason) => {
      sessionRunningRef.current = false;
      setSessionRunning(false);
      clearInterval(gameLoopRef.current);
      clearTimeout(engageTimeoutRef.current);
      clearInterval(engageIntervalRef.current);
      setEngageOpen(false);

      if (reason === "defeat") {
        const px = Math.floor(totalDamageRef.current / 10);
        addXP(px);
        setDefeatOpen(true);
      } else {
        const xpE = 100 + Math.floor(totalDamageRef.current / 5);
        const coinsE = 20 + Math.floor((1000 - bossHPRef.current) / 50);
        addXP(xpE);
        onUpdatePlayer((p) => ({ ...p, coins: p.coins + coinsE }));
        setXpReward(xpE);
        setCoinsReward(coinsE);
        setVictoryOpen(true);
      }
    },
    [addXP, onUpdatePlayer]
  );

  // ── Game loop ─────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      if (!sessionRunningRef.current) return;
      secondsRef.current--;
      setSecondsLeft(secondsRef.current);

      const myFocus = focusedRef.current ? 1 : 0;
      const squadFocused = squadRef.current.filter((p) => p.status === "focused").length;
      const totalFocused = myFocus + squadFocused;
      const dps = totalFocused * 3 + (focusedRef.current ? 2 : 0);

      if (focusedRef.current) {
        focusStreakRef.current++;
        setFocusStreak(focusStreakRef.current);
        if (focusStreakRef.current % 10 === 0) {
          const bonus = Math.floor(focusStreakRef.current / 10) * 5;
          bossHPRef.current = Math.max(0, bossHPRef.current - bonus);
          setBossHP(bossHPRef.current);
          totalDamageRef.current += bonus;
          setTotalDamage(totalDamageRef.current);
          spawnDmgNum(bonus, true);
          addLog(`🔥 Focus streak! +${bonus} bonus dmg`, "gold");
        }
      } else {
        focusStreakRef.current = 0;
        setFocusStreak(0);
        if (Math.random() < 0.15) {
          const atk = 15 + Math.floor(Math.random() * 20);
          teamHPRef.current = Math.max(0, teamHPRef.current - atk);
          setTeamHP(teamHPRef.current);
          setTeamHpShaking(true);
          setTimeout(() => setTeamHpShaking(false), 500);
          setBossShaking(true);
          setTimeout(() => setBossShaking(false), 500);
          addLog(`💥 Boss attacks! Team takes ${atk} damage!`, "danger");
        }
      }

      if (dps > 0) {
        bossHPRef.current = Math.max(0, bossHPRef.current - dps);
        setBossHP(bossHPRef.current);
        totalDamageRef.current += dps;
        setTotalDamage(totalDamageRef.current);
      }

      // Simulate squad behaviour
      const updatedSquad = squadRef.current.map((p) => {
        if (Math.random() < 0.02) {
          const newStatus = p.status === "focused" ? "distracted" : "focused";
          if (newStatus === "distracted") addLog(`⚠️ ${p.name} got distracted!`, "danger");
          else addLog(`✅ ${p.name} refocused!`, "success");
          return { ...p, status: newStatus };
        }
        return p;
      });
      squadRef.current = updatedSquad;
      setSquad([...updatedSquad]);

      if (Math.random() < 0.08 && focusedRef.current) {
        onUpdatePlayer((p) => ({ ...p, xp: p.xp + 1 }));
      }

      if (secondsRef.current <= 0) { endSession("timeout"); return; }
      if (bossHPRef.current <= 0) { endSession("victory"); return; }
      if (teamHPRef.current <= 0) { endSession("defeat"); return; }
    };

    gameLoopRef.current = setInterval(loop, 1000);
    return () => clearInterval(gameLoopRef.current);
  }, [addLog, spawnDmgNum, endSession, onUpdatePlayer]);

  // ── Engagement checks ─────────────────────────────────────
  const scheduleEngage = useCallback(() => {
    const delay = (30 + Math.floor(Math.random() * 60)) * 1000;
    engageTimeoutRef.current = setTimeout(() => {
      if (!sessionRunningRef.current) return;
      let t = 7;
      setEngageTimer(t);
      setEngageOpen(true);
      engageIntervalRef.current = setInterval(() => {
        t--;
        setEngageTimer(t);
        if (t <= 0) {
          clearInterval(engageIntervalRef.current);
          setEngageOpen(false);
          setFocused(false);
          focusedRef.current = false;
          addLog("⚠️ Focus check missed!", "danger");
          push("⚠️ Focus check missed! Boss attacking!", "danger");
          scheduleEngage();
        }
      }, 1000);
    }, delay);
  }, [addLog, push]);

  useEffect(() => {
    scheduleEngage();
    return () => {
      clearTimeout(engageTimeoutRef.current);
      clearInterval(engageIntervalRef.current);
    };
  }, [scheduleEngage]);

  // ── Tab visibility ────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      if (!sessionRunningRef.current) return;
      const hidden = document.hidden;
      setFocused(!hidden);
      focusedRef.current = !hidden;
      if (hidden) {
        addLog("⚠️ Tab hidden — focus lost!", "danger");
        push("⚠️ Switched away! Focus lost!", "danger");
      } else {
        addLog("✅ Returned to focus.", "success");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [addLog, push]);

  // ── Handlers ──────────────────────────────────────────────
  const handleEngageRespond = () => {
    clearInterval(engageIntervalRef.current);
    setEngageOpen(false);
    setFocused(true);
    focusedRef.current = true;
    const bonus = 30;
    bossHPRef.current = Math.max(0, bossHPRef.current - bonus);
    setBossHP(bossHPRef.current);
    totalDamageRef.current += bonus;
    setTotalDamage(totalDamageRef.current);
    spawnDmgNum(bonus, true);
    addXP(5);
    addLog(`⚡ Engagement check passed! +${bonus} dmg`, "gold");
    push("⚡ Focus verified! Bonus damage!", "success");
    scheduleEngage();
  };

  const handleToggleFocus = () => {
    setFocused((f) => {
      focusedRef.current = !f;
      push(!f ? "🟢 Back in focus!" : "🔴 Distracted! Boss attacking!", !f ? "success" : "danger");
      return !f;
    });
  };

  const generateNotes = async () => {
    setNotesLoading(true);
    const material = STUDY_PAGES.map(
      (p, i) =>
        `Page ${i + 1}: ${p.title}\n${p.content
          .map((b) => b.text || (b.items || []).join(", "))
          .join(" ")}`
    ).join("\n\n");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "Generate structured HTML study notes. Use <h3> for headings, <p> for paragraphs, <ul><li> for bullets, <strong> for key terms. No html/body tags. Under 600 words. Return only the HTML, no markdown code fences."
              }]
            },
            contents: [{
              role: "user",
              parts: [{ text: `Generate notes from:\n${material}` }]
            }],
          }),
        }
      );
      const data = await res.json();
      // ── Handle error responses ──────────────────────────
      if (!res.ok) {
        const errorMsg = res.status === 429
          ? "⏳ The oracle is overwhelmed — wait a moment and try again!"
          : `⚠️ The oracle returned an error (${res.status}). Try again!`;
        setAiMessages((prev) => [...prev, { role: "ai", text: errorMsg }]);
        setAiLoading(false);
        return;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || fallbackNotes();
      setNotes(text);
    } catch {
      setNotes(fallbackNotes());
    }
    setNotesLoading(false);
    setNotesModalOpen(true);
    addXP(20);
    push("✨ Notes generated! +20 XP", "gold");
    addLog("📋 Notes generated for the squad!", "gold");
  };

  const fallbackNotes = () =>
    `<h3>⚛️ Quantum Mechanics</h3><p>Quantum mechanics describes atomic-scale behavior with probabilistic outcomes.</p><h3>Core Principles</h3><ul><li><strong>Wave-Particle Duality:</strong> Quantum objects show both wave and particle properties</li><li><strong>Superposition:</strong> Particles in multiple states simultaneously</li><li><strong>Uncertainty Principle:</strong> Δx·Δp ≥ ℏ/2</li></ul><h3>Quantum Computing</h3><ul><li><strong>Qubit:</strong> α|0⟩ + β|1⟩ — superposition of basis states</li><li><strong>Shor's Algorithm:</strong> Exponential speedup for factoring</li></ul>`;

  const sendAi = async (overrideMsg) => {
    const msg = (typeof overrideMsg === "string" ? overrideMsg : aiInput).trim();
    if (!msg || aiLoading) return;
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", text: msg }]);
    setAiLoading(true);
    const material = STUDY_PAGES[currentPage]?.content
      .map((b) => b.text || (b.items || []).join(", "))
      .join(" ")
      .substring(0, 600) || "";
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: `You are an RPG-themed AI study assistant in Focus Fighters. Current study material:\n${material}\nBe concise (<120 words), slightly dramatic, and helpful. Use 1-2 emoji max.`
              }]
            },
            contents: [{ role: "user", parts: [{ text: msg }] }],
          }),
        }
      );
      const data = await res.json();
      // ── Handle error responses ──────────────────────────
      if (!res.ok) {
        const errorMsg = res.status === 429
          ? "⏳ The oracle is overwhelmed — wait a moment and try again!"
          : `⚠️ The oracle returned an error (${res.status}). Try again!`;
        setAiMessages((prev) => [...prev, { role: "ai", text: errorMsg }]);
        setAiLoading(false);
        return;
      }
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "The arcane connection faltered… try again.";
      setAiMessages((prev) => [...prev, { role: "ai", text }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "ai", text: "The oracle is unavailable. Study the scrolls directly! 📜" },
      ]);
    }
    setAiLoading(false);
  };
  // ── Derived values ────────────────────────────────────────
  const dps =
    ((focused ? 1 : 0) + squad.filter((p) => p.status === "focused").length) * 3 +
    (focused ? 2 : 0);

  const allPlayers = [
    { ...player, status: focused ? "focused" : "distracted" },
    ...squad,
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "270px 1fr 250px",
        gridTemplateRows: "auto 1fr auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* LEFT PANEL */}
      <LeftPanel
        room={room}
        bossHP={bossHP}
        bossMaxHP={bossMaxHP}
        teamHP={teamHP}
        teamMaxHP={teamMaxHP}
        bossShaking={bossShaking}
        teamHpShaking={teamHpShaking}
        damageNums={damageNums}
        allPlayers={allPlayers}
        dps={dps}
        totalDamage={totalDamage}
        secondsLeft={secondsLeft}
        focusStreak={focusStreak}
        focused={focused}
        onToggleFocus={handleToggleFocus}
      />

      {/* TOP BAR */}
      <header
        style={{
          gridColumn: 2,        // ← ADD THIS
          gridRow: 1,           // ← ADD THIS
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          padding: ".7rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: ".9rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 200,
          }}
        >
          {room?.name || "Boss Raid"}
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {[
            ["study", "📖 Study"],
            ["flashcard", "🃏 Cards"],
            ["notes", "📋 Notes"],
            ["chat", "🤖 AI"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: ".68rem",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                padding: ".45rem .9rem",
                background: activeTab === id ? "rgba(124,92,224,.2)" : "transparent",
                border: "none",
                borderRight: "1px solid var(--border)",
                color: activeTab === id ? "var(--accent-violet)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".9rem",
              color: "var(--accent-gold)",
              minWidth: 50,
              textAlign: "right",
            }}
          >
            {formatTime(secondsLeft)}
          </span>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".8rem",
              color: "var(--text-secondary)",
            }}
          >
            ⚡ {player.xp} XP
          </span>
        </div>
      </header>

      {/* CENTER MAIN */}
      <main
        style={{
          gridColumn: 2,        // ← ADD THIS
          gridRow: 2,           // ← ADD THIS
          padding: "1rem 1.25rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {activeTab === "study" && (
          <StudyTab
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            generateNotes={generateNotes}
            notesLoading={notesLoading}
          />
        )}
        {activeTab === "flashcard" && (
          <FlashcardTab
            currentCard={currentCard}
            setCurrentCard={setCurrentCard}
            cardFlipped={cardFlipped}
            setCardFlipped={setCardFlipped}
            cardAnswered={cardAnswered}
            setCardAnswered={setCardAnswered}
            onCorrectAnswer={() => {
              const bonus = 25 + Math.floor(Math.random() * 15);
              bossHPRef.current = Math.max(0, bossHPRef.current - bonus);
              setBossHP(bossHPRef.current);
              totalDamageRef.current += bonus;
              setTotalDamage(totalDamageRef.current);
              spawnDmgNum(bonus);
              addXP(10);
              push(`✅ Correct! +${bonus} bonus damage!`, "success");
              addLog(`🃏 Correct! Bonus: +${bonus} dmg`, "gold");
            }}
            onWrongAnswer={() => {
              push("❌ Wrong — no bonus damage", "danger");
              addLog("🃏 Wrong answer!", "danger");
            }}
          />
        )}
        {activeTab === "notes" && <NotesTab notes={notes} push={push} />}
        {activeTab === "chat" && (
          <AiTab
            aiMessages={aiMessages}
            aiLoading={aiLoading}
            aiInput={aiInput}
            setAiInput={setAiInput}
            sendAi={sendAi}
          />
        )}
      </main>

      {/* BOTTOM BAR */}
      <footer
        style={{
          gridColumn: 2,        // ← ADD THIS
          gridRow: 3,           // ← ADD THIS
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          padding: ".6rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontSize: ".78rem", color: "var(--text-secondary)" }}>
          ⚡ DPS: <strong style={{ color: "var(--accent-violet)" }}>{dps}</strong>
        </span>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: ".78rem", color: "var(--text-secondary)" }}>
          ❤️ Team HP: <strong style={{ color: "var(--accent-green)" }}>{Math.ceil(teamHP)}</strong>
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-heading)", fontSize: ".8rem", color: focused ? "var(--accent-green)" : "var(--accent-red)" }}>
          {focused ? "🟢 Focused" : "🔴 Distracted"}
        </span>
        <div style={{ flex: 1 }} />
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm("End session early?")) endSession("timeout");
          }}
        >
          End Session
        </Btn>
      </footer>

      {/* RIGHT PANEL */}
      <RightPanel
        quests={quests}
        setQuests={setQuests}
        questInput={questInput}
        setQuestInput={setQuestInput}
        player={player}
        focusStreak={focusStreak}
        combatLog={combatLog}
        onQuestComplete={() => {
          addXP(5);
          push("✅ Quest complete! +5 XP", "success");
        }}
      />

      {/* ── MODALS ── */}

      {/* Engagement check */}
      <Modal open={engageOpen} maxWidth={360}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem" }}>⚡</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--accent-gold)", margin: ".5rem 0" }}>
            Focus Check!
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: ".9rem", marginBottom: ".5rem" }}>
            Are you still with us, warrior?
          </p>
          <div
            className="timer-pulse"
            style={{
              width: 76, height: 76, borderRadius: "50%",
              border: "3px solid var(--accent-gold)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: "1.8rem",
              color: "var(--accent-gold)", margin: "1rem auto",
            }}
          >
            {engageTimer}
          </div>
          <Btn variant="gold" size="lg" onClick={handleEngageRespond}>
            ⚔️ I'm Here!
          </Btn>
        </div>
      </Modal>

      {/* Notes modal */}
      <Modal open={notesModalOpen} onClose={() => setNotesModalOpen(false)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--accent-violet)" }}>
            ✨ Notes Generated
          </div>
          <Btn variant="ghost" size="sm" onClick={() => setNotesModalOpen(false)}>✕</Btn>
        </div>
        <div
          style={{ fontSize: ".9rem", lineHeight: 1.7, color: "var(--text-secondary)", maxHeight: 400, overflowY: "auto" }}
          dangerouslySetInnerHTML={{ __html: notes }}
        />
        <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem" }}>
          <Btn
            variant="gold"
            onClick={() => {
              const blob = new Blob([notes.replace(/<[^>]*>/g, "")], { type: "text/plain" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "notes.txt";
              a.click();
              push("📥 Downloaded!", "success");
            }}
          >
            ⬇ Download
          </Btn>
          <Btn variant="ghost" onClick={() => setNotesModalOpen(false)}>Close</Btn>
        </div>
      </Modal>

      {/* Victory modal */}
      <Modal open={victoryOpen} maxWidth={480}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem" }}>{bossHP <= 0 ? "🏆" : "⭐"}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--accent-gold)", marginTop: ".5rem" }}>
            {bossHP <= 0 ? "Boss Defeated!" : "Session Complete!"}
          </div>
          <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>
            {bossHP <= 0
              ? `Your squad slew the ${BOSS_NAMES[room?.boss]}!`
              : "Great focus session, warrior!"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", justifyContent: "center", margin: "1rem 0" }}>
            {[
              ["⚡", `+${xpReward} XP`],
              ["🪙", `+${coinsReward} Coins`],
              ["⚔️", `${Math.floor(totalDamage)} Damage`],
            ].map(([icon, label]) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: ".4rem",
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: 20, padding: ".35rem .9rem",
                  fontFamily: "var(--font-heading)", fontSize: ".8rem",
                }}
              >
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1rem" }}>
            <Btn variant="ghost" onClick={() => { setVictoryOpen(false); onGoLobby(); }}>
              Return to Lobby
            </Btn>
            <Btn variant="gold" onClick={() => { setVictoryOpen(false); setQuizOpen(true); }}>
              📝 Final Quiz
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Defeat modal */}
      <Modal open={defeatOpen} maxWidth={420}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem" }}>💀</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--accent-red)", marginTop: ".5rem" }}>
            Defeated!
          </div>
          <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>
            Your squad was overwhelmed. Stay focused next time!
          </p>
          <div style={{ display: "flex", gap: ".75rem", justifyContent: "center" }}>
            <Btn variant="ghost" onClick={() => { setDefeatOpen(false); onGoLobby(); }}>Retreat</Btn>
            <Btn variant="danger" onClick={() => setDefeatOpen(false)}>⚔️ Retry</Btn>
          </div>
        </div>
      </Modal>

      {/* Quiz */}
      {quizOpen && (
        <QuizModal
          onClose={() => setQuizOpen(false)}
          onComplete={(result) => {
            setQuizOpen(false);
            setQuizComplete(result);
            addXP(result.correct * 15);
            onUpdatePlayer((p) => ({ ...p, coins: p.coins + result.correct * 5 }));
          }}
        />
      )}

      {/* Quiz results */}
      {quizComplete && (
        <Modal open={true} maxWidth={420}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem" }}>{quizComplete.passed ? "🎓" : "📚"}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginTop: ".5rem", color: quizComplete.passed ? "var(--accent-gold)" : "var(--accent-violet)" }}>
              {quizComplete.passed ? "Knowledge Mastered!" : "Keep Studying!"}
            </div>
            <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>
              {quizComplete.correct}/{QUIZ_QUESTIONS.length} correct.
            </p>
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "center", flexWrap: "wrap", margin: "1rem 0" }}>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 20, padding: ".35rem .9rem", fontFamily: "var(--font-heading)", fontSize: ".8rem" }}>
                ⚡ +{quizComplete.correct * 15} XP
              </div>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 20, padding: ".35rem .9rem", fontFamily: "var(--font-heading)", fontSize: ".8rem" }}>
                🪙 +{quizComplete.correct * 5} Coins
              </div>
            </div>
            <Btn variant="gold" onClick={() => { setQuizComplete(null); onGoLobby(); }}>
              Claim & Return
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}