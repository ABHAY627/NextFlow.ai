"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflowStore";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import { UserButton } from "@clerk/nextjs";
import {
  Save,
  Download,
  Upload,
  Play,
  Undo2,
  Redo2,
} from "lucide-react";

export default function WorkflowPage() {
  const { leftSidebarOpen, rightSidebarOpen, undo, redo, undoStack, redoStack, workflowName } =
    useWorkflowStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between px-4 shrink-0 z-50">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <div
            className="text-sm font-medium text-white truncate max-w-[200px]"
            title={workflowName}
          >
            {workflowName}
          </div>
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-1">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-[#262626] mx-1" />

          {/* Save */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] transition-all"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Export */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] transition-all"
            title="Export as JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] transition-all"
            title="Import from JSON"
          >
            <Upload className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-[#262626] mx-1" />

          {/* Run */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium rounded-lg transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Play className="w-3 h-3" />
            Run
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7",
              },
            }}
          /> */}
          <div className="w-7 h-7 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-full shadow-lg" title="Placeholder Avatar"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        <ReactFlowProvider>
          {/* Left sidebar */}
          <LeftSidebar />

          {/* Canvas area */}
          <div
            className="flex-1 transition-all duration-300"
            style={{
              marginLeft: leftSidebarOpen ? "260px" : "0px",
              marginRight: rightSidebarOpen ? "300px" : "0px",
            }}
          >
            <WorkflowCanvas />
          </div>

          {/* Right sidebar */}
          <RightSidebar />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
