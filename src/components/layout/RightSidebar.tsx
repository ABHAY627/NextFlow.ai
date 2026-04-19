"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import {
  History,
  PanelRightClose,
  PanelRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";

import { type RunStatus, type RunScope } from "@/lib/types";

// Placeholder data for the history panel UI
const PLACEHOLDER_RUNS: Array<{
  id: string;
  status: RunStatus;
  scope: RunScope;
  nodeCount: number;
  duration: number;
  startedAt: string;
}> = [
  {
    id: "run-1",
    status: "success",
    scope: "full",
    nodeCount: 6,
    duration: 12400,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "run-2",
    status: "failed",
    scope: "single",
    nodeCount: 1,
    duration: 2800,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "run-3",
    status: "partial",
    scope: "partial",
    nodeCount: 3,
    duration: 8200,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "#22C55E",
    bg: "rgba(34, 197, 94, 0.1)",
    label: "Success",
  },
  failed: {
    icon: XCircle,
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    label: "Failed",
  },
  running: {
    icon: Loader2,
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.1)",
    label: "Running",
  },
  partial: {
    icon: CheckCircle2,
    color: "#EAB308",
    bg: "rgba(234, 179, 8, 0.1)",
    label: "Partial",
  },
};

const scopeLabels = {
  full: "Full Workflow",
  partial: "Selected Nodes",
  single: "Single Node",
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function RightSidebar() {
  const { rightSidebarOpen, toggleRightSidebar } = useWorkflowStore();

  return (
    <>
      {/* Collapsed toggle button */}
      {!rightSidebarOpen && (
        <button
          onClick={toggleRightSidebar}
          className="fixed top-3 right-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262626] text-[#a1a1aa] hover:text-white hover:border-[#3a3a3a] transition-all hover:bg-[#1a1a1a]"
          title="Open history panel"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full z-40 flex flex-col
          bg-[#0a0a0a] border-l border-[#1a1a1a]
          transition-all duration-300 ease-in-out
          ${rightSidebarOpen ? "w-[300px] translate-x-0" : "w-[300px] translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-sm font-semibold text-white">
              Workflow History
            </span>
          </div>
          <button
            onClick={toggleRightSidebar}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title="Close history panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {PLACEHOLDER_RUNS.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-[#52525b]" />
              </div>
              <p className="text-sm text-[#71717a] text-center">
                No workflow runs yet
              </p>
              <p className="text-xs text-[#52525b] text-center mt-1">
                Run a workflow to see its history here
              </p>
            </div>
          ) : (
            <div className="py-2">
              {PLACEHOLDER_RUNS.map((run, index) => {
                const config = statusConfig[run.status];
                const StatusIcon = config.icon;

                return (
                  <button
                    key={run.id}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#141414] transition-colors text-left group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Status icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: config.bg }}
                    >
                      <StatusIcon
                        className={`w-4 h-4 ${
                          run.status === "running" ? "animate-spin" : ""
                        }`}
                        style={{ color: config.color }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#e4e4e7]">
                          {scopeLabels[run.scope]}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            color: config.color,
                            backgroundColor: config.bg,
                          }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#71717a]">
                          {formatTimeAgo(run.startedAt)}
                        </span>
                        <span className="text-[10px] text-[#52525b]">·</span>
                        <span className="text-[10px] text-[#71717a]">
                          {run.duration ? formatDuration(run.duration) : "--"}
                        </span>
                        <span className="text-[10px] text-[#52525b]">·</span>
                        <span className="text-[10px] text-[#71717a]">
                          {run.nodeCount} node{run.nodeCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#71717a] transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1a1a1a]">
          <p className="text-[10px] text-[#52525b] text-center">
            Click a run to view node-level details
          </p>
        </div>
      </div>
    </>
  );
}
