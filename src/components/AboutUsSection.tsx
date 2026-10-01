import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Users,
  ShieldCheck,
  Globe,
  Code2,
  Rocket,
  Zap,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PolicyLinks } from "@/components/PolicyLinks";

export const AboutUsSection: React.FC<{ isModal?: boolean }> = ({ isModal = false }) => {
  return (
    <div className="space-y-8 text-foreground">
      {/* Hero / Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/15 via-purple-500/10 to-cyan-500/15 border border-primary/20 p-6 sm:p-8">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 rounded-full px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Know Deep AI Platform
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
              v2.5.0
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
            Empowering Human Curiosity Through Intelligent AI
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Know Deep is a next-generation AI platform designed to harmonize model intelligence, interactive workspaces, real-time web search, and specialized learning tutors into a unified, privacy-first ecosystem.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-3 border border-border/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-primary">15+</span>
              <span className="text-xs text-muted-foreground block mt-0.5">Flagship AI Tools</span>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-3 border border-border/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-cyan-500">100%</span>
              <span className="text-xs text-muted-foreground block mt-0.5">Privacy First</span>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-3 border border-border/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-500">24/7</span>
              <span className="text-xs text-muted-foreground block mt-0.5">Live Intelligence</span>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-3 border border-border/40 text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-500">Fast</span>
              <span className="text-xs text-muted-foreground block mt-0.5">Low Latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card rounded-2xl border border-border/60 shadow-sm hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center justify-center mb-2">
              <Target className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Our Mission</CardTitle>
            <CardDescription>
              To make frontier artificial intelligence intuitive, accessible, and practical for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            We believe that cutting-edge AI should not be locked behind complex prompts or scattered across dozens of disconnected apps. Know Deep brings voice assistants, document analysis, code interpreters, academic tutors, and web search into a single, cohesive interface that adapts to your workflow.
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border border-border/60 shadow-sm hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 flex items-center justify-center mb-2">
              <Rocket className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Our Vision</CardTitle>
            <CardDescription>
              Building the future of personal & educational KnowDeep AI autonomous companions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Our goal is to build a platform that learns with you—helping students master complex NCERT concepts, enabling developers to prototype code seamlessly, and empowering creators to summarize documents and produce rich media effortlessly.
          </CardContent>
        </Card>
      </div>

      {/* Meet the Creator / Team Section */}
      <Card className="glass-card rounded-2xl border border-border/60 overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Meet the Creator</CardTitle>
              <CardDescription>The mind behind the Know Deep AI Ecosystem</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-muted/30 border border-border/40">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-cyan-400 p-0.5 shadow-md">
                <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center font-black text-2xl text-primary">
                  AY
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">Ayush Yadav</h3>
                  <p className="text-xs text-primary font-medium">Founder, Lead Architect & Developer</p>
                </div>
                <Badge variant="outline" className="rounded-full text-[11px] border-primary/30 text-primary">
                  AI & Full-Stack Engineer
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ayush created Know Deep with a passion for designing high-performance, user-centric web applications and multi-modal AI systems. Driven by a vision to simplify complex technological tools, Ayush engineered Know Deep from the ground up to combine deep learning reasoning, lightning-fast interfaces, and local-first data resilience.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-cyan-500" /> Full-Stack & AI
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" /> Global Platform
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Built for Learners & Creators
                </span>
              </div>
            </div>
          </div>

          {/* Core Principles Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Core Principles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Privacy First</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your conversations and uploaded content remain strictly confidential with secure local encryption.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Speed & Latency</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimized for low-latency responses, streaming execution, and seamless offline data synchronization.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-background/80 border border-border/50 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  <span>Continuous Innovation</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Regularly updated with new multi-modal AI models, interactive workspaces, and user suggestions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Footer */}
      {!isModal && (
        <div className="pt-2 border-t border-border/40 text-center space-y-3">
          <PolicyLinks className="text-xs text-muted-foreground justify-center" />
          <p className="text-[11px] text-muted-foreground/70">
            © {new Date().getFullYear()} Know Deep AI Studio. All rights reserved. Built by Ayush Yadav.
          </p>
        </div>
      )}
    </div>
  );
};
