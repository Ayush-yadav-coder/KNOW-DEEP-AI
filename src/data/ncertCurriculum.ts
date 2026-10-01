// Comprehensive NCERT Curriculum Database for Classes 6-12
// Aligned with the latest NCERT / CBSE curriculum (2024-2025 rationalized edition)

export interface NCERTMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NCERTExerciseSolution {
  id: string;
  exerciseNumber: string;
  question: string;
  solution: string;
  tip?: string;
}

export interface NCERTPYQuestion {
  id: string;
  year: string;
  marks: number;
  question: string;
  solution: string;
  frequencyNote: string;
}

export interface NCERTFlashcard {
  id: string;
  front: string;
  back: string;
  type: "formula" | "definition" | "theorem" | "date" | "reaction";
}

export interface ConceptNode {
  id: string;
  label: string;
  category: "core" | "topic" | "theme" | "character" | "formula" | "law";
  description: string;
  details?: string;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  animated?: boolean;
}

export interface ChapterConceptMap {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface NCERTChapter {
  id: string;
  chapterNumber: number;
  title: string;
  hindiTitle?: string;
  bookName: string;
  summary: string;
  keyConcepts: string[];
  formulas?: string[];
  pdfUrl: string;
  conceptMap?: ChapterConceptMap;
  flashcards: NCERTFlashcard[];
  solutions: NCERTExerciseSolution[];
  pyqs: NCERTPYQuestion[];
  mcqs: NCERTMCQ[];
}

export interface NCERTSubject {
  id: string;
  name: string;
  hindiName: string;
  bookName: string;
  iconName: string;
  color: string;
  chapters: NCERTChapter[];
}

export interface NCERTClass {
  classNumber: string;
  label: string;
  stream?: string;
  subjects: NCERTSubject[];
}

// NCERT Database across Classes 6 to 12
export const NCERT_CURRICULUM: NCERTClass[] = [
  // CLASS 10 (Most popular Board Exam class)
  {
    classNumber: "10",
    label: "Class 10 (CBSE Board)",
    subjects: [
      {
        id: "math-10",
        name: "Mathematics",
        hindiName: "गणित",
        bookName: "NCERT Mathematics Class X",
        iconName: "Calculator",
        color: "from-blue-500 to-indigo-600",
        chapters: [
          {
            id: "ch-m10-1",
            chapterNumber: 1,
            title: "Real Numbers",
            hindiTitle: "वास्तविक संख्याएँ",
            bookName: "Mathematics",
            summary: "Fundamental Theorem of Arithmetic, irrationality proofs for √2, √3, √5, prime factorization, and decimal expansions.",
            keyConcepts: [
              "Fundamental Theorem of Arithmetic (Every composite number expressed as a unique product of primes)",
              "Revisiting Irrational Numbers (Proof by contradiction that √p is irrational)",
              "HCF(a, b) × LCM(a, b) = a × b for two positive integers",
            ],
            formulas: [
              "HCF(a, b) × LCM(a, b) = a × b",
              "p divides a² ⇒ p divides a (where p is prime)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jemh1=1-14",
            flashcards: [
              { id: "fc-10-1-1", front: "State the Fundamental Theorem of Arithmetic.", back: "Every composite number can be expressed (factorised) as a product of primes, and this factorisation is unique apart from the order in which the prime factors occur.", type: "theorem" },
              { id: "fc-10-1-2", front: "What is the relationship between HCF, LCM, and two numbers a and b?", back: "HCF(a, b) × LCM(a, b) = a × b. (Note: Only valid for two numbers, not for three).", type: "formula" },
              { id: "fc-10-1-3", front: "How do you prove √5 is irrational?", back: "Assume √5 = a/b in lowest terms (coprime). 5b² = a² ⇒ 5 divides a ⇒ a = 5c ⇒ 5b² = 25c² ⇒ b² = 5c² ⇒ 5 divides b. Contradicts coprimality of a and b.", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-10-1-1",
                exerciseNumber: "Ex 1.1 Q1",
                question: "Express 140 as a product of its prime factors.",
                solution: "140 ÷ 2 = 70\n70 ÷ 2 = 35\n35 ÷ 5 = 7\n7 ÷ 7 = 1\nTherefore, 140 = 2 × 2 × 5 × 7 = 2² × 5 × 7.",
                tip: "Always start dividing by the smallest prime number (2, then 3, then 5).",
              },
              {
                id: "sol-10-1-2",
                exerciseNumber: "Ex 1.1 Q2",
                question: "Find LCM and HCF of 26 and 91, and verify that LCM × HCF = product of the two numbers.",
                solution: "Prime factors:\n26 = 2 × 13\n91 = 7 × 13\nHCF = 13\nLCM = 2 × 7 × 13 = 182\nVerification: LCM × HCF = 182 × 13 = 2366\nProduct of numbers = 26 × 91 = 2366. Hence verified.",
              },
              {
                id: "sol-10-1-3",
                exerciseNumber: "Ex 1.2 Q1",
                question: "Prove that √5 is an irrational number.",
                solution: "Let us assume, to the contrary, that √5 is rational.\nThen √5 = a/b, where a and b are coprime integers (b ≠ 0).\nSquaring both sides: 5 = a² / b² ⇒ 5b² = a² ... (1)\nSince 5 divides a², by Theorem 1.3, 5 must divide a.\nLet a = 5c for some integer c.\nSubstitute in (1): 5b² = (5c)² = 25c² ⇒ b² = 5c²\nThis means 5 divides b², so 5 divides b.\nThus, 5 is a common factor of both a and b. This contradicts our assumption that a and b are coprime.\nHence, √5 is irrational.",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-1-1",
                year: "CBSE 2023, 2020",
                marks: 3,
                question: "Prove that 3 + 2√5 is irrational, given that √5 is irrational.",
                solution: "Let 3 + 2√5 be rational, so 3 + 2√5 = a/b where a, b ∈ Z and b ≠ 0.\n2√5 = a/b - 3 = (a - 3b)/b\n√5 = (a - 3b)/(2b)\nSince a, b are integers, (a - 3b)/(2b) is rational, which implies √5 is rational.\nThis contradicts the fact that √5 is irrational. Hence, 3 + 2√5 is irrational.",
                frequencyNote: "Repeated 4 times in the last 6 CBSE board exams.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-1-1",
                question: "If HCF(306, 657) = 9, what is LCM(306, 657)?",
                options: ["22338", "21338", "22383", "23238"],
                correctIndex: 0,
                explanation: "LCM = (a × b) / HCF = (306 × 657) / 9 = 34 × 657 = 22338.",
              },
              {
                id: "mcq-10-1-2",
                question: "The decimal expansion of 13 / (2² × 5) will terminate after how many decimal places?",
                options: ["1 place", "2 places", "3 places", "Does not terminate"],
                correctIndex: 1,
                explanation: "The denominator is 2² × 5¹. The highest power between 2 and 5 is 2. Hence it terminates after 2 decimal places (13/20 = 0.65).",
              },
            ],
          },
          {
            id: "ch-m10-2",
            chapterNumber: 2,
            title: "Polynomials",
            hindiTitle: "बहुपद",
            bookName: "Mathematics",
            summary: "Geometrical meaning of zeroes, relationship between zeroes and coefficients of quadratic and cubic polynomials.",
            keyConcepts: [
              "Geometrical Meaning: Zeroes are x-coordinates where graph y = P(x) intersects x-axis",
              "Sum of zeroes α + β = -b/a",
              "Product of zeroes α · β = c/a",
              "Quadratic polynomial formula: k[x² - (α + β)x + αβ]",
            ],
            formulas: [
              "α + β = -b/a",
              "α · β = c/a",
              "P(x) = k[x² - (Sum)x + (Product)]",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jemh1=2-14",
            flashcards: [
              { id: "fc-10-2-1", front: "What is the relationship between the zeroes (α, β) and coefficients of ax² + bx + c?", back: "Sum of zeroes: α + β = -b/a\nProduct of zeroes: αβ = c/a", type: "formula" },
              { id: "fc-10-2-2", front: "How many zeroes can a polynomial of degree n have?", back: "At most n real zeroes (it intersects the x-axis at most n times).", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-10-2-1",
                exerciseNumber: "Ex 2.1 Q1",
                question: "Find the zeroes of the quadratic polynomial x² - 2x - 8, and verify the relationship between the zeroes and coefficients.",
                solution: "x² - 2x - 8 = x² - 4x + 2x - 8 = x(x - 4) + 2(x - 4) = (x - 4)(x + 2)\nZeroes are α = 4, β = -2.\nSum of zeroes: α + β = 4 + (-2) = 2 = -(-2)/1 = -b/a.\nProduct of zeroes: αβ = 4 × (-2) = -8 = -8/1 = c/a. Verified!",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-2-1",
                year: "CBSE 2022",
                marks: 2,
                question: "Find a quadratic polynomial whose zeroes are 2 + √3 and 2 - √3.",
                solution: "Sum = (2 + √3) + (2 - √3) = 4\nProduct = (2 + √3)(2 - √3) = 4 - 3 = 1\nPolynomial = x² - (Sum)x + Product = x² - 4x + 1.",
                frequencyNote: "High probability 2-mark question pattern.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-2-1",
                question: "If one zero of the quadratic polynomial x² + 3x + k is 2, then the value of k is:",
                options: ["10", "-10", "-7", "-2"],
                correctIndex: 1,
                explanation: "Substitute x = 2: 2² + 3(2) + k = 0 ⇒ 4 + 6 + k = 0 ⇒ k = -10.",
              },
            ],
          },
          {
            id: "ch-m10-8",
            chapterNumber: 8,
            title: "Introduction to Trigonometry",
            hindiTitle: "त्रिकोणमिति का परिचय",
            bookName: "Mathematics",
            summary: "Trigonometric ratios of acute angles, ratios of 0°, 30°, 45°, 60°, 90°, and fundamental trigonometric identities.",
            keyConcepts: [
              "Trig Ratios: sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj",
              "Reciprocal Ratios: csc θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ",
              "Identity 1: sin² θ + cos² θ = 1",
              "Identity 2: 1 + tan² θ = sec² θ",
              "Identity 3: 1 + cot² θ = csc² θ",
            ],
            formulas: [
              "sin² θ + cos² θ = 1",
              "sec² θ - tan² θ = 1",
              "csc² θ - cot² θ = 1",
              "tan θ = sin θ / cos θ",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jemh1=8-14",
            flashcards: [
              { id: "fc-10-8-1", front: "State the primary Pythagorean Trigonometric Identity.", back: "sin²(θ) + cos²(θ) = 1 (valid for 0° ≤ θ ≤ 90°)", type: "formula" },
              { id: "fc-10-8-2", front: "What are the exact values of sin 30°, cos 30°, and tan 45°?", back: "sin 30° = 1/2\ncos 30° = √3/2\ntan 45° = 1", type: "formula" },
            ],
            solutions: [
              {
                id: "sol-10-8-1",
                exerciseNumber: "Ex 8.3 Q4(i)",
                question: "Prove that (cosec θ - cot θ)² = (1 - cos θ) / (1 + cos θ).",
                solution: "LHS = (1/sin θ - cos θ/sin θ)² = ((1 - cos θ)/sin θ)²\n= (1 - cos θ)² / sin² θ\n= (1 - cos θ)² / (1 - cos² θ)\n= (1 - cos θ)(1 - cos θ) / [(1 - cos θ)(1 + cos θ)]\n= (1 - cos θ) / (1 + cos θ) = RHS. Hence proved.",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-8-1",
                year: "CBSE 2023, 2021",
                marks: 5,
                question: "Prove that (sin θ - 2sin³ θ) / (2cos³ θ - cos θ) = tan θ.",
                solution: "LHS = sin θ(1 - 2sin² θ) / [cos θ(2cos² θ - 1)]\n= tan θ · [(sin² θ + cos² θ - 2sin² θ) / (2cos² θ - (sin² θ + cos² θ))]\n= tan θ · [(cos² θ - sin² θ) / (cos² θ - sin² θ)] = tan θ · 1 = tan θ = RHS.",
                frequencyNote: "One of the most frequently asked 5-mark proof questions.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-8-1",
                question: "The value of (sin² 30° + cos² 30°) is equal to:",
                options: ["0", "1/2", "1", "√3/2"],
                correctIndex: 2,
                explanation: "By identity sin² θ + cos² θ = 1 for any angle θ, sin² 30° + cos² 30° = 1.",
              },
            ],
          },
        ],
      },
      {
        id: "sci-10",
        name: "Science",
        hindiName: "विज्ञान",
        bookName: "NCERT Science Class X",
        iconName: "Atom",
        color: "from-emerald-500 to-teal-600",
        chapters: [
          {
            id: "ch-s10-1",
            chapterNumber: 1,
            title: "Chemical Reactions and Equations",
            hindiTitle: "रासायनिक अभिक्रियाएँ एवं समीकरण",
            bookName: "Science",
            summary: "Chemical equation balancing, types of reactions (combination, decomposition, displacement, double displacement, redox), and everyday oxidation effects (corrosion, rancidity).",
            keyConcepts: [
              "Law of Conservation of Mass: Total mass of reactants = total mass of products",
              "Combination: Two or more reactants combine to form a single product",
              "Decomposition: Single compound breaks down into two or more products (Thermal, Electrolytic, Photolytic)",
              "Redox: Oxidation is gain of oxygen/loss of electrons; Reduction is loss of oxygen/gain of electrons",
            ],
            formulas: [
              "CaO + H₂O → Ca(OH)₂ + Heat (Slaking of lime)",
              "2Pb(NO₃)₂ → 2PbO + 4NO₂↑ + O₂↑ (Thermal decomposition)",
              "2AgCl --(Sunlight)--> 2Ag + Cl₂↑ (Photolytic decomposition)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jesc1=1-13",
            flashcards: [
              { id: "fc-10-s1-1", front: "What observation indicates a chemical change has taken place?", back: "1. Change in state\n2. Change in colour\n3. Evolution of a gas\n4. Change in temperature\n5. Formation of a precipitate", type: "definition" },
              { id: "fc-10-s1-2", front: "Why is respiration considered an exothermic reaction?", back: "Glucose from food combines with oxygen in cells during respiration to produce carbon dioxide, water, and releases energy in the form of ATP.", type: "definition" },
              { id: "fc-10-s1-3", front: "Define Redox reaction with an example.", back: "A reaction where oxidation and reduction occur simultaneously. Example: CuO + H₂ → Cu + H₂O (CuO is reduced to Cu; H₂ is oxidized to H₂O).", type: "reaction" },
            ],
            solutions: [
              {
                id: "sol-10-s1-1",
                exerciseNumber: "Ex 1.1 Q1",
                question: "Why should a magnesium ribbon be cleaned before burning in air?",
                solution: "Magnesium is a very reactive metal. When stored, it reacts with atmospheric oxygen to form a thin protective layer of magnesium oxide (MgO) on its surface. This layer prevents further reaction with oxygen. Cleaning with sandpaper removes this oxide layer so it can ignite and burn readily.",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-s1-1",
                year: "CBSE 2023, 2019",
                marks: 3,
                question: "What happens when lead nitrate powder is heated in a boiling tube? Write the balanced chemical equation and state the colour of the gas evolved.",
                solution: "When lead nitrate [Pb(NO₃)₂] is heated, it decomposes thermally into lead oxide, nitrogen dioxide, and oxygen.\nBalanced equation: 2Pb(NO₃)₂(s) --Heat--> 2PbO(s) + 4NO₂(g) + O₂(g)\nObservation: Brown fumes of nitrogen dioxide (NO₂) gas are evolved, leaving a yellow residue of lead oxide (PbO).",
                frequencyNote: "Very frequent 3-mark board question in chemistry.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-s1-1",
                question: "Which of the following is a displacement reaction?",
                options: [
                  "MgCO₃ → MgO + CO₂",
                  "2Na + 2H₂O → 2NaOH + H₂",
                  "H₂ + Cl₂ → 2HCl",
                  "CaCO₃ → CaO + CO₂",
                ],
                correctIndex: 1,
                explanation: "Sodium (Na) displaces hydrogen from water to form sodium hydroxide (NaOH) and hydrogen gas (H₂).",
              },
            ],
          },
          {
            id: "ch-s10-6",
            chapterNumber: 5,
            title: "Life Processes",
            hindiTitle: "जैव प्रक्रम",
            bookName: "Science",
            summary: "Nutrition (Autotrophic & Heterotrophic), Human Digestive System, Respiration (Aerobic vs Anaerobic), Transportation in Humans and Plants, and Human Excretory System (Nephron).",
            keyConcepts: [
              "Photosynthesis: 6CO₂ + 12H₂O --(Sunlight, Chlorophyll)--> C₆H₁₂O₆ + 6O₂ + 6H₂O",
              "Human Heart: Double circulation (Pulmonary and Systemic)",
              "Kidney & Nephron: Ultrafiltration, selective reabsorption, and urine collection",
              "Xylem (water & minerals) vs Phloem (translocation of food)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jesc1=5-13",
            flashcards: [
              { id: "fc-10-s6-1", front: "Differentiate between Aerobic and Anaerobic Respiration.", back: "Aerobic: In presence of O₂, occurs in mitochondria, complete oxidation to CO₂ + H₂O, releases 36-38 ATP.\nAnaerobic: In absence of O₂, occurs in cytoplasm, yields Ethanol + CO₂ (yeast) or Lactic acid (muscle cramps), releases only 2 ATP.", type: "definition" },
              { id: "fc-10-s6-2", front: "What is the structural and functional unit of the human kidney?", back: "The Nephron. It consists of Bowman's capsule, Glomerulus, Proximal & Distal Convoluted Tubules, and Loop of Henle.", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-10-s6-1",
                exerciseNumber: "Ex 5.1 Q1",
                question: "Why is double circulation necessary in the human body?",
                solution: "Double circulation keeps oxygenated and deoxygenated blood completely separate. This ensures a highly efficient supply of oxygen to body cells, which is vital for warm-blooded animals like humans who need constant high energy to maintain a constant body temperature.",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-s6-1",
                year: "CBSE 2023, 2022",
                marks: 5,
                question: "Describe the structure and functioning of nephrons in the human kidney with labeled components.",
                solution: "Each nephron consists of: 1) Glomerulus (capillary cluster for filtration), 2) Bowman's capsule (cup-like sac), 3) Renal tubule (tubular part for reabsorption), 4) Collecting duct.\nFunctioning: Blood enters via renal artery at high pressure; glomerular filtrate forms containing water, glucose, amino acids, urea, and salts. As filtrate flows through tubule, glucose, amino acids, and water are selectively reabsorbed into surrounding capillaries. Waste liquid (urine) containing urea and excess salts flows into collecting duct.",
                frequencyNote: "Core 5-mark question in Class 10 Biology.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-s6-1",
                question: "The breakdown of pyruvate to give carbon dioxide, water, and energy takes place in:",
                options: ["Cytoplasm", "Mitochondria", "Chloroplast", "Nucleus"],
                correctIndex: 1,
                explanation: "The aerobic breakdown of pyruvate occurs within the mitochondria, producing CO₂, H₂O, and energy.",
              },
            ],
          },
        ],
      },
      {
        id: "sst-10",
        name: "Social Science",
        hindiName: "सामाजिक विज्ञान",
        bookName: "India and the Contemporary World II & Democratic Politics",
        iconName: "History",
        color: "from-amber-500 to-orange-600",
        chapters: [
          {
            id: "ch-sst10-1",
            chapterNumber: 1,
            title: "The Rise of Nationalism in Europe",
            hindiTitle: "यूरोप में राष्ट्रवाद का उदय",
            bookName: "History",
            summary: "French Revolution and idea of nation, Napoleonic Code 1804, Romanticism, Revolutions of 1848, Unification of Germany and Italy, and Balkan crises.",
            keyConcepts: [
              "Frederic Sorrieu's utopian vision of democratic and social republics (1848)",
              "Civil Code of 1804 (Napoleonic Code): abolished birth privileges, equality before law",
              "Giuseppe Mazzini & Young Italy / Young Europe",
              "Unification of Germany (Otto von Bismarck, 1871) and Italy (Cavour, Garibaldi, 1861)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jess1=1-5",
            flashcards: [
              { id: "fc-10-sst-1", front: "What were the key provisions of the Napoleonic Code of 1804?", back: "1. Did away with all privileges based on birth\n2. Established equality before law\n3. Secured the right to property\n4. Simplified administrative divisions and abolished feudal system\n5. Removed guild restrictions in towns", type: "definition" },
              { id: "fc-10-sst-2", front: "Who were Marianne and Germania?", back: "Female allegories representing nations. Marianne represented the Republic of France (liberty, tricolour, cockade). Germania represented the German nation (wearing a crown of oak leaves signifying heroism).", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-10-sst-1",
                exerciseNumber: "Ex Q1",
                question: "Explain the role of Otto von Bismarck in the unification of Germany.",
                solution: "Otto von Bismarck was the Chief Minister of Prussia who spearheaded German unification. He used the Prussian army and bureaucracy. Over 7 years, Prussia fought three wars with Austria, Denmark, and France, ending in Prussian victory. On 18 January 1871, King William I of Prussia was proclaimed German Emperor at the Hall of Mirrors in Versailles.",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-sst-1",
                year: "CBSE 2023, 2020",
                marks: 5,
                question: "How did the French Revolution create a sense of collective identity among the French people? State any 5 measures.",
                solution: "1. The ideas of la patrie (the fatherland) and le citoyen (the citizen) emphasized a united community enjoying equal rights.\n2. A new French tricolour flag replaced the former royal standard.\n3. The Estates General was elected by active citizens and renamed National Assembly.\n4. New hymns were composed, oaths taken, and martyrs commemorated in the name of the nation.\n5. Internal customs duties were abolished and a uniform system of weights and measures was adopted.",
                frequencyNote: "Appears in almost every alternate CBSE board paper.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-sst-1",
                question: "Who was proclaimed the King of unified Italy in 1861?",
                options: ["Victor Emmanuel II", "Giuseppe Garibaldi", "Count Cavour", "Giuseppe Mazzini"],
                correctIndex: 0,
                explanation: "In 1861, Victor Emmanuel II was proclaimed King of United Italy.",
              },
            ],
          },
        ],
      },
      {
        id: "eng-10",
        name: "English (First Flight)",
        hindiName: "अंग्रेजी",
        bookName: "First Flight & Footprints Without Feet",
        iconName: "BookOpen",
        color: "from-rose-500 to-pink-600",
        chapters: [
          {
            id: "ch-eng10-1",
            chapterNumber: 1,
            title: "A Letter to God (G.L. Fuentes)",
            bookName: "First Flight",
            summary: "Lencho's absolute, unwavering faith in God after a devastating hailstorm destroys his cornfields, and the postmaster's compassionate act of generosity.",
            keyConcepts: [
              "Themes: Unquestioning faith vs irony of human nature",
              "Lencho: A hardworking peasant who writes a letter demanding 100 pesos from God",
              "The Postmaster: Kind, generous human being who collects 70 pesos to preserve Lencho's faith",
              "Irony: Lencho calls the post office employees a 'bunch of crooks'",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jeff1=1-9",
            flashcards: [
              { id: "fc-10-eng-1", front: "What is the supreme irony at the conclusion of 'A Letter to God'?", back: "Lencho suspects the post office staff of stealing 30 pesos and calls them a 'bunch of crooks', completely unaware that they were the very people who sacrificed their own salaries to help him.", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-10-eng-1",
                exerciseNumber: "NCERT Q1",
                question: "Who does Lencho have complete faith in? Which sentences in the story tell you this?",
                solution: "Lencho had complete, unquestioning faith in God. Sentences showing this:\n1. 'All through the night, Lencho thought only of his one hope: the help of God, whose eyes see everything.'\n2. 'God, if you don't help me, my family and I will go hungry this year.'\n3. 'God could not have made a mistake, nor could he have denied Lencho what he had requested.'",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-eng-1",
                year: "CBSE 2023",
                marks: 3,
                question: "Why did the postmaster send money to Lencho? Why did he sign the letter 'God'?",
                solution: "The postmaster was deeply moved by Lencho's sheer, child-like faith in God. He didn't want this faith to be shaken. He signed the letter 'God' so that Lencho would believe that the money had genuinely been sent by God Himself.",
                frequencyNote: "Frequent 3-mark value-based question.",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-eng-1",
                question: "How much money did Lencho ask for, and how much did he receive?",
                options: ["Asked 100 pesos, got 70 pesos", "Asked 50 pesos, got 100 pesos", "Asked 70 pesos, got 100 pesos", "Asked 100 pesos, got 50 pesos"],
                correctIndex: 0,
                explanation: "Lencho demanded 100 pesos to sow his field again, but the postmaster was only able to collect 70 pesos.",
              },
            ],
          },
        ],
      },
      {
        id: "hin-10",
        name: "हिंदी (क्षितिज भाग 2)",
        hindiName: "हिंदी साहित्य एवं व्याकरण",
        bookName: "NCERT क्षितिज भाग 2",
        iconName: "Languages",
        color: "from-orange-500 to-red-600",
        chapters: [
          {
            id: "ch-hin10-1",
            chapterNumber: 1,
            title: "पद (सूरदास)",
            hindiTitle: "सूरदास के पद (भ्रमरगीत से)",
            bookName: "क्षितिज",
            summary: "उद्धव-गोपी संवाद। गोपियों का श्रीकृष्ण के प्रति अनन्य प्रेम, उद्धव के निर्गुण ज्ञान-योग पर गोपियों का व्यंग्य और प्रेम की श्रेष्ठता का प्रतिपादन।",
            keyConcepts: [
              "भ्रमरगीत प्रसंग: गोपियाँ उद्धव को 'बड़भागी' कहकर व्यंग्य करती हैं",
              "गोपियों का कृष्ण-प्रेम: हारिल पक्षी की लकड़ी के समान",
              "योग साधना की तुलना: कड़वी ककड़ी (कड़वी ककड़ी) से",
              "राजधर्म: राजा का धर्म है कि प्रजा को न सताया जाए",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?jhks1=1-14",
            flashcards: [
              { id: "fc-10-hin-1", front: "गोपियों ने उद्धव को 'बड़भागी' क्यों कहा है? इसमें क्या व्यंग्य है?", back: "गोपियाँ उद्धव को भाग्यशाली कहकर वस्तुतः अभागा सिद्ध कर रही हैं, क्योंकि वे प्रेम के सागर श्रीकृष्ण के निकट रहकर भी प्रेम रस से अछूते हैं, जैसे कमल का पत्ता जल में रहकर भी गीला नहीं होता।", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-10-hin-1",
                exerciseNumber: "अभ्यास प्रश्न 1",
                question: "गोपियों द्वारा उद्धव को भाग्यवान कहने में क्या व्यंग्य निहित है?",
                solution: "गोपियाँ उद्धव को भाग्यवान कहकर व्यंग्य करती हैं कि वे प्रेम के संसार में रहकर भी प्रेम के आनंद और विरह की वेदना से मुक्त हैं। उनका हृदय किसी के स्नेह बंधन में नहीं बंधा। वास्तव में गोपियों की दृष्टि में उद्धव अत्यंत अभागे हैं जो प्रेम रूपी अमृत से वंचित रह गए।",
              },
            ],
            pyqs: [
              {
                id: "pyq-10-hin-1",
                year: "CBSE 2023, 2022",
                marks: 3,
                question: "गोपियों ने अपने वाक्चातुर्य के आधार पर ज्ञानी उद्धव को परास्त कर दिया। उनके वाक्चातुर्य की विशेषताएँ लिखिए।",
                solution: "1. तीखा व्यंग्य: गोपियाँ उद्धव के योग को कड़वी ककड़ी बताती हैं।\n2. सहज तर्कशीलता: हारिल की लकड़ी के उदाहरण से अपने अनन्य प्रेम को सिद्ध करती हैं।\n3. स्पष्टवादिता: बिना किसी हिचक के अपनी विरह वेदना और कृष्ण के प्रति निष्ठा व्यक्त करती हैं।",
                frequencyNote: "अत्यधिक महत्वपूर्ण 3-अंक का प्रश्न।",
              },
            ],
            mcqs: [
              {
                id: "mcq-10-hin-1",
                question: "गोपियों ने उद्धव के योग संदेश की तुलना किससे की है?",
                options: ["कड़वी ककड़ी से", "मीठे फल से", "विष के घूँट से", "तीर से"],
                correctIndex: 0,
                explanation: "गोपियों ने कहा: 'सुनत जोग लागत है ऐसो, ज्यों करुई ककरी' (कड़वी ककड़ी)।",
              },
            ],
          },
        ],
      },
    ],
  },

  // CLASS 12 (Board & Entrance: JEE, NEET, CUET)
  {
    classNumber: "12",
    label: "Class 12 (Board & CUET / JEE / NEET)",
    subjects: [
      {
        id: "phy-12",
        name: "Physics",
        hindiName: "भौतिक विज्ञान",
        bookName: "NCERT Physics Part I & II Class XII",
        iconName: "Atom",
        color: "from-purple-500 to-indigo-600",
        chapters: [
          {
            id: "ch-p12-1",
            chapterNumber: 1,
            title: "Electric Charges and Fields",
            hindiTitle: "वैद्युत आवेश तथा क्षेत्र",
            bookName: "Physics Part I",
            summary: "Coulomb's Law, electric field lines, electric dipole, electric flux, Gauss's Theorem and applications (line charge, plane sheet, spherical shell).",
            keyConcepts: [
              "Coulomb's Law: F = (1 / 4πε₀) · (q₁q₂ / r²)",
              "Electric Field of Dipole: On axial line E = 2kp/r³, on equatorial line E = kp/r³",
              "Gauss's Law: Φ = ∮ E · dA = q_enclosed / ε₀",
              "Field due to infinite line charge: E = λ / (2πε₀r)",
            ],
            formulas: [
              "F = k · |q₁q₂| / r² (where k = 1 / 4πε₀ = 9 × 10⁹ N·m²/C²)",
              "Φ = ∮ E · dA = q / ε₀",
              "E_line = λ / (2πε₀r)",
              "E_sheet = σ / (2ε₀)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?leph1=1-8",
            flashcards: [
              { id: "fc-12-p1", front: "State Gauss's Theorem in electrostatics.", back: "The total electric flux through any closed Gaussian surface in free space is equal to 1/ε₀ times the total electric charge enclosed by the surface: ∮ E · dA = q_enclosed / ε₀.", type: "theorem" },
              { id: "fc-12-p2", front: "What is the electric field inside a uniformly charged conducting spherical shell?", back: "Zero (E = 0 for r < R), because no net electric charge is enclosed inside the Gaussian surface.", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-12-p1",
                exerciseNumber: "Ex 1.1",
                question: "What is the force between two small charged spheres having charges of 2 × 10⁻⁷ C and 3 × 10⁻⁷ C placed 30 cm apart in air?",
                solution: "q₁ = 2 × 10⁻⁷ C, q₂ = 3 × 10⁻⁷ C, r = 0.3 m\nF = (1/4πε₀) · (q₁q₂ / r²)\n= (9 × 10⁹ × 2 × 10⁻⁷ × 3 × 10⁻⁷) / (0.3)²\n= (54 × 10⁻⁵) / 0.09 = 6 × 10⁻³ N (Repulsive, as both are positive charges).",
              },
            ],
            pyqs: [
              {
                id: "pyq-12-p1",
                year: "CBSE 2023, 2020",
                marks: 5,
                question: "Using Gauss's law, derive an expression for the electric field due to an infinitely long straight uniformly charged wire of linear charge density λ.",
                solution: "Consider an infinite wire with linear charge density λ. Choose a cylindrical Gaussian surface of radius r and length L coaxial with the wire.\nTotal flux Φ = ∮ E · dA = E · (2πrL) [flux through flat circular ends is zero as E is perpendicular to normal dA].\nBy Gauss's Law: Φ = q_enclosed / ε₀ = (λ · L) / ε₀\nE · (2πrL) = λL / ε₀ ⇒ E = λ / (2πε₀r).\nDirection is radially outward if λ > 0.",
                frequencyNote: "Top rated 5-mark derivation in CBSE Class 12.",
              },
            ],
            mcqs: [
              {
                id: "mcq-12-p1",
                question: "The SI unit of electric flux is:",
                options: ["N / C", "N · m² / C", "N · m / C", "C / m²"],
                correctIndex: 1,
                explanation: "Flux Φ = E · A = (N/C) · m² = N · m² / C (or Volt · meter).",
              },
            ],
          },
        ],
      },
      {
        id: "chem-12",
        name: "Chemistry",
        hindiName: "रसायन विज्ञान",
        bookName: "NCERT Chemistry Part I & II Class XII",
        iconName: "FlaskConical",
        color: "from-teal-500 to-emerald-600",
        chapters: [
          {
            id: "ch-c12-1",
            chapterNumber: 1,
            title: "Solutions",
            hindiTitle: "विलयन",
            bookName: "Chemistry Part I",
            summary: "Types of solutions, Raoult's law, ideal and non-ideal solutions, colligative properties (relative lowering of VP, elevation of BP, depression of FP, osmotic pressure), and van 't Hoff factor.",
            keyConcepts: [
              "Raoult's Law: P_A = P°_A · x_A",
              "Colligative Properties: Depend only on the number of solute particles, not on their identity",
              "Elevation of Boiling Point: ΔT_b = i · K_b · m",
              "Osmotic Pressure: Π = i · C · R · T",
              "van 't Hoff factor i = (Normal molar mass) / (Abnormal molar mass)",
            ],
            formulas: [
              "P = P°_A · x_A + P°_B · x_B",
              "ΔT_b = i · K_b · m",
              "ΔT_f = i · K_f · m",
              "Π = i · CRT",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?lech1=1-9",
            flashcards: [
              { id: "fc-12-c1", front: "State Raoult's Law for a solution of volatile liquids.", back: "For a solution of volatile liquids, the partial vapour pressure of each component in the solution is directly proportional to its mole fraction in the solution: P_i = P°_i · x_i.", type: "theorem" },
              { id: "fc-12-c2", front: "Why do aquatic species feel more comfortable in cold water than in warm water?", back: "According to Henry's law, the solubility of gases (like O₂) in liquids decreases with increase in temperature. Therefore, cold water contains a higher concentration of dissolved oxygen.", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-12-c1",
                exerciseNumber: "Ex 1.1",
                question: "Calculate the mass percentage of benzene (C₆H₆) and carbon tetrachloride (CCl₄) if 22 g of benzene is dissolved in 122 g of CCl₄.",
                solution: "Total mass of solution = 22 g + 122 g = 144 g\nMass % of Benzene = (22 / 144) × 100 = 15.28%\nMass % of CCl₄ = (122 / 144) × 100 = 84.72%.",
              },
            ],
            pyqs: [
              {
                id: "pyq-12-c1",
                year: "CBSE 2023, 2022",
                marks: 3,
                question: "Define ideal solution. Give two characteristics of an ideal solution and write an example.",
                solution: "An ideal solution is one which obeys Raoult's law over the entire range of concentration.\nCharacteristics:\n1. ΔH_mixing = 0 (No heat is absorbed or evolved).\n2. ΔV_mixing = 0 (Total volume equals sum of individual volumes).\nExample: n-hexane and n-heptane, or Bromoethane and Chloroethane.",
                frequencyNote: "Standard 3-mark conceptual question.",
              },
            ],
            mcqs: [
              {
                id: "mcq-12-c1",
                question: "Which of the following colligative properties is most suitable for determining the molar mass of polymers and proteins?",
                options: ["Relative lowering of vapour pressure", "Elevation of boiling point", "Depression of freezing point", "Osmotic pressure"],
                correctIndex: 3,
                explanation: "Osmotic pressure is measured at room temperature and uses molarity instead of molality. Changes in BP/FP are too small to measure accurately for high molecular weight macromolecules.",
              },
            ],
          },
        ],
      },
      {
        id: "math-12",
        name: "Mathematics",
        hindiName: "गणित",
        bookName: "NCERT Mathematics Part I & II Class XII",
        iconName: "Calculator",
        color: "from-blue-600 to-indigo-700",
        chapters: [
          {
            id: "ch-m12-5",
            chapterNumber: 5,
            title: "Continuity and Differentiability",
            hindiTitle: "सांतत्य तथा अवकलनीयता",
            bookName: "Mathematics Part I",
            summary: "Continuity at a point and on an interval, derivative of composite functions (Chain Rule), inverse trig derivatives, implicit differentiation, logarithmic differentiation, and Mean Value Theorem.",
            keyConcepts: [
              "Continuity Condition: lim (x→c⁻) f(x) = lim (x→c⁺) f(x) = f(c)",
              "Chain Rule: d/dx [f(g(x))] = f'(g(x)) · g'(x)",
              "Logarithmic Differentiation: Used when function has power of another function [u(x)]^v(x)",
            ],
            formulas: [
              "d/dx [sin⁻¹ x] = 1 / √(1 - x²)",
              "d/dx [tan⁻¹ x] = 1 / (1 + x²)",
              "d/dx [e^x] = e^x",
              "d/dx [a^x] = a^x · ln(a)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?lemh1=5-6",
            flashcards: [
              { id: "fc-12-m1", front: "What is the mathematical condition for a function f(x) to be continuous at x = a?", back: "lim (x→a⁻) f(x) = lim (x→a⁺) f(x) = f(a) (LHL = RHL = Value of function at that point).", type: "theorem" },
              { id: "fc-12-m2", front: "What is the derivative of f(x) = x^x for x > 0?", back: "Let y = x^x ⇒ ln y = x ln x ⇒ (1/y) dy/dx = 1 + ln x ⇒ dy/dx = x^x (1 + ln x).", type: "formula" },
            ],
            solutions: [
              {
                id: "sol-12-m1",
                exerciseNumber: "Ex 5.5 Q1",
                question: "Differentiate cos x · cos 2x · cos 3x with respect to x.",
                solution: "Let y = cos x · cos 2x · cos 3x\nTaking log on both sides: ln y = ln(cos x) + ln(cos 2x) + ln(cos 3x)\nDifferentiating w.r.t x:\n(1/y) dy/dx = (-sin x / cos x) + (-2sin 2x / cos 2x) + (-3sin 3x / cos 3x)\n(1/y) dy/dx = -[tan x + 2 tan 2x + 3 tan 3x]\ndy/dx = -cos x · cos 2x · cos 3x · [tan x + 2 tan 2x + 3 tan 3x].",
              },
            ],
            pyqs: [
              {
                id: "pyq-12-m1",
                year: "CBSE 2023, 2021",
                marks: 5,
                question: "If y = (sin⁻¹ x)², prove that (1 - x²) d²y/dx² - x dy/dx - 2 = 0.",
                solution: "y = (sin⁻¹ x)²\nFirst derivative: dy/dx = 2(sin⁻¹ x) / √(1 - x²)\n√(1 - x²) dy/dx = 2 sin⁻¹ x\nSquaring both sides: (1 - x²)(dy/dx)² = 4 (sin⁻¹ x)² = 4y\nDifferentiating w.r.t x using product rule:\n(1 - x²) · 2(dy/dx) · (d²y/dx²) + (dy/dx)² · (-2x) = 4 dy/dx\nDividing throughout by 2(dy/dx) ≠ 0:\n(1 - x²) d²y/dx² - x dy/dx = 2\n(1 - x²) d²y/dx² - x dy/dx - 2 = 0. Hence proved.",
                frequencyNote: "Legendary 5-mark question in Class 12 Boards.",
              },
            ],
            mcqs: [
              {
                id: "mcq-12-m1",
                question: "The derivative of sin⁻¹(2x / (1 + x²)) with respect to tan⁻¹ x is:",
                options: ["1", "2", "2 / (1 + x²)", "1 / (1 + x²)"],
                correctIndex: 1,
                explanation: "Substitute x = tan θ. Then sin⁻¹(2 tan θ / (1 + tan² θ)) = sin⁻¹(sin 2θ) = 2θ = 2 tan⁻¹ x. Let u = 2 tan⁻¹ x and v = tan⁻¹ x. du/dv = 2.",
              },
            ],
          },
        ],
      },
    ],
  },

  // CLASS 9
  {
    classNumber: "9",
    label: "Class 9",
    subjects: [
      {
        id: "math-9",
        name: "Mathematics",
        hindiName: "गणित",
        bookName: "NCERT Mathematics Class IX",
        iconName: "Calculator",
        color: "from-blue-500 to-indigo-600",
        chapters: [
          {
            id: "ch-m9-1",
            chapterNumber: 1,
            title: "Number Systems",
            hindiTitle: "संख्या पद्धति",
            bookName: "Mathematics",
            summary: "Rational numbers, irrational numbers, locating √2 and √3 on number line, real numbers and decimal expansions, rationalizing the denominator.",
            keyConcepts: [
              "Every rational number has terminating or non-terminating repeating decimal",
              "Irrational numbers have non-terminating non-repeating decimal expansion",
              "Laws of exponents for real numbers",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?iemh1=1-12",
            flashcards: [
              { id: "fc-9-1", front: "What is the decimal expansion of an irrational number?", back: "Non-terminating and non-recurring (non-repeating). Example: π = 3.14159... or √2 = 1.41421...", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-9-1",
                exerciseNumber: "Ex 1.1 Q1",
                question: "Is zero a rational number? Can you write it in the form p/q, where p and q are integers and q ≠ 0?",
                solution: "Yes, zero is a rational number. It can be written as 0/1, 0/2, 0/3, etc., where p = 0 and q = 1, 2, 3... which are integers and q ≠ 0.",
              },
            ],
            pyqs: [
              {
                id: "pyq-9-1",
                year: "Annual Exam",
                marks: 3,
                question: "Express 0.2353535... in the form p/q.",
                solution: "Let x = 0.2353535...\n10x = 2.353535... (1)\n1000x = 235.353535... (2)\nSubtracting (1) from (2): 990x = 233 ⇒ x = 233 / 990.",
                frequencyNote: "Core Class 9 standard exam question.",
              },
            ],
            mcqs: [
              {
                id: "mcq-9-1",
                question: "Between two rational numbers, there are:",
                options: ["Infinitely many rational numbers", "Only one rational number", "No rational number", "Only 10 rational numbers"],
                correctIndex: 0,
                explanation: "By density property of rational numbers, there exist infinitely many rational numbers between any two rational numbers.",
              },
            ],
          },
        ],
      },
      {
        id: "sci-9",
        name: "Science",
        hindiName: "विज्ञान",
        bookName: "NCERT Science Class IX",
        iconName: "Atom",
        color: "from-emerald-500 to-teal-600",
        chapters: [
          {
            id: "ch-s9-7",
            chapterNumber: 7,
            title: "Motion",
            hindiTitle: "गति",
            bookName: "Science",
            summary: "Distance vs displacement, speed and velocity, uniform & non-uniform motion, acceleration, graphical representation of motion, and 3 equations of motion.",
            keyConcepts: [
              "v = u + at",
              "s = ut + (1/2)at²",
              "v² - u² = 2as",
              "Slope of Distance-Time graph gives speed; slope of Velocity-Time graph gives acceleration",
              "Area under v-t graph gives displacement",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?iesc1=7-12",
            flashcards: [
              { id: "fc-9-s1", front: "State the three equations of uniformly accelerated motion.", back: "1. v = u + at\n2. s = ut + (1/2)at²\n3. v² = u² + 2as", type: "formula" },
            ],
            solutions: [
              {
                id: "sol-9-s1",
                exerciseNumber: "Ex 7.1 Q1",
                question: "An athlete completes one round of a circular track of diameter 200 m in 40 s. What will be the distance covered and displacement at the end of 2 minutes 20 s?",
                solution: "Total time = 2 min 20 s = 140 s.\nNumber of rounds = 140 / 40 = 3.5 rounds.\nRadius r = 100 m.\nDistance = 3.5 × 2πr = 3.5 × 2 × (22/7) × 100 = 2200 m.\nDisplacement = After 3.5 rounds, the athlete is diametrically opposite to the start point, so displacement = Diameter = 200 m.",
              },
            ],
            pyqs: [
              {
                id: "pyq-9-s1",
                year: "Final Exam",
                marks: 5,
                question: "Derive graphically the equation for position-time relation: s = ut + (1/2)at².",
                solution: "Draw v-t graph for body moving with initial velocity u and uniform acceleration a reaching velocity v in time t.\nArea under graph = Area of rectangle OACD + Area of triangle ABD\n= (u × t) + (1/2 × base × height)\n= ut + 1/2 × t × (v - u)\nSince v - u = at, Area s = ut + 1/2 × t × (at) = ut + 1/2 at².",
                frequencyNote: "Fundamental physics derivation in Class 9.",
              },
            ],
            mcqs: [
              {
                id: "mcq-9-s1",
                question: "The area under a Velocity-Time graph represents a physical quantity with unit:",
                options: ["m/s", "m²", "m", "m/s²"],
                correctIndex: 2,
                explanation: "Area under v-t graph represents displacement, whose SI unit is meter (m).",
              },
            ],
          },
        ],
      },
    ],
  },

  // CLASS 8
  {
    classNumber: "8",
    label: "Class 8",
    subjects: [
      {
        id: "math-8",
        name: "Mathematics",
        hindiName: "गणित",
        bookName: "NCERT Mathematics Class VIII",
        iconName: "Calculator",
        color: "from-blue-500 to-indigo-600",
        chapters: [
          {
            id: "ch-m8-1",
            chapterNumber: 1,
            title: "Rational Numbers",
            hindiTitle: "परिमेय संख्याएँ",
            bookName: "Mathematics",
            summary: "Properties of rational numbers: closure, commutativity, associativity, role of 0 and 1, additive and multiplicative inverse, and distributivity.",
            keyConcepts: [
              "Additive inverse of a/b is -a/b",
              "Multiplicative inverse (reciprocal) of a/b is b/a (a, b ≠ 0)",
              "0 has no reciprocal",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?hemh1=1-13",
            flashcards: [
              { id: "fc-8-1", front: "What is the additive and multiplicative identity of rational numbers?", back: "Additive Identity: 0 (a + 0 = a)\nMultiplicative Identity: 1 (a × 1 = a)", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-8-1",
                exerciseNumber: "Ex 1.1 Q1",
                question: "Using appropriate properties find: -2/3 × 3/5 + 5/2 - 3/5 × 1/6.",
                solution: "Rearranging using Commutative property:\n= -2/3 × 3/5 - 3/5 × 1/6 + 5/2\n= 3/5 × (-2/3 - 1/6) + 5/2 (Distributive property)\n= 3/5 × (-4/6 - 1/6) + 5/2\n= 3/5 × (-5/6) + 5/2\n= -1/2 + 5/2 = 4/2 = 2.",
              },
            ],
            pyqs: [
              {
                id: "pyq-8-1",
                year: "Class 8 Midterm",
                marks: 2,
                question: "Write the multiplicative inverse of -13/19.",
                solution: "Multiplicative inverse of -13/19 is -19/13 (since -13/19 × -19/13 = 1).",
                frequencyNote: "Essential foundation concept.",
              },
            ],
            mcqs: [
              {
                id: "mcq-8-1",
                question: "The rational number that does NOT have a reciprocal is:",
                options: ["0", "1", "-1", "1/2"],
                correctIndex: 0,
                explanation: "1/0 is undefined, so 0 has no reciprocal.",
              },
            ],
          },
        ],
      },
    ],
  },

  // CLASS 7 & 6 (Available in selector)
  {
    classNumber: "7",
    label: "Class 7",
    subjects: [
      {
        id: "sci-7",
        name: "Science",
        hindiName: "विज्ञान",
        bookName: "NCERT Science Class VII",
        iconName: "Atom",
        color: "from-emerald-500 to-teal-600",
        chapters: [
          {
            id: "ch-s7-1",
            chapterNumber: 1,
            title: "Nutrition in Plants",
            hindiTitle: "पादपों में पोषण",
            bookName: "Science",
            summary: "Autotrophic nutrition, photosynthesis, chlorophyll, stomata, insectivorous plants, and saprotrophs.",
            keyConcepts: [
              "Autotrophs: Organisms that make food themselves (Green plants)",
              "Photosynthesis requires Sunlight, Chlorophyll, CO₂, and H₂O",
              "Stomata: Tiny pores on leaf surface for gaseous exchange",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?gesc1=1-13",
            flashcards: [
              { id: "fc-7-1", front: "Name the pores through which leaves exchange gases during photosynthesis.", back: "Stomata (surrounded by guard cells).", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-7-1",
                exerciseNumber: "Ex 1.1 Q1",
                question: "Why do organisms take food?",
                solution: "Organisms take food to: 1) Build their bodies, 2) Grow, 3) Repair damaged parts of their bodies, and 4) Provide energy to carry out life processes.",
              },
            ],
            pyqs: [
              {
                id: "pyq-7-1",
                year: "Class 7 Annual",
                marks: 3,
                question: "Differentiate between a parasite and a saprotroph with examples.",
                solution: "Parasite: Lives on/inside a host organism and derives nutrition from it without killing it (e.g. Cuscuta / Amarbel).\nSaprotroph: Secretes digestive juices on dead and decaying matter and absorbs nutrients in solution form (e.g. Fungi / Mushrooms).",
                frequencyNote: "Core life science distinction.",
              },
            ],
            mcqs: [
              {
                id: "mcq-7-1",
                question: "The plant which traps and feeds on insects is:",
                options: ["Cuscuta", "China rose", "Pitcher plant", "Rose"],
                correctIndex: 2,
                explanation: "Pitcher plant (Nepenthes) is insectivorous; its modified leaf forms a jug/pitcher with a lid.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    classNumber: "6",
    label: "Class 6 (Foundational Middle School)",
    subjects: [
      {
        id: "sci-6",
        name: "Science (Curiosity)",
        hindiName: "विज्ञान",
        bookName: "Curiosity NCERT Science Class VI",
        iconName: "Atom",
        color: "from-emerald-500 to-teal-600",
        chapters: [
          {
            id: "ch-s6-1",
            chapterNumber: 1,
            title: "Components of Food",
            hindiTitle: "भोजन के घटक",
            bookName: "Science",
            summary: "Nutrients (carbohydrates, proteins, fats, vitamins, minerals), dietary fibres (roughage), balanced diet, and deficiency diseases.",
            keyConcepts: [
              "Major nutrients: Carbohydrates and fats give energy; Proteins for growth & repair; Vitamins & minerals protect against diseases",
              "Testing for starch: Iodine test (turns blue-black)",
              "Deficiency diseases: Scurvy (Vit C), Rickets (Vit D), Beriberi (Vit B1), Goitre (Iodine), Anaemia (Iron)",
            ],
            pdfUrl: "https://ncert.nic.in/textbook.php?fesc1=1-12",
            flashcards: [
              { id: "fc-6-1", front: "Which nutrient turns blue-black when tested with iodine solution?", back: "Starch (Carbohydrate).", type: "definition" },
              { id: "fc-6-2", front: "Name the deficiency disease caused by lack of Vitamin C.", back: "Scurvy (symptoms: bleeding gums, wounds taking longer time to heal).", type: "definition" },
            ],
            solutions: [
              {
                id: "sol-6-1",
                exerciseNumber: "Ex 1.1 Q1",
                question: "Name the major nutrients in our food.",
                solution: "The major nutrients in our food are: Carbohydrates, Proteins, Fats, Vitamins, Minerals, Dietary fibres (roughage), and Water.",
              },
            ],
            pyqs: [
              {
                id: "pyq-6-1",
                year: "Class 6 Annual",
                marks: 3,
                question: "What is a balanced diet? Why is it important?",
                solution: "A diet that contains all the necessary nutrients (carbohydrates, proteins, fats, vitamins, minerals) in the right proportion, along with an adequate amount of roughage and water, is called a balanced diet. It is essential for proper growth, health, and disease resistance.",
                frequencyNote: "Fundamental nutrition question.",
              },
            ],
            mcqs: [
              {
                id: "mcq-6-1",
                question: "Night blindness is caused by the deficiency of which vitamin?",
                options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
                correctIndex: 0,
                explanation: "Deficiency of Vitamin A causes night blindness (poor vision in darkness).",
              },
            ],
          },
        ],
      },
    ],
  },
];

// Dynamic Concept Map Generator for all NCERT Chapters
export function generateChapterConceptMap(chapter: NCERTChapter): ChapterConceptMap {
  if (chapter.conceptMap && chapter.conceptMap.nodes.length > 0) {
    return chapter.conceptMap;
  }

  const nodes: ConceptNode[] = [];
  const edges: ConceptEdge[] = [];

  // Root Central Node
  const rootId = `node-root-${chapter.id}`;
  nodes.push({
    id: rootId,
    label: chapter.title,
    category: "core",
    description: `Core NCERT Chapter ${chapter.chapterNumber}: ${chapter.summary}`,
    details: `Official textbook: ${chapter.bookName}. Grounded in CBSE board marking patterns.`,
  });

  // Specific hand-tuned graphs for major chapters
  if (chapter.title.includes("Letter to God")) {
    nodes.push(
      { id: "node-c1", label: "Lencho", category: "character", description: "Hardworking peasant with supreme, unquestioning faith in God.", details: "Writes a letter to God requesting 100 pesos after a hailstorm destroys his cornfields." },
      { id: "node-c2", label: "The Postmaster", category: "character", description: "Compassionate, generous man who collects 70 pesos to preserve Lencho's faith.", details: "Signs the letter 'God' so Lencho's faith remains unshaken." },
      { id: "node-t1", label: "The Hailstorm", category: "topic", description: "Sudden natural catastrophe destroying Lencho's entire harvest.", details: "Turns Lencho's hope into despair, leading to the letter to God." },
      { id: "node-th1", label: "Unshakable Faith", category: "theme", description: "Central thematic contrast: Child-like faith vs pragmatic reality.", details: "Lencho never doubts that God can send money directly." },
      { id: "node-th2", label: "Irony of Human Nature", category: "theme", description: "Tragicomic irony: Benefactors labeled 'a bunch of crooks'.", details: "Lencho suspects the very post office workers who sacrificed their money." }
    );
    edges.push(
      { id: "e-1", source: rootId, target: "node-c1", label: "protagonist in" },
      { id: "e-2", source: rootId, target: "node-c2", label: "antagonist/helper in" },
      { id: "e-3", source: "node-c1", target: "node-t1", label: "devastated by" },
      { id: "e-4", source: "node-t1", target: "node-c2", label: "triggers empathy in" },
      { id: "e-5", source: "node-c1", target: "node-th1", label: "exemplifies" },
      { id: "e-6", source: "node-c2", target: "node-th2", label: "misunderstood in" },
      { id: "e-7", source: "node-th1", target: "node-th2", label: "creates dramatic irony with", animated: true }
    );
    return { nodes, edges };
  }

  if (chapter.title.includes("सूरदास के पद") || chapter.title.includes("पद (सूरदास)")) {
    nodes.push(
      { id: "node-h-c1", label: "गोपियाँ (Gopis)", category: "character", description: "श्रीकृष्ण के प्रति अनन्य प्रेम एवं विरह में लीन भक्त।", details: "उद्धव के ज्ञान-योग पर व्यंग्य करती हैं और प्रेम को सर्वोपरि मानती हैं।" },
      { id: "node-h-c2", label: "उद्धव (Uddhav)", category: "character", description: "निर्गुण ब्रह्म और योग साधना के ज्ञानी दूत।", details: "श्रीकृष्ण का संदेश लेकर गोकुल आते हैं लेकिन गोपियों के प्रेम के आगे निरुत्तर हो जाते हैं।" },
      { id: "node-h-c3", label: "श्रीकृष्ण (Krishna)", category: "character", description: "प्रेम और भक्ति के केंद्र।", details: "गोपियों के आराध्य, जिनका विरह गोपियों की वेदना का मूल कारण है।" },
      { id: "node-h-th1", label: "सगुण प्रेम बनाम निर्गुण योग", category: "theme", description: "काव्य का मूल द्वंद्व: ज्ञान पर भक्ति और प्रेम की विजय।", details: "गोपियाँ योग संदेश को 'कड़वी ककड़ी' कहकर ठुकरा देती हैं।" },
      { id: "node-h-th2", label: "भ्रमरगीत परंपरा एवं उपालंभ", category: "theme", description: "भ्रमर (भौरे) को माध्यम बनाकर उद्धव पर किया गया शिष्ट व्यंग्य।", details: "सूरसागर का अत्यंत मार्मिक और कलात्मक खंड।" }
    );
    edges.push(
      { id: "eh-1", source: rootId, target: "node-h-c1", label: "केंद्रीय पात्र" },
      { id: "eh-2", source: rootId, target: "node-h-c2", label: "ज्ञानमार्गी संदेशवाहक" },
      { id: "eh-3", source: "node-h-c2", target: "node-h-c1", label: "योग संदेश देता है" },
      { id: "eh-4", source: "node-h-c1", target: "node-h-c2", label: "वाक्चातुर्य से परास्त करती हैं", animated: true },
      { id: "eh-5", source: "node-h-c1", target: "node-h-c3", label: "अनन्य प्रेम (हारिल की लकड़ी)" },
      { id: "eh-6", source: rootId, target: "node-h-th1", label: "मुख्य वैचारिक थीम" },
      { id: "eh-7", source: "node-h-th1", target: "node-h-th2", label: "अभिव्यक्त होता है" }
    );
    return { nodes, edges };
  }

  if (chapter.title.includes("Nationalism in Europe")) {
    nodes.push(
      { id: "node-eu-1", label: "Frederic Sorrieu's Vision", category: "theme", description: "1848 utopian prints depicting world of democratic republics.", details: "Peoples of Europe and America marching past Statue of Liberty." },
      { id: "node-eu-2", label: "Napoleonic Code (1804)", category: "law", description: "Civil code establishing equality before law and abolishing feudal privileges.", details: "Standardized weights, measures, and secured right to property." },
      { id: "node-eu-3", label: "Otto von Bismarck", category: "character", description: "Architect of German unification using Prussian army and bureaucracy.", details: "Followed 'Blood and Iron' policy, proclaimed German Empire in 1871." },
      { id: "node-eu-4", label: "Giuseppe Mazzini", category: "character", description: "Italian revolutionary who founded Young Italy and Young Europe.", details: "Believed nations are natural units of mankind." },
      { id: "node-eu-5", label: "Nation-State & Liberalism", category: "topic", description: "Political transition from dynastic monarchies to constitutional states.", details: "Zollverein customs union removed trade barriers." }
    );
    edges.push(
      { id: "eeu-1", source: rootId, target: "node-eu-1", label: "visualized by" },
      { id: "eeu-2", source: rootId, target: "node-eu-2", label: "institutionalized by" },
      { id: "eeu-3", source: rootId, target: "node-eu-5", label: "philosophical foundation" },
      { id: "eeu-4", source: "node-eu-5", target: "node-eu-4", label: "revolutionary movement" },
      { id: "eeu-5", source: "node-eu-5", target: "node-eu-3", label: "unified Germany under", animated: true }
    );
    return { nodes, edges };
  }

  // General Algorithmic Generator for any chapter
  chapter.keyConcepts.slice(0, 5).forEach((concept, idx) => {
    const conceptId = `node-concept-${idx}`;
    const cleanLabel = concept.split("(")[0].replace(/^Chapter \d+:\s*/, "").trim();
    nodes.push({
      id: conceptId,
      label: cleanLabel.slice(0, 32),
      category: "topic",
      description: concept,
      details: `Key textbook milestone in Chapter ${chapter.chapterNumber} of NCERT ${chapter.bookName}.`,
    });
    edges.push({
      id: `edge-root-${idx}`,
      source: rootId,
      target: conceptId,
      label: idx === 0 ? "core foundation" : idx === 1 ? "explores" : idx === 2 ? "governed by" : "applies to",
    });
  });

  // Attach formulas if present
  if (chapter.formulas && chapter.formulas.length > 0) {
    chapter.formulas.slice(0, 3).forEach((formula, fIdx) => {
      const formId = `node-formula-${fIdx}`;
      nodes.push({
        id: formId,
        label: formula.slice(0, 28),
        category: "formula",
        description: `Mathematical/Chemical equation: ${formula}`,
        details: "Frequently tested formula in CBSE board exam numericals and proofs.",
      });
      // Link to an existing topic node or root
      const targetSource = nodes[1] ? nodes[1].id : rootId;
      edges.push({
        id: `edge-form-${fIdx}`,
        source: targetSource,
        target: formId,
        label: "formulated as",
        animated: true,
      });
    });
  }

  // Cross-link first two concept nodes for richer mesh
  if (nodes.length >= 3) {
    edges.push({
      id: `edge-cross-1`,
      source: nodes[1].id,
      target: nodes[2].id,
      label: "interconnected with",
    });
  }

  return { nodes, edges };
}
