import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Shuffle,
  BarChart3,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AlgoType = "bubble" | "quicksort" | "mergesort" | "binarysearch";

interface StepFrame {
  array: number[];
  comparing: number[];
  swapped: number[];
  sorted: number[];
  pivot?: number;
  description: string;
}

export const CodeStudioAlgoVisualizer: React.FC = () => {
  const [algo, setAlgo] = useState<AlgoType>("bubble");
  const [arraySize, setArraySize] = useState<number>(14);
  const [array, setArray] = useState<number[]>([]);
  const [speedMs, setSpeedMs] = useState<number>(200);
  const [steps, setSteps] = useState<StepFrame[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate new random array
  const generateRandomArray = (size = arraySize) => {
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
    setArray(newArr);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    calculateSteps(algo, newArr);
  };

  useEffect(() => {
    generateRandomArray(arraySize);
  }, [arraySize, algo]);

  // Precompute animation steps based on algorithm
  const calculateSteps = (selectedAlgo: AlgoType, initialArr: number[]) => {
    const recordedSteps: StepFrame[] = [];
    const arr = [...initialArr];

    if (selectedAlgo === "bubble") {
      const n = arr.length;
      recordedSteps.push({
        array: [...arr],
        comparing: [],
        swapped: [],
        sorted: [],
        description: "Initial array state for Bubble Sort.",
      });

      const sortedIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          recordedSteps.push({
            array: [...arr],
            comparing: [j, j + 1],
            swapped: [],
            sorted: [...sortedIndices],
            description: `Comparing elements arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
          });

          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            recordedSteps.push({
              array: [...arr],
              comparing: [j, j + 1],
              swapped: [j, j + 1],
              sorted: [...sortedIndices],
              description: `Swapped: ${arr[j + 1]} > ${arr[j]}, shifting larger value to right.`,
            });
          }
        }
        sortedIndices.push(n - i - 1);
        recordedSteps.push({
          array: [...arr],
          comparing: [],
          swapped: [],
          sorted: [...sortedIndices],
          description: `Element at index ${n - i - 1} (${arr[n - i - 1]}) is now placed in its sorted position.`,
        });
      }
    } else if (selectedAlgo === "quicksort") {
      const sortedIndices: number[] = [];
      recordedSteps.push({
        array: [...arr],
        comparing: [],
        swapped: [],
        sorted: [],
        description: "Initial array state for QuickSort.",
      });

      const qs = (low: number, high: number) => {
        if (low < high) {
          const pivotVal = arr[high];
          let i = low - 1;

          recordedSteps.push({
            array: [...arr],
            comparing: [],
            swapped: [],
            sorted: [...sortedIndices],
            pivot: high,
            description: `Partitioning subarray [${low}..${high}] with Pivot=${pivotVal} (index ${high}).`,
          });

          for (let j = low; j < high; j++) {
            recordedSteps.push({
              array: [...arr],
              comparing: [j, high],
              swapped: [],
              sorted: [...sortedIndices],
              pivot: high,
              description: `Comparing arr[${j}]=${arr[j]} with pivot ${pivotVal}.`,
            });

            if (arr[j] < pivotVal) {
              i++;
              [arr[i], arr[j]] = [arr[j], arr[i]];
              recordedSteps.push({
                array: [...arr],
                comparing: [i, j],
                swapped: [i, j],
                sorted: [...sortedIndices],
                pivot: high,
                description: `Swapped arr[${i}] and arr[${j}] to place smaller element on left side of partition.`,
              });
            }
          }

          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          const pi = i + 1;
          sortedIndices.push(pi);
          recordedSteps.push({
            array: [...arr],
            comparing: [],
            swapped: [pi, high],
            sorted: [...sortedIndices],
            description: `Pivot ${arr[pi]} locked in final sorted position (index ${pi}).`,
          });

          qs(low, pi - 1);
          qs(pi + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
        }
      };

      qs(0, arr.length - 1);
      recordedSteps.push({
        array: [...arr],
        comparing: [],
        swapped: [],
        sorted: Array.from({ length: arr.length }, (_, k) => k),
        description: "QuickSort Complete! Entire array is sorted in O(n log n) average time.",
      });
    } else if (selectedAlgo === "binarysearch") {
      const sortedArr = [...arr].sort((a, b) => a - b);
      const target = sortedArr[Math.floor(sortedArr.length / 2)];
      let left = 0;
      let right = sortedArr.length - 1;

      recordedSteps.push({
        array: [...sortedArr],
        comparing: [],
        swapped: [],
        sorted: [],
        description: `Binary Search for target key=${target} in pre-sorted array.`,
      });

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        recordedSteps.push({
          array: [...sortedArr],
          comparing: [mid],
          swapped: [],
          sorted: [],
          pivot: mid,
          description: `Search window: [${left}..${right}], testing mid index ${mid} (value ${sortedArr[mid]}). Target=${target}`,
        });

        if (sortedArr[mid] === target) {
          recordedSteps.push({
            array: [...sortedArr],
            comparing: [],
            swapped: [],
            sorted: [mid],
            description: `Target element ${target} found at index ${mid} in O(log n) time!`,
          });
          break;
        } else if (sortedArr[mid] < target) {
          left = mid + 1;
          recordedSteps.push({
            array: [...sortedArr],
            comparing: [],
            swapped: [],
            sorted: [],
            description: `${sortedArr[mid]} < ${target}. Discarding left half; updating search window to [${left}..${right}].`,
          });
        } else {
          right = mid - 1;
          recordedSteps.push({
            array: [...sortedArr],
            comparing: [],
            swapped: [],
            sorted: [],
            description: `${sortedArr[mid]} > ${target}. Discarding right half; updating search window to [${left}..${right}].`,
          });
        }
      }
    } else {
      // Default fallback
      recordedSteps.push({
        array: [...arr],
        comparing: [],
        swapped: [],
        sorted: [],
        description: "Algorithm visualization ready.",
      });
    }

    setSteps(recordedSteps);
  };

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs, steps.length]);

  const currentFrame = steps[currentStepIndex] || {
    array,
    comparing: [],
    swapped: [],
    sorted: [],
    description: "Ready",
  };

  const getBarColor = (index: number) => {
    if (currentFrame.sorted.includes(index)) {
      return "bg-emerald-500 text-emerald-950";
    }
    if (currentFrame.swapped.includes(index)) {
      return "bg-rose-500 text-rose-950 animate-bounce";
    }
    if (currentFrame.pivot === index) {
      return "bg-amber-500 text-amber-950";
    }
    if (currentFrame.comparing.includes(index)) {
      return "bg-cyan-500 text-cyan-950";
    }
    return "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200";
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden text-card-foreground">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
            <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Algorithm &amp; Data Structure Visualizer
          </span>
        </div>

        {/* Algorithm Select */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as AlgoType)}
            className="h-8 text-xs rounded-xl bg-background border border-border px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="bubble">Bubble Sort (O(n²))</option>
            <option value="quicksort">QuickSort (O(n log n))</option>
            <option value="binarysearch">Binary Search (O(log n))</option>
          </select>

          {/* Shuffle Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateRandomArray()}
            className="h-8 text-xs rounded-xl gap-1"
            title="Generate Random Array"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle
          </Button>

          {/* Play/Pause Button */}
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 text-xs rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? "Pause" : "Play Animation"}
          </Button>

          {/* Step Forward */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            disabled={currentStepIndex >= steps.length - 1}
            className="h-8 w-8 rounded-xl"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>

          {/* Reset */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="h-8 w-8 rounded-xl"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Speed & Array Slider Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-muted/20 border-b border-border/60 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-2">
            <span>Speed:</span>
            <input
              type="range"
              min={30}
              max={600}
              step={20}
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="w-24 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="font-mono">{speedMs}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Comparing
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ml-2" /> Swapped
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-2" /> Pivot
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ml-2" /> Sorted
          </div>
        </div>
      </div>

      {/* Visualizer Canvas Bars */}
      <div className="flex-1 p-6 flex items-end justify-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-950/60 min-h-[260px] overflow-x-auto">
        {currentFrame.array.map((val, idx) => {
          const barHeight = Math.max(15, (val / 100) * 220);
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold text-muted-foreground">{val}</span>
              <div
                style={{ height: `${barHeight}px`, width: "26px" }}
                className={`rounded-t-lg transition-all duration-150 flex items-end justify-center pb-1 font-mono text-[10px] font-bold shadow-xs ${getBarColor(
                  idx
                )}`}
              />
              <span className="text-[9px] font-mono text-muted-foreground">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Step Explanation Callout */}
      <div className="p-3.5 bg-muted/60 border-t border-border flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-foreground">Step Telemetry:</p>
          <p className="text-muted-foreground mt-0.5 font-mono">{currentFrame.description}</p>
        </div>
      </div>
    </div>
  );
};
