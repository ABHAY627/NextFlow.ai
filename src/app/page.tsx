"use client";

// import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Workflow,
  Zap,
  Brain,
  Image,
  Video,
  Crop,
  Film,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  // const { isSignedIn, isLoaded } = useAuth();
  const isLoaded = true;
  const isSignedIn = false;
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/workflow");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.08)_0%,_transparent_65%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #333 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
            <Workflow className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            NextFlow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/sign-in")}
            className="px-4 py-2 text-sm text-[#a1a1aa] hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/sign-up")}
            className="px-4 py-2 text-sm bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-32">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#262626] bg-[#0a0a0a] text-xs text-[#a1a1aa] mb-8">
            <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
            Powered by Google Gemini AI
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white text-center max-w-4xl leading-tight tracking-tight animate-fade-in">
          Build AI Workflows{" "}
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
            Visually
          </span>
        </h1>

        <p className="mt-6 text-lg text-[#a1a1aa] text-center max-w-2xl animate-fade-in">
          Connect LLM models, process images and videos, and chain operations
          with a powerful node-based workflow editor. No code required.
        </p>

        <div className="mt-10 flex items-center gap-4 animate-fade-in">
          <button
            onClick={() => router.push("/sign-up")}
            className="group px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-medium transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] flex items-center gap-2"
          >
            Start Building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-3 border border-[#262626] hover:border-[#3a3a3a] text-white rounded-full font-medium transition-all hover:bg-[#0a0a0a]"
          >
            Sign In
          </button>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          {[
            {
              icon: Brain,
              title: "LLM Integration",
              desc: "Run Gemini models with system prompts, user messages, and image inputs",
              color: "#8B5CF6",
            },
            {
              icon: Zap,
              title: "Parallel Execution",
              desc: "Independent branches execute concurrently for maximum speed",
              color: "#3B82F6",
            },
            {
              icon: Workflow,
              title: "Visual Builder",
              desc: "Drag-and-drop nodes, connect handles, build complex DAG workflows",
              color: "#22C55E",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-5 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/50 backdrop-blur-sm hover:border-[#262626] transition-all hover:-translate-y-0.5 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon
                  className="w-5 h-5"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-[#71717a] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Node type pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Workflow, label: "Text", color: "#3B82F6" },
            { icon: Image, label: "Image Upload", color: "#22C55E" },
            { icon: Video, label: "Video Upload", color: "#F97316" },
            { icon: Brain, label: "Run LLM", color: "#8B5CF6" },
            { icon: Crop, label: "Crop Image", color: "#EC4899" },
            { icon: Film, label: "Extract Frame", color: "#06B6D4" },
          ].map((node, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-xs text-[#a1a1aa] hover:border-[#3a3a3a] transition-colors"
            >
              <node.icon className="w-3 h-3" style={{ color: node.color }} />
              {node.label}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1a1a1a] px-6 py-4">
        <p className="text-center text-xs text-[#71717a]">
          NextFlow — AI Workflow Builder
        </p>
      </footer>
    </div>
  );
}
