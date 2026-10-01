import React from "react";
import { cn } from "@/lib/utils";

export function SkeletonBox({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-muted/60 dark:bg-muted/40 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton Loader for Dashboard.tsx overview & telemetry
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in-50 duration-300">
      {/* Top Welcome Banner Skeleton */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBox className="h-7 w-48 rounded-xl" />
            <SkeletonBox className="h-4 w-72 rounded-lg" />
          </div>
          <SkeletonBox className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-10 w-10 rounded-2xl" />
              <SkeletonBox className="h-4 w-12 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <SkeletonBox className="h-7 w-20 rounded-xl" />
              <SkeletonBox className="h-3.5 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Subscription & Usage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quota Progress */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-5 w-40 rounded-xl" />
            <SkeletonBox className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonBox className="h-4 w-full rounded-full" />
          <div className="flex justify-between pt-2">
            <SkeletonBox className="h-3.5 w-24 rounded-lg" />
            <SkeletonBox className="h-3.5 w-32 rounded-lg" />
          </div>
        </div>

        {/* Plan Details */}
        <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
          <SkeletonBox className="h-5 w-28 rounded-xl" />
          <SkeletonBox className="h-10 w-full rounded-2xl" />
          <SkeletonBox className="h-9 w-full rounded-xl" />
        </div>
      </div>

      {/* Activity Timeline / Weekly Chart Skeleton */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-36 rounded-xl" />
          <SkeletonBox className="h-4 w-24 rounded-lg" />
        </div>
        {/* Chart Bars */}
        <div className="h-44 flex items-end justify-between gap-3 pt-4">
          {[45, 80, 60, 95, 30, 75, 50].map((heightPct, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <SkeletonBox
                className="w-full rounded-xl"
                style={{ height: `${heightPct}%` }}
              />
              <SkeletonBox className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for NewsFeed.tsx
 */
export function NewsFeedSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Image Skeleton with Badges */}
              <div className="w-full h-44 rounded-2xl relative overflow-hidden">
                <SkeletonBox className="w-full h-full" />
                <div className="absolute top-2.5 left-2.5">
                  <SkeletonBox className="h-5 w-16 rounded-full bg-background/80" />
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <SkeletonBox className="h-5 w-14 rounded-full bg-background/80" />
                </div>
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-2 mt-3 mb-2">
                <SkeletonBox className="h-3.5 w-20 rounded" />
                <SkeletonBox className="h-3 w-3 rounded-full" />
                <SkeletonBox className="h-3.5 w-16 rounded" />
              </div>

              {/* Headline Title */}
              <div className="space-y-1.5 mb-3">
                <SkeletonBox className="h-4.5 w-full rounded-lg" />
                <SkeletonBox className="h-4.5 w-4/5 rounded-lg" />
              </div>

              {/* Summary Snippet */}
              <div className="space-y-1">
                <SkeletonBox className="h-3 w-full rounded" />
                <SkeletonBox className="h-3 w-3/4 rounded" />
              </div>

              {/* TL;DR Bullet Box */}
              <div className="mt-3 p-2.5 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex items-center gap-1.5">
                  <SkeletonBox className="h-3 w-3 rounded-full" />
                  <SkeletonBox className="h-3 w-20 rounded" />
                </div>
                <SkeletonBox className="h-2.5 w-full rounded" />
                <SkeletonBox className="h-2.5 w-5/6 rounded" />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <SkeletonBox className="h-4 w-20 rounded" />
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-8 w-20 rounded-xl" />
                <SkeletonBox className="h-8 w-8 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for WeatherStation.tsx
 */
export function WeatherStationSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* Hero Weather Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-4 rounded-full" />
              <SkeletonBox className="h-6 w-36 rounded-xl" />
            </div>
            <div className="flex items-baseline gap-4">
              <SkeletonBox className="h-16 w-36 rounded-2xl" />
              <SkeletonBox className="h-6 w-24 rounded-full" />
            </div>
            <SkeletonBox className="h-4 w-52 rounded-lg" />
          </div>

          {/* Condition Icon & High/Low */}
          <div className="flex items-center gap-4 sm:gap-6">
            <SkeletonBox className="w-24 h-24 rounded-3xl" />
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-24 rounded-lg" />
              <SkeletonBox className="h-4 w-20 rounded-lg" />
              <SkeletonBox className="h-4 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* 24-Hour Forecast Horizontal Strip */}
        <div className="mt-8 pt-6 border-t border-border/40">
          <SkeletonBox className="h-4 w-32 rounded-lg mb-4" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((hr) => (
              <div
                key={hr}
                className="p-3 rounded-2xl bg-muted/20 border border-border/30 flex flex-col items-center gap-2"
              >
                <SkeletonBox className="h-3 w-10 rounded" />
                <SkeletonBox className="w-7 h-7 rounded-full" />
                <SkeletonBox className="h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Environmental Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          "Air Quality",
          "UV Radiation",
          "Wind Dynamics",
          "Atmospheric Humidity",
        ].map((title, i) => (
          <div
            key={i}
            className="p-4 rounded-3xl bg-card border border-border/60 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-3.5 w-24 rounded" />
              <SkeletonBox className="h-6 w-6 rounded-xl" />
            </div>
            <SkeletonBox className="h-7 w-20 rounded-xl" />
            <SkeletonBox className="h-3 w-full rounded" />
          </div>
        ))}
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <SkeletonBox className="h-5 w-40 rounded-xl" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((day) => (
            <div
              key={day}
              className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/30"
            >
              <SkeletonBox className="h-4 w-20 rounded-lg" />
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-6 h-6 rounded-full" />
                <SkeletonBox className="h-3.5 w-24 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-4 w-10 rounded" />
                <SkeletonBox className="h-2 w-24 rounded-full" />
                <SkeletonBox className="h-4 w-10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for SportsHub.tsx
 */
export function SportsHubSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* Live Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col justify-between space-y-4"
          >
            {/* Header / Status */}
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-3.5 w-24 rounded" />
              <SkeletonBox className="h-5 w-16 rounded-full" />
            </div>

            {/* Teams & Scores */}
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-8 h-8 rounded-full" />
                  <SkeletonBox className="h-4 w-28 rounded-lg" />
                </div>
                <SkeletonBox className="h-6 w-8 rounded-lg" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="w-8 h-8 rounded-full" />
                  <SkeletonBox className="h-4 w-24 rounded-lg" />
                </div>
                <SkeletonBox className="h-6 w-8 rounded-lg" />
              </div>
            </div>

            {/* Win Probability Bar */}
            <div className="space-y-1.5 pt-2 border-t border-border/40">
              <div className="flex justify-between">
                <SkeletonBox className="h-3 w-16 rounded" />
                <SkeletonBox className="h-3 w-16 rounded" />
              </div>
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>

            {/* Footer details */}
            <div className="flex items-center justify-between pt-1">
              <SkeletonBox className="h-3 w-28 rounded" />
              <SkeletonBox className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for WebSearch.tsx (AI search results)
 */
export function WebSearchSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* Featured Quick Snippet Card */}
      <div className="p-6 rounded-3xl bg-card border border-cyan-500/30 shadow-md relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-5 h-5 rounded-full" />
          <SkeletonBox className="h-4 w-32 rounded-lg" />
          <SkeletonBox className="h-4 w-16 rounded-full ml-auto" />
        </div>
        <SkeletonBox className="h-6 w-3/4 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBox className="h-3.5 w-full rounded" />
          <SkeletonBox className="h-3.5 w-11/12 rounded" />
          <SkeletonBox className="h-3.5 w-4/5 rounded" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <SkeletonBox className="h-3 w-40 rounded" />
        </div>
      </div>

      {/* Sources & Website Links Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-4 w-4 rounded-full" />
            <SkeletonBox className="h-4 w-36 rounded-lg" />
          </div>
          <SkeletonBox className="h-3 w-16 rounded" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <SkeletonBox className="w-5 h-5 rounded-md" />
                <SkeletonBox className="h-3 w-20 rounded" />
              </div>
              <SkeletonBox className="h-3.5 w-full rounded" />
              <SkeletonBox className="h-2.5 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Deep Synthesized Overview */}
      <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <SkeletonBox className="w-6 h-6 rounded-xl" />
            <SkeletonBox className="h-5 w-48 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-7 w-20 rounded-lg" />
            <SkeletonBox className="h-7 w-20 rounded-lg" />
          </div>
        </div>

        {/* Paragraphs with citations */}
        <div className="space-y-3 pt-2">
          <SkeletonBox className="h-4 w-full rounded" />
          <SkeletonBox className="h-4 w-11/12 rounded" />
          <SkeletonBox className="h-4 w-full rounded" />
          <SkeletonBox className="h-4 w-4/5 rounded" />
        </div>

        <div className="space-y-2 pt-2">
          <SkeletonBox className="h-4.5 w-44 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {[1, 2, 3, 4].map((pt) => (
              <div
                key={pt}
                className="p-3 rounded-xl bg-muted/20 border border-border/30 flex items-start gap-2"
              >
                <SkeletonBox className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonBox className="h-3 w-full rounded" />
                  <SkeletonBox className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Searches Pills */}
      <div className="space-y-2.5">
        <SkeletonBox className="h-4 w-32 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((q) => (
            <SkeletonBox key={q} className="h-8 w-36 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for MyGeneratedApps.tsx
 */
export function MyGeneratedAppsSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-12 h-12 rounded-2xl" />
                <div className="space-y-1.5">
                  <SkeletonBox className="h-4 w-28 rounded-lg" />
                  <SkeletonBox className="h-3 w-16 rounded" />
                </div>
              </div>
              <SkeletonBox className="h-6 w-14 rounded-full" />
            </div>

            <div className="space-y-1.5">
              <SkeletonBox className="h-3 w-full rounded" />
              <SkeletonBox className="h-3 w-4/5 rounded" />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <SkeletonBox className="h-5 w-14 rounded-md" />
              <SkeletonBox className="h-5 w-14 rounded-md" />
              <SkeletonBox className="h-5 w-14 rounded-md" />
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <SkeletonBox className="h-8 w-24 rounded-xl" />
              <SkeletonBox className="h-8 w-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for Gallery.tsx
 */
export function GallerySkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl overflow-hidden bg-card border border-border/60 shadow-sm space-y-3 p-3"
          >
            <SkeletonBox className="w-full h-48 rounded-2xl" />
            <div className="space-y-1.5">
              <SkeletonBox className="h-3.5 w-3/4 rounded" />
              <SkeletonBox className="h-2.5 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
