import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import {
  Award,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  Sparkles,
  BarChart3,
  GraduationCap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export interface GradeEntry {
  id: string;
  subject: string;
  title: string;
  type: "Homework" | "Quiz" | "Midterm" | "Final Exam" | "Project";
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
}

export const HomeworkGradeTracker: React.FC = () => {
  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_homework_grades");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Remove any legacy mock IDs
          const clean = parsed.filter((g) => !/^g-[1-9]$/.test(g.id));
          return clean;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Maths");
  const [type, setType] = useState<GradeEntry["type"]>("Homework");
  const [score, setScore] = useState<number>(90);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [date, setDate] = useState(() => {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  });

  // Local storage save
  useEffect(() => {
    try {
      localStorage.setItem("knowdeep_homework_grades", JSON.stringify(grades));
    } catch {
      // ignore
    }
  }, [grades]);

  const filteredGrades = useMemo(() => {
    if (selectedSubjectFilter === "All") return grades;
    return grades.filter((g) => g.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());
  }, [grades, selectedSubjectFilter]);

  // Chart data format
  const chartData = useMemo(() => {
    return filteredGrades.map((g, index) => ({
      index: index + 1,
      name: `${g.date} (${g.subject})`,
      shortName: g.date,
      percentage: g.percentage,
      scoreText: `${g.score}/${g.maxScore}`,
      subject: g.subject,
      title: g.title,
    }));
  }, [filteredGrades]);

  // Aggregate metrics
  const averagePercentage = useMemo(() => {
    if (filteredGrades.length === 0) return 0;
    const sum = filteredGrades.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round((sum / filteredGrades.length) * 10) / 10;
  }, [filteredGrades]);

  const gpa = useMemo(() => {
    if (averagePercentage >= 93) return "4.0";
    if (averagePercentage >= 90) return "3.8";
    if (averagePercentage >= 87) return "3.5";
    if (averagePercentage >= 83) return "3.2";
    if (averagePercentage >= 80) return "3.0";
    if (averagePercentage >= 75) return "2.8";
    return "2.5";
  }, [averagePercentage]);

  const highestScore = useMemo(() => {
    if (filteredGrades.length === 0) return 0;
    return Math.max(...filteredGrades.map((g) => g.percentage));
  }, [filteredGrades]);

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || maxScore <= 0) return;

    const percentage = Math.round((score / maxScore) * 1000) / 10;
    const newEntry: GradeEntry = {
      id: "g-" + Date.now(),
      title: title.trim(),
      subject,
      type,
      score,
      maxScore,
      percentage,
      date: date || "Today",
    };

    setGrades((prev) => [...prev, newEntry]);
    setIsAddModalOpen(false);
    setTitle("");
    setScore(90);
    setMaxScore(100);
  };

  const handleDeleteGrade = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
  };

  const handleResetDefaults = () => {
    setGrades(INITIAL_GRADES);
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Academic Grade Tracker &amp; Performance Trend</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Recharts Analytics
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Input assessment scores and visualize your grade trajectory over the school term
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Add Grade Entry Modal Trigger */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-9 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md gap-1.5"
              >
                <Plus className="w-4 h-4" /> Log Marks / Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <GraduationCap className="w-5 h-5 text-emerald-400" /> Log Academic Assessment
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Record marks for an assignment, project, or exam to update your trend chart.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddGrade} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Assessment Title:
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Calculus Midterm or Hamlet Essay"
                    required
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Subject:</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-9 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white px-2.5"
                    >
                      <option value="Maths">Maths</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Science">Science (Physics/Chem/Bio)</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="CS">Computer Science</option>
                      <option value="Economics">Economics</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Type:</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as GradeEntry["type"])}
                      className="w-full h-9 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white px-2.5"
                    >
                      <option value="Homework">Homework</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Final Exam">Final Exam</option>
                      <option value="Project">Project</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Marks Scored:</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      required
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Max Marks:</label>
                    <Input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      required
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Date / Month:</label>
                    <Input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. Sep 28"
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>

                {/* Percentage Preview */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Calculated Score:</span>
                  <span className="font-bold text-emerald-400">
                    {maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0}%
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Save Assessment
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetDefaults}
            className="h-9 text-xs rounded-xl text-slate-400 hover:text-white"
            title="Reset sample grade data"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Average Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {averagePercentage}%
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              Grade {averagePercentage >= 90 ? "A" : averagePercentage >= 80 ? "B" : "C"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Estimated GPA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {gpa}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 4.0</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> Highest Grade
          </span>
          <span className="text-2xl font-black font-mono text-cyan-300">
            {highestScore}%
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" /> Total Logged
          </span>
          <span className="text-2xl font-black font-mono text-white">
            {filteredGrades.length} Tests
          </span>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-emerald-400" /> Filter Subject:
        </span>
        {["All", "Maths", "Science", "English", "Hindi", "CS"].map((subj) => (
          <button
            key={subj}
            onClick={() => setSelectedSubjectFilter(subj)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
              selectedSubjectFilter === subj
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Recharts Performance Trend Chart */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Chronological Performance Curve (% Scores)
          </span>
          <span className="text-emerald-400 font-bold">
            Target Goal: 90%
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="shortName" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis domain={[60, 100]} stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#f8fafc",
                  }}
                  formatter={(value: unknown, _name: unknown, item: { payload: { scoreText: string; subject: string; title: string } }) => [
                    `${value}% (${item.payload.scoreText})`,
                    `${item.payload.subject}: ${item.payload.title}`,
                  ]}
                  labelFormatter={(label) => `Assessment: ${label}`}
                />
                <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "90% Goal", fill: "#f59e0b", fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradeGradient)"
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              No assessments recorded for {selectedSubjectFilter}. Click &quot;Log Marks / Grade&quot; to begin tracking.
            </div>
          )}
        </div>
      </div>

      {/* Grade Ledger Table */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
          Recent Assessment Records:
        </span>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {filteredGrades.map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    g.percentage >= 90
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : g.percentage >= 80
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {Math.round(g.percentage)}%
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {g.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                      {g.subject}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
                      {g.type}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {g.date} · Scored {g.score} out of {g.maxScore} marks
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteGrade(g.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                title="Delete record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
