export type QuantumCompany = {
  ticker: string;
  name: string;
  slug: string;
  yahooSymbol: string;
  category: "pure-play" | "big-tech" | "infrastructure";
  description: string; // one-line positioning
  accent: string;      // hex color for logo badge bg
};

export const QUANTUM_COMPANIES: QuantumCompany[] = [
  // ── Pure plays ──────────────────────────────────────────────────────────────
  {
    ticker: "IONQ",
    name: "IonQ",
    slug: "ionq",
    yahooSymbol: "IONQ",
    category: "pure-play",
    description: "Trapped-ion quantum computers. NYSE-listed, cloud access via AWS/Azure/GCP.",
    accent: "#6366F1",
  },
  {
    ticker: "RGTI",
    name: "Rigetti Computing",
    slug: "rgti",
    yahooSymbol: "RGTI",
    category: "pure-play",
    description: "Superconducting qubits. Owns its fab. Hybrid quantum-classical focus.",
    accent: "#8B5CF6",
  },
  {
    ticker: "QBTS",
    name: "D-Wave Quantum",
    slug: "qbts",
    yahooSymbol: "QBTS",
    category: "pure-play",
    description: "Quantum annealing for optimization problems. Oldest commercial QC company.",
    accent: "#06B6D4",
  },
  {
    ticker: "QUBT",
    name: "Quantum Computing Inc.",
    slug: "qubt",
    yahooSymbol: "QUBT",
    category: "pure-play",
    description: "Photonic QC and reservoir computing. Enterprise software focus.",
    accent: "#10B981",
  },
  {
    ticker: "ARQQ",
    name: "Arqit Quantum",
    slug: "arqq",
    yahooSymbol: "ARQQ",
    category: "pure-play",
    description: "Quantum encryption and symmetric key infrastructure. Government focus.",
    accent: "#F59E0B",
  },

  // ── Big tech ─────────────────────────────────────────────────────────────────
  {
    ticker: "IBM",
    name: "IBM",
    slug: "ibm",
    yahooSymbol: "IBM",
    category: "big-tech",
    description: "Eagle/Heron superconducting processors. IBM Quantum Network, 400+ qubit systems.",
    accent: "#3B82F6",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    slug: "googl",
    yahooSymbol: "GOOGL",
    category: "big-tech",
    description: "Willow chip — claimed quantum supremacy milestone Dec 2024. 105 qubits.",
    accent: "#EF4444",
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    slug: "msft",
    yahooSymbol: "MSFT",
    category: "big-tech",
    description: "Topological qubits (Majorana). Azure Quantum platform. Long-term bet.",
    accent: "#0EA5E9",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    slug: "amzn",
    yahooSymbol: "AMZN",
    category: "big-tech",
    description: "AWS Braket — quantum cloud access. Ocelot chip (cat qubits, 2025).",
    accent: "#F97316",
  },

  // ── Infrastructure ───────────────────────────────────────────────────────────
  {
    ticker: "NVDA",
    name: "NVIDIA",
    slug: "nvda",
    yahooSymbol: "NVDA",
    category: "infrastructure",
    description: "CUDA-Q platform for hybrid quantum-classical. GPU-accelerated quantum simulation.",
    accent: "#22C55E",
  },
  {
    ticker: "COHR",
    name: "Coherent",
    slug: "cohr",
    yahooSymbol: "COHR",
    category: "infrastructure",
    description: "Photonics components enabling photonic qubit systems and quantum networking.",
    accent: "#A855F7",
  },
];

export const QUANTUM_KEYWORDS = [
  // Core tech
  "quantum", "qubit", "superposition", "entanglement", "quantum computing",
  "quantum error correction", "quantum supremacy", "quantum advantage",
  "quantum network", "quantum cryptography", "quantum annealing",
  "topological qubit", "trapped ion", "superconducting qubit", "photonic qubit",
  "IonQ", "Rigetti", "D-Wave", "IBM Quantum", "Google Willow", "Azure Quantum",
  "AWS Braket", "CUDA-Q", "Majorana", "Ocelot", "error rate", "logical qubit",
  // Consciousness / philosophy / worldview
  "quantum consciousness", "quantum mind", "quantum biology", "quantum brain",
  "observer effect", "wave function", "wave function collapse", "many worlds",
  "Penrose", "Hameroff", "Orch OR", "quantum reality", "quantum weirdness",
  "Schrödinger", "quantum physics", "quantum mechanics", "quantum theory",
  "Dean Radin", "noetic", "consciousness and physics", "quantum entanglement",
  "double slit", "nonlocality", "quantum nonlocality", "spooky action",
  "quantum measurement", "quantum field", "quantum universe",
];
