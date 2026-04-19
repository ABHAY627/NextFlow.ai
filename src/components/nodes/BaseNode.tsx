import { type ReactNode, memo } from "react";
import { type ExecutionStatus, type NodeType } from "@/lib/types";
import { Copy, Trash2, MoreHorizontal, CheckCircle2, XCircle, Play } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

interface BaseNodeProps {
  id: string;
  type: NodeType;
  label: string;
  icon: ReactNode;
  status?: ExecutionStatus;
  selected?: boolean;
  onRun?: () => void;
  children: ReactNode;
  minWidth?: number;
}

export const BaseNode = memo(function BaseNode({
  id,
  type,
  label,
  icon,
  status = "idle",
  selected = false,
  onRun,
  children,
  minWidth = 280,
}: BaseNodeProps) {
  const { deleteNode } = useWorkflowStore();

  const isRunning = status === "running";
  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <div
      style={{ minWidth }}
      className={`
        relative rounded-xl border bg-node-bg shadow-xl transition-all
        ${selected ? "border-accent-purple shadow-[0_0_0_2px_rgba(139,92,246,0.3)]" : "border-node-border hover:border-node-border-hover"}
        ${isRunning ? "node-running" : ""}
        ${isSuccess ? "node-success" : ""}
        ${isFailed ? "node-error" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-node-border bg-node-header-bg rounded-t-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#1a1a1a] border border-[#262626]">
            {icon}
          </div>
          <span className="text-xs font-semibold text-text-primary">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Status Badge */}
          {isRunning && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium mr-1 animate-pulse">
              Running<span className="w-1 h-1 rounded-full bg-warning animate-bounce" />
            </span>
          )}
          {isSuccess && (
            <CheckCircle2 className="w-4 h-4 text-success mr-1 bg-success/10 rounded-full" />
          )}
          {isFailed && (
            <XCircle className="w-4 h-4 text-error mr-1 bg-error/10 rounded-full" />
          )}

          {/* Node Actions */}
          {onRun && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRun();
              }}
              className="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-white hover:bg-accent-purple/20 transition-colors"
              title="Run this node"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative group/menu">
            <button className="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-white hover:bg-[#262626] transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block w-32 bg-[#0a0a0a] border border-[#262626] rounded-lg shadow-2xl overflow-hidden z-50">
              <button
                onClick={() => {}}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors border-t border-[#1a1a1a]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3">
        {children}
      </div>
    </div>
  );
});
