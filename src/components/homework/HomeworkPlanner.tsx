import React, { useState, useEffect } from "react";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface PlannerSubtask {
  id: string;
  title: string;
  estimatedMinutes: number;
  description: string;
  completed: boolean;
  category: "Planning" | "Drafting" | "Solving" | "Review" | "Research";
  difficulty: "Easy" | "Medium" | "Challenging";
}

export interface HomeworkAssignmentPlan {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  totalEstimatedMinutes: number;
  subtasks: PlannerSubtask[];
}

const TEMPLATE_ASSIGNMENTS = [
  {
    title: "English 5-Paragraph Persuasive Essay",
    subject: "English",
    dueDate: "Tomorrow 6:00 PM",
    subtasks: [
      { id: "st-1", title: "Analyze Essay Prompt & Develop Thesis Statement", estimatedMinutes: 15, description: "Identify argument, target audience, and 3 key supporting claims.", completed: false, category: "Planning" as const, difficulty: "Easy" as const },
      { id: "st-2", title: "Gather 3 Scholarly Quotes & Evidence", estimatedMinutes: 20, description: "Collect primary text excerpts and page citations.", completed: false, category: "Research" as const, difficulty: "Medium" as const },
      { id: "st-3", title: "Write Introduction & Hook", estimatedMinutes: 20, description: "Draft opening hook, context, and place thesis at end.", completed: false, category: "Drafting" as const, difficulty: "Medium" as const },
      { id: "st-4", title: "Draft 3 Body Paragraphs (PEEL Method)", estimatedMinutes: 45, description: "Point, Evidence, Explanation, Link for all 3 paragraphs.", completed: false, category: "Drafting" as const, difficulty: "Challenging" as const },
      { id: "st-5", title: "Write Conclusion & Synthesis", estimatedMinutes: 15, description: "Synthesize findings without repeating verbatim, provide final takeaway.", completed: false, category: "Drafting" as const, difficulty: "Medium" as const },
      { id: "st-6", title: "Grammar, Citation & Final Polish", estimatedMinutes: 15, description: "Check MLA/APA formatting, transitions, and spelling.", completed: false, category: "Review" as const, difficulty: "Easy" as const },
    ],
  },
  {
    title: "हिंदी निबंध एवं व्याकरण अभ्यास (Hindi Essay & Grammar)",
    subject: "Hindi",
    dueDate: "2 Days",
    subtasks: [
      { id: "st-h1", title: "विषय चयन एवं रूपरेखा निर्माण (Topic & Outline)", estimatedMinutes: 15, description: "प्रस्तावना, मुख्य बिंदु, लाभ-हानि एवं उपसंहार की रूपरेखा बनाएं।", completed: false, category: "Planning" as const, difficulty: "Easy" as const },
      { id: "st-h2", title: "पर्यावरण प्रदूषण पर मुख्य निबंध लेखन (Drafting)", estimatedMinutes: 30, description: "शुद्ध वर्तनी एवं मुहावरों का प्रयोग करते हुए 350 शब्दों का निबंध लिखें।", completed: false, category: "Drafting" as const, difficulty: "Medium" as const },
      { id: "st-h3", title: "संधि, समास एवं कारक अभ्यास प्रश्न (Grammar Qs)", estimatedMinutes: 25, description: "पाठ्यपुस्तक के व्याकरण खंड के 15 अभ्यास प्रश्न हल करें।", completed: false, category: "Solving" as const, difficulty: "Medium" as const },
      { id: "st-h4", title: "शुद्धिकरण एवं अंतिम समीक्षा (Proofreading)", estimatedMinutes: 10, description: "मात्राओं की त्रुटियों और विराम चिह्नों की जांच करें।", completed: false, category: "Review" as const, difficulty: "Easy" as const },
    ],
  },
  {
    title: "Maths Calculus & Vectors 20-Problem Set",
    subject: "Mathematics",
    dueDate: "Tonight 9:00 PM",
    subtasks: [
      { id: "st-m1", title: "Review Integration & Substitution Rules", estimatedMinutes: 15, description: "Scan formula sheet for trigonometric and u-substitution rules.", completed: false, category: "Planning" as const, difficulty: "Easy" as const },
      { id: "st-m2", title: "Solve Problems 1 to 7 (Definite Integrals)", estimatedMinutes: 30, description: "Calculate definite integrals and check boundary conditions.", completed: false, category: "Solving" as const, difficulty: "Medium" as const },
      { id: "st-m3", title: "Solve Problems 8 to 14 (Integration by Parts)", estimatedMinutes: 35, description: "Apply LIATE rule systematically to algebraic and exponential parts.", completed: false, category: "Solving" as const, difficulty: "Challenging" as const },
      { id: "st-m4", title: "Solve Problems 15 to 20 (Vector Cross Products)", estimatedMinutes: 30, description: "Compute 3D determinant matrices and unit normal vectors.", completed: false, category: "Solving" as const, difficulty: "Medium" as const },
      { id: "st-m5", title: "Verify Solutions & Box Final Answers", estimatedMinutes: 15, description: "Check algebraic arithmetic and attach required units.", completed: false, category: "Review" as const, difficulty: "Easy" as const },
    ],
  },
  {
    title: "Physics Kinematics Lab Report & Error Analysis",
    subject: "Physics",
    dueDate: "Friday",
    subtasks: [
      { id: "st-p1", title: "Compile Experimental Velocity & Time Data", estimatedMinutes: 20, description: "Organize recorded sensor data into a structured Excel/table format.", completed: false, category: "Research" as const, difficulty: "Easy" as const },
      { id: "st-p2", title: "Calculate Mean, Standard Deviation & Uncertainty", estimatedMinutes: 25, description: "Compute absolute and percentage errors for acceleration g.", completed: false, category: "Solving" as const, difficulty: "Medium" as const },
      { id: "st-p3", title: "Plot Best-Fit Velocity-Time Line & Slope", estimatedMinutes: 20, description: "Find slope matching g = 9.8 m/s² and plot residual error bars.", completed: false, category: "Solving" as const, difficulty: "Medium" as const },
      { id: "st-p4", title: "Draft Scientific Discussion & Conclusion", estimatedMinutes: 30, description: "Explain air resistance discrepancies and systematic uncertainties.", completed: false, category: "Drafting" as const, difficulty: "Challenging" as const },
    ],
  },
];

interface HomeworkPlannerProps {
  onStartFocusOnTask?: (taskTitle: string, minutes: number) => void;
}

export const HomeworkPlanner: React.FC<HomeworkPlannerProps> = ({
  onStartFocusOnTask,
}) => {
  const [activePlan, setActivePlan] = useState<HomeworkAssignmentPlan | null>(() => {
    try {
      const stored = localStorage.getItem("knowdeep_homework_active_plan");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id !== "plan-default") return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("English");
  const [assignmentDueDate, setAssignmentDueDate] = useState("Tomorrow 5 PM");
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskMinutes, setNewSubtaskMinutes] = useState(25);

  // Sync to local storage
  useEffect(() => {
    try {
      if (activePlan) {
        localStorage.setItem("knowdeep_homework_active_plan", JSON.stringify(activePlan));
      } else {
        localStorage.removeItem("knowdeep_homework_active_plan");
      }
    } catch {
      // ignore
    }
  }, [activePlan]);

  const toggleSubtask = (id: string) => {
    if (!activePlan) return;
    setActivePlan((prev) => {
      if (!prev) return null;
      const updatedSubtasks = prev.subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      );
      return { ...prev, subtasks: updatedSubtasks };
    });
  };

  const deleteSubtask = (id: string) => {
    if (!activePlan) return;
    setActivePlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        subtasks: prev.subtasks.filter((st) => st.id !== id),
      };
    });
  };

  const addCustomSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !activePlan) return;

    const newSubtask: PlannerSubtask = {
      id: "st-" + Date.now(),
      title: newSubtaskTitle.trim(),
      estimatedMinutes: Number(newSubtaskMinutes) || 20,
      description: "Custom user-defined homework milestone.",
      completed: false,
      category: "Drafting",
      difficulty: "Medium",
    };

    setActivePlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        subtasks: [...prev.subtasks, newSubtask],
        totalEstimatedMinutes: prev.totalEstimatedMinutes + newSubtask.estimatedMinutes,
      };
    });

    setNewSubtaskTitle("");
  };

  // AI-Powered Breakdown Generation
  const handleAIBreakdown = async () => {
    if (!assignmentPrompt.trim()) return;
    setIsGeneratingBreakdown(true);

    try {
      const prompt = `You are an expert academic productivity coach.
Break down this large assignment into 4 to 6 sequential, highly actionable sub-tasks with estimated completion times (in minutes).

Assignment: ${assignmentPrompt}
Subject: ${assignmentSubject}
Due Date: ${assignmentDueDate}

Format strictly as a JSON array of objects:
[
  {
    "id": "st-1",
    "title": "Subtask title",
    "estimatedMinutes": 20,
    "description": "Clear instructions for this step",
    "completed": false,
    "category": "Planning" | "Research" | "Drafting" | "Solving" | "Review",
    "difficulty": "Easy" | "Medium" | "Challenging"
  }
]
Return ONLY the raw JSON array.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const rawText = data.content || "";

      let parsed: PlannerSubtask[] = [];
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }

      if (parsed.length > 0) {
        const totalMins = parsed.reduce((acc, st) => acc + (st.estimatedMinutes || 20), 0);
        setActivePlan({
          id: "plan-" + Date.now(),
          title: assignmentPrompt,
          subject: assignmentSubject,
          dueDate: assignmentDueDate,
          totalEstimatedMinutes: totalMins,
          subtasks: parsed,
        });
      }
    } catch {
      // Fallback: pick matching template or generate 4 smart default steps
      const fallbackSubtasks: PlannerSubtask[] = [
        { id: "st-1", title: "Analyze Rubric & Prepare Workspace", estimatedMinutes: 15, description: "Gather materials, textbook chapters, and outline constraints.", completed: false, category: "Planning", difficulty: "Easy" },
        { id: "st-2", title: "First Section & Core Problems", estimatedMinutes: 35, description: "Solve the primary section or draft main arguments.", completed: false, category: "Drafting", difficulty: "Medium" },
        { id: "st-3", title: "Complex Questions & Advanced Analysis", estimatedMinutes: 40, description: "Tackle harder questions and synthesize conclusions.", completed: false, category: "Solving", difficulty: "Challenging" },
        { id: "st-4", title: "Review, Polish & Final Verification", estimatedMinutes: 15, description: "Proofread spelling, arithmetic, and citations.", completed: false, category: "Review", difficulty: "Easy" },
      ];
      setActivePlan({
        id: "plan-" + Date.now(),
        title: assignmentPrompt,
        subject: assignmentSubject,
        dueDate: assignmentDueDate,
        totalEstimatedMinutes: 105,
        subtasks: fallbackSubtasks,
      });
    } finally {
      setIsGeneratingBreakdown(false);
      setAssignmentPrompt("");
    }
  };

  const handleApplyTemplate = (tmpl: (typeof TEMPLATE_ASSIGNMENTS)[0]) => {
    setActivePlan({
      id: "plan-" + Date.now(),
      title: tmpl.title,
      subject: tmpl.subject,
      dueDate: tmpl.dueDate,
      totalEstimatedMinutes: tmpl.subtasks.reduce((acc, st) => acc + st.estimatedMinutes, 0),
      subtasks: tmpl.subtasks,
    });
  };

  // Metrics (safe check for active plan)
  const totalSubtasks = activePlan ? activePlan.subtasks.length : 0;
  const completedSubtasks = activePlan ? activePlan.subtasks.filter((st) => st.completed).length : 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const remainingMinutes = activePlan
    ? activePlan.subtasks
        .filter((st) => !st.completed)
        .reduce((acc, st) => acc + st.estimatedMinutes, 0)
    : 0;

  return (
    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Intelligent Homework Assignment Planner</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                Smart Subtasks
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Breaks down large homework &amp; essays into bite-sized subtasks with estimated completion times
            </p>
          </div>
        </div>

        {/* Quick Assignment Templates */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">
            Templates:
          </span>
          {TEMPLATE_ASSIGNMENTS.map((tmpl) => (
            <button
              key={tmpl.title}
              onClick={() => handleApplyTemplate(tmpl)}
              className="px-2.5 py-1 text-[11px] rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white font-mono shrink-0 transition-colors"
            >
              {tmpl.subject}
            </button>
          ))}
        </div>
      </div>

      {/* AI Assignment Breaker Input Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Break Down Any Large Assignment with AI
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <Input
            value={assignmentPrompt}
            onChange={(e) => setAssignmentPrompt(e.target.value)}
            placeholder="e.g. Write a 1000-word history essay on the Mughal Empire or solve 30 physics kinematics problems..."
            className="sm:col-span-6 h-9 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />

          <select
            value={assignmentSubject}
            onChange={(e) => setAssignmentSubject(e.target.value)}
            className="sm:col-span-3 h-9 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white px-2.5"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science / Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="History">History &amp; Social Studies</option>
            <option value="Computer Science">Computer Science</option>
          </select>

          <Button
            onClick={handleAIBreakdown}
            disabled={isGeneratingBreakdown || !assignmentPrompt.trim()}
            className="sm:col-span-3 h-9 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGeneratingBreakdown ? "Decomposing..." : "Auto-Breakdown"}
          </Button>
        </div>
      </div>

      {/* Active Assignment Overview or Clean Empty State */}
      {activePlan ? (
        <>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase">
                    {activePlan.subject}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> Due: {activePlan.dueDate}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white mt-1">
                  {activePlan.title}
                </h4>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block">Estimated Time:</span>
                  <span className="text-sm font-mono font-bold text-indigo-300">
                    {remainingMinutes}m left / {activePlan.totalEstimatedMinutes}m total
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActivePlan(null)}
                  className="h-8 text-xs text-slate-500 hover:text-rose-400 rounded-xl"
                  title="Clear Active Plan"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </Button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  {completedSubtasks} of {totalSubtasks} Subtasks Completed
                </span>
                <span className="font-bold text-indigo-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subtasks Interactive Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Sequential Subtasks Roadmap:
            </span>

            <div className="space-y-2">
              {activePlan.subtasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/60 opacity-60 line-through"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Checkbox & Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(task.id)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-700 bg-slate-900 hover:border-slate-500"
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          Step {idx + 1}.
                        </span>
                        <span className={`text-xs sm:text-sm font-bold text-white ${task.completed ? "line-through text-slate-500" : ""}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                          {task.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Time estimate & Start Pomodoro */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.estimatedMinutes}m
                    </span>

                    {onStartFocusOnTask && !task.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartFocusOnTask(task.title, task.estimatedMinutes)}
                        className="h-8 text-xs rounded-xl gap-1 border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                        title="Launch Pomodoro Focus Timer for this task"
                      >
                        <Play className="w-3 h-3 fill-rose-300" /> Focus Now
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteSubtask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Subtask Inline Form */}
          <form onSubmit={addCustomSubtask} className="flex gap-2 pt-2 border-t border-slate-800">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add custom milestone or study task..."
              className="h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 flex-1"
            />
            <div className="flex items-center gap-1 bg-slate-950 px-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
              <span>Est:</span>
              <Input
                type="number"
                value={newSubtaskMinutes}
                onChange={(e) => setNewSubtaskMinutes(Number(e.target.value))}
                className="w-12 h-7 text-xs bg-slate-900 border-0 p-0 text-center text-white"
              />
              <span>m</span>
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 rounded-xl text-xs gap-1 bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </form>
        </>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-3">
          <ListTodo className="w-10 h-10 text-indigo-400/50 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No Active Assignment Plan</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter your assignment prompt above and tap <strong>Auto-Breakdown</strong> to automatically decompose it into step-by-step milestones with estimated completion times. You can also pick an optional template above.
          </p>
        </div>
      )}
    </div>
  );
};
