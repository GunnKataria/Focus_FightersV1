export const STUDY_PAGES = [
  {
    title: "Quantum Mechanics — Foundations",
    content: [
      { type: "h2", text: "Quantum Mechanics — Foundations" },
      { type: "p", text: "Quantum mechanics describes the behavior of particles at atomic and subatomic scales. Unlike classical mechanics, quantum systems exhibit fundamentally probabilistic behavior." },
      { type: "definition", text: "Wave-Particle Duality: All quantum objects exhibit properties of both waves and particles, depending on how they are measured." },
      { type: "h3", text: "Key Principles" },
      { type: "ul", items: ["Superposition: particles exist in multiple states simultaneously", "Entanglement: correlated quantum states across space", "Uncertainty Principle: Δx · Δp ≥ ℏ/2"] },
      { type: "highlight", text: "🌟 Schrödinger's equation describes how quantum states evolve over time — the fundamental equation of non-relativistic quantum mechanics." },
    ],
  },
  {
    title: "Wave Functions & Probability",
    content: [
      { type: "h2", text: "Wave Functions & Probability Amplitudes" },
      { type: "p", text: "The wave function ψ(x,t) encodes complete information about a quantum system. The probability density of finding a particle at position x is |ψ|²." },
      { type: "definition", text: "Born Rule: The probability of measuring an outcome is the square of the absolute value of the probability amplitude." },
      { type: "h3", text: "Normalization" },
      { type: "p", text: "All valid wave functions must satisfy: ∫|ψ(x)|² dx = 1, ensuring total probability equals 100%." },
      { type: "h3", text: "Quantum Operators" },
      { type: "ul", items: ["Position operator: x̂", "Momentum operator: p̂ = -iℏ(∂/∂x)", "Hamiltonian: Ĥ = p̂²/2m + V(x̂)"] },
      { type: "highlight", text: "🌟 Measurement collapses the wave function — instantaneous and irreversible." },
    ],
  },
  {
    title: "Quantum Entanglement",
    content: [
      { type: "h2", text: "Entanglement & Non-Locality" },
      { type: "p", text: "Quantum entanglement occurs when two or more particles become correlated such that each particle's quantum state cannot be described independently." },
      { type: "definition", text: "Bell's Theorem: No local hidden variable theory can reproduce all the predictions of quantum mechanics." },
      { type: "h3", text: "EPR Paradox" },
      { type: "p", text: "Einstein, Podolsky and Rosen argued entanglement implied 'spooky action at a distance' — but Bell's experiments confirmed quantum correlations exceed classical limits." },
      { type: "h3", text: "Applications" },
      { type: "ul", items: ["Quantum cryptography (QKD)", "Quantum teleportation", "Quantum computing (qubits)"] },
    ],
  },
  {
    title: "Heisenberg Uncertainty Principle",
    content: [
      { type: "h2", text: "The Uncertainty Principle" },
      { type: "p", text: "Werner Heisenberg's uncertainty principle states there are fundamental limits to how precisely certain pairs of physical properties can be simultaneously known." },
      { type: "definition", text: "Δx · Δp ≥ ℏ/2 — Position and momentum cannot both be precisely measured simultaneously." },
      { type: "h3", text: "Energy-Time Uncertainty" },
      { type: "p", text: "ΔE · Δt ≥ ℏ/2 — This explains the finite lifetime of excited atomic states and the natural linewidth of spectral lines." },
      { type: "highlight", text: "🌟 This isn't a limitation of measurement technology — it's a fundamental feature of quantum reality!" },
    ],
  },
  {
    title: "Quantum Computing",
    content: [
      { type: "h2", text: "Quantum Computing Fundamentals" },
      { type: "p", text: "Quantum computers exploit superposition and entanglement to process information in ways impossible for classical computers." },
      { type: "definition", text: "Qubit: The basic unit of quantum information — can exist as |0⟩, |1⟩, or any superposition α|0⟩ + β|1⟩." },
      { type: "h3", text: "Quantum Gates" },
      { type: "ul", items: ["Hadamard (H): Creates superposition from basis states", "CNOT: Entangles two qubits", "Pauli gates (X, Y, Z): Single-qubit rotations"] },
      { type: "h3", text: "Key Algorithms" },
      { type: "ul", items: ["Shor's algorithm: exponential speedup for factoring", "Grover's algorithm: quadratic speedup for search", "Variational Quantum Eigensolver (VQE)"] },
      { type: "highlight", text: "🌟 A 50-qubit quantum computer can represent 2⁵⁰ ≈ 10¹⁵ states simultaneously!" },
    ],
  },
];

export const FLASHCARDS = [
  { q: "What is wave-particle duality?", a: "The property of quantum objects exhibiting both wave and particle characteristics depending on measurement.", opts: ["A type of classical wave", "Dual behavior of quantum objects", "A relativistic effect", "Einstein's photoelectric theory"], correct: 1 },
  { q: "State the Heisenberg Uncertainty Principle", a: "Δx · Δp ≥ ℏ/2 — position and momentum cannot be simultaneously measured with arbitrary precision.", opts: ["ΔE · Δt = 0", "Δx · Δp ≥ ℏ/2", "F = ma", "E = mc²"], correct: 1 },
  { q: "What does the Born Rule state?", a: "The probability of measuring an outcome equals the square of the absolute value of the probability amplitude.", opts: ["P = |ψ|²", "P = ψ", "P = 1/ψ", "P = ψ²/2"], correct: 0 },
  { q: "What is a qubit in quantum computing?", a: "A qubit is the basic unit of quantum information, existing as |0⟩, |1⟩, or a superposition thereof.", opts: ["A classical bit", "A quantum unit of information", "A type of photon", "An electron orbit"], correct: 1 },
  { q: "What did Bell's Theorem demonstrate?", a: "No local hidden variable theory can fully reproduce all predictions of quantum mechanics.", opts: ["Einstein was right", "Quantum mechanics is wrong", "No local hidden variables can explain QM", "Light speed is variable"], correct: 2 },
];

export const QUIZ_QUESTIONS = [
  { q: "Which equation describes how quantum states evolve over time?", opts: ["Newton's Second Law", "Schrödinger's Equation", "Maxwell's Equations", "Boltzmann Distribution"], ans: 1 },
  { q: "What is quantum entanglement?", opts: ["Particles sharing a location", "Correlated quantum states that cannot be independently described", "Wave collapse", "A type of superposition"], ans: 1 },
  { q: "The uncertainty principle means:", opts: ["Instruments are imprecise", "Quantum properties have fundamental measurement limits", "Only position is uncertain", "Energy is always uncertain"], ans: 1 },
  { q: "What is the probability interpretation of |ψ|²?", opts: ["Energy density", "Magnetic field strength", "Probability density of finding a particle", "Wave amplitude"], ans: 2 },
  { q: "Shor's algorithm provides exponential speedup for:", opts: ["Searching databases", "Integer factoring", "Sorting", "Matrix multiplication"], ans: 1 },
];

export const DEMO_SQUAD = [
  { id: "p2", name: "Aria", avatar: "🧝", status: "focused" },
  { id: "p3", name: "Kael", avatar: "🐺", status: "focused" },
  { id: "p4", name: "Zira", avatar: "🦄", status: "warning" },
];

export const DEMO_ROOMS = [
  { id: "r1", name: "Physics Finals", boss: "🐲", duration: 25, code: "AX7K2P", players: 3 },
  { id: "r2", name: "Math Marathon", boss: "💀", duration: 45, code: "BN9QW1", players: 2 },
];

export const BOSS_NAMES = {
  "🐲": "Shadow Drake",
  "💀": "Lich King",
  "👾": "Void Titan",
  "🧿": "Crystal Golem",
};

export const AVATARS = ["🧙", "🧝", "🧛", "🐉", "🦄", "🦊", "🐺", "🦅"];

export const DEFAULT_QUESTS = [
  { text: "Study Wave-Particle Duality", done: false },
  { text: "Complete Heisenberg section", done: false },
  { text: "Answer 3 flashcards correctly", done: false },
  { text: "Stay focused for 10 minutes", done: false },
  { text: "Generate session notes", done: false },
];