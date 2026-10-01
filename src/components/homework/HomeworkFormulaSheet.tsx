import React, { useState } from "react";
import { BookOpen, Search, Plus, Copy, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FormulaItem {
  id: string;
  name: string;
  subject: "math" | "physics" | "chemistry" | "cs" | "english" | "hindi";
  formula: string;
  latex?: string;
  variables: string;
}

const FORMULA_DATABASE: FormulaItem[] = [
  // Math
  { id: "f-1", name: "Quadratic Formula", subject: "math", formula: "x = (-b ± √(b² - 4ac)) / (2a)", variables: "a, b, c = coefficients" },
  { id: "f-2", name: "Pythagorean Theorem", subject: "math", formula: "a² + b² = c²", variables: "a, b = legs, c = hypotenuse" },
  { id: "f-3", name: "Derivative of Power Rule", subject: "math", formula: "d/dx(xⁿ) = n · xⁿ⁻¹", variables: "n = exponent power" },
  { id: "f-4", name: "Integration Power Rule", subject: "math", formula: "∫ xⁿ dx = (xⁿ⁺¹ / (n + 1)) + C", variables: "n ≠ -1, C = constant" },
  { id: "f-5", name: "Sine Rule (Trigonometry)", subject: "math", formula: "a / sin(A) = b / sin(B) = c / sin(C)", variables: "a,b,c = sides, A,B,C = angles" },

  // Physics
  { id: "f-6", name: "Newton's Second Law", subject: "physics", formula: "F = m · a", variables: "F = Force (N), m = mass (kg), a = accel (m/s²)" },
  { id: "f-7", name: "Kinematic Motion Equation", subject: "physics", formula: "v² = u² + 2as", variables: "v = final, u = initial, a = accel, s = distance" },
  { id: "f-8", name: "Kinetic Energy Formula", subject: "physics", formula: "KE = ½ · m · v²", variables: "m = mass (kg), v = velocity (m/s)" },
  { id: "f-9", name: "Ohm's Law (Electricity)", subject: "physics", formula: "V = I · R", variables: "V = Voltage (V), I = Current (A), R = Resistance (Ω)" },
  { id: "f-10", name: "Gravitational Potential Energy", subject: "physics", formula: "PE = m · g · h", variables: "g = 9.8 m/s², h = height (m)" },

  // Chemistry
  { id: "f-11", name: "Ideal Gas Law", subject: "chemistry", formula: "P · V = n · R · T", variables: "P = press, V = vol, n = moles, R = 8.314, T = Kelvin" },
  { id: "f-12", name: "Molarity Formula", subject: "chemistry", formula: "M = moles of solute / liters of solution", variables: "M = concentration (mol/L)" },
  { id: "f-13", name: "pH Definition", subject: "chemistry", formula: "pH = -log₁₀([H⁺])", variables: "[H⁺] = hydrogen ion concentration" },
  { id: "f-14", name: "Dilution Formula", subject: "chemistry", formula: "M₁ · V₁ = M₂ · V₂", variables: "M = molarity, V = volume" },

  // English
  { id: "f-eng-1", name: "PEEL Paragraph Structure", subject: "english", formula: "Point → Evidence (Quote) → Explanation → Link to Thesis", variables: "Core structure for analytical essays & research papers" },
  { id: "f-eng-2", name: "Subject-Verb Agreement", subject: "english", formula: "Singular Subject + Singular Verb (-s) / Plural Subject + Plural Verb", variables: "e.g., 'The group of students IS studying', not 'are'" },
  { id: "f-eng-3", name: "Active vs Passive Voice", subject: "english", formula: "Active: Subject + Verb + Object (Preferred) / Passive: Object + Was/Were + Past Participle", variables: "Active: 'Shakespeare wrote Hamlet' vs Passive: 'Hamlet was written'" },
  { id: "f-eng-4", name: "Major Literary Devices", subject: "english", formula: "Metaphor (direct comparison), Simile (like/as), Alliteration (repeated consonants), Personification", variables: "Use for poetry & prose analysis" },

  // Hindi (हिंदी)
  { id: "f-hin-1", name: "संधि के मुख्य भेद (Sandhi Rules)", subject: "hindi", formula: "स्वर संधि (दीर्घ, गुण, वृद्धि, यण, अयादि) + व्यंजन संधि + विसर्ग संधि", variables: "उदा: विद्या + आलय = विद्यालय (दीर्घ स्वर संधि)" },
  { id: "f-hin-2", name: "समास के ६ भेद (Samas Rules)", subject: "hindi", formula: "अव्ययीभाव, तत्पुरुष, कर्मधारय, द्विगु, द्वंद्व, बहुव्रीहि", variables: "उदा: पीतांबर = पीत है अम्बर जिसका (कृष्ण) - बहुव्रीहि" },
  { id: "f-hin-3", name: "कारक एवं विभक्ति चिह्न (Karak)", subject: "hindi", formula: "कर्ता (ने), कर्म (को), करण (से), संप्रदान (के लिए), अपादान (से पृथक), संबंध (का/की/के), अधिकरण (में/पर), संबोधन (हे/अरे)", variables: "आठों कारकों के अनिवार्य विभक्ति चिह्न" },
  { id: "f-hin-4", name: "प्रमुख अलंकार (Alankar)", subject: "hindi", formula: "शब्दालंकार (अनुप्रास, यमक, श्लेष) एवं अर्थालंकार (उपमा, रूपक, उत्प्रेक्षा, अतिशयोक्ति)", variables: "उदा: 'कनक कनक ते सौ गुनी' = यमक अलंकार" },

  // Computer Science
  { id: "f-15", name: "Binary Search Complexity", subject: "cs", formula: "O(log n) Time, O(1) Space", variables: "Requires sorted array input" },
  { id: "f-16", name: "QuickSort Average Time", subject: "cs", formula: "O(n log n) Average, O(n²) Worst", variables: "Pivot selection algorithm" },
];

interface HomeworkFormulaSheetProps {
  onInsertFormula: (formulaText: string) => void;
}

export const HomeworkFormulaSheet: React.FC<HomeworkFormulaSheetProps> = ({
  onInsertFormula,
}) => {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFormulas = FORMULA_DATABASE.filter((f) => {
    const matchesSubject = selectedSubject === "all" || f.subject === selectedSubject;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.formula.toLowerCase().includes(search.toLowerCase()) ||
      f.variables.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Formula &amp; Scientific Reference Library</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                Cheat Sheet
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Quick lookup for Math, Physics, Chemistry, and CS formulas with 1-click problem insertion
            </p>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["all", "math", "physics", "chemistry", "english", "hindi", "cs"].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-xl border uppercase font-bold shrink-0 transition-all ${
                selectedSubject === sub
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search equations, constants, or variables (e.g. ideal gas, quadratic, Newton)..."
          className="h-9 text-xs pl-10 rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
        {filteredFormulas.map((f) => (
          <div
            key={f.id}
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-cyan-500/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{f.name}</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  {f.subject}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-cyan-200 mt-1 bg-slate-900 p-2 rounded-xl border border-slate-800">
                {f.formula}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                {f.variables}
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Button
                size="sm"
                onClick={() => onInsertFormula(f.formula)}
                className="h-7 text-[11px] rounded-xl gap-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 flex-1 font-bold"
              >
                <Plus className="w-3 h-3" /> Insert into Problem
              </Button>

              <button
                onClick={() => handleCopy(f.id, f.formula)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy equation"
              >
                {copiedId === f.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
