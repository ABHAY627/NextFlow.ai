"use client";

import { useState, type DragEvent } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import { SIDEBAR_NODES, type NodeType } from "@/lib/types";
import {
  Type,
  Image,
  Video,
  Brain,
  Crop,
  Film,
  Search,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Type,
  Image,
  Video,
  Brain,
  Crop,
  Film,
};

const handleColorMap: Record<string, string> = {
  textNode: "#3B82F6",
  uploadImageNode: "#22C55E",
  uploadVideoNode: "#F97316",
  llmNode: "#8B5CF6",
  cropImageNode: "#EC4899",
  extractFrameNode: "#06B6D4",
};

export default function LeftSidebar() {
  const { leftSidebarOpen, toggleLeftSidebar } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAccessOpen, setQuickAccessOpen] = useState(true);

  const filteredNodes = SIDEBAR_NODES.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDragStart = (event: DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      {/* Collapsed toggle button */}
      {!leftSidebarOpen && (
        <button
          onClick={toggleLeftSidebar}
          className="fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-[#141414] border border-[#262626] text-[#a1a1aa] hover:text-white hover:border-[#3a3a3a] transition-all hover:bg-[#1a1a1a]"
          title="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#0a0a0a] border-r border-[#1a1a1a]
          transition-all duration-300 ease-in-out
          ${leftSidebarOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              NextFlow
            </span>
          </div>
          <button
            onClick={toggleLeftSidebar}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#141414] border border-[#262626] rounded-lg text-white placeholder-[#71717a] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
            />
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="flex-1 overflow-y-auto px-3">
          <button
            onClick={() => setQuickAccessOpen(!quickAccessOpen)}
            className="flex items-center gap-1.5 w-full px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#71717a] hover:text-[#a1a1aa] transition-colors"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                quickAccessOpen ? "" : "-rotate-90"
              }`}
            />
            Quick Access
          </button>

          {quickAccessOpen && (
            <div className="space-y-1 mt-1 animate-fade-in">
              {filteredNodes.map((node) => {
                const Icon = iconMap[node.icon];
                const accentColor =
                  handleColorMap[node.type] || "#8B5CF6";

                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing select-none
                      bg-transparent hover:bg-[#141414] border border-transparent hover:border-[#262626]
                      transition-all duration-150 active:scale-[0.98]"
                    title={node.description}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        backgroundColor: `${accentColor}12`,
                      }}
                    >
                      {Icon && (
                        <Icon
                          className="w-4 h-4 transition-colors"
                          style={{ color: accentColor }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#e4e4e7] group-hover:text-white transition-colors truncate">
                        {node.label}
                      </div>
                      <div className="text-[10px] text-[#71717a] truncate mt-0.5">
                        {node.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredNodes.length === 0 && searchQuery && (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-[#71717a]">No nodes match your search</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-[#1a1a1a]">
          <p className="text-[10px] text-[#52525b] leading-relaxed">
            Drag nodes onto the canvas or click to add them to the center of
            the viewport.
          </p>
        </div>
      </div>
    </>
  );
}
