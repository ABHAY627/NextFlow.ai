"use client";

import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
  type Connection,
  type Edge,
} from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflowStore";
import type { NodeType, HandleDataType, BaseNodeData, AppNode } from "@/lib/types";
import { TextNode } from "@/components/nodes/TextNode";
import { UploadImageNode } from "@/components/nodes/UploadImageNode";
import { UploadVideoNode } from "@/components/nodes/UploadVideoNode";
import { LLMNode } from "@/components/nodes/LLMNode";
import { CropImageNode } from "@/components/nodes/CropImageNode";
import { ExtractFrameNode } from "@/components/nodes/ExtractFrameNode";
import { AnimatedEdge } from "@/components/edges/AnimatedEdge";

// ─── Component Registry ─────────────────────────────────
const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

// ─── Handle type mapping for connection validation ──────
const nodeOutputTypes: Record<string, HandleDataType> = {
  textNode: "text",
  uploadImageNode: "image",
  uploadVideoNode: "video",
  llmNode: "text",
  cropImageNode: "image",
  extractFrameNode: "image",
};

const nodeInputTypes: Record<string, Record<string, HandleDataType>> = {
  llmNode: {
    system_prompt: "text",
    user_message: "text",
    images: "image",
  },
  cropImageNode: {
    image_url: "image",
    x_percent: "number",
    y_percent: "number",
    width_percent: "number",
    height_percent: "number",
  },
  extractFrameNode: {
    video_url: "video",
    timestamp: "text",
  },
};

// ─── Cycle detection (DFS) ──────────────────────────────
function wouldCreateCycle(
  edges: { source: string; target: string }[],
  newSource: string,
  newTarget: string
): boolean {
  // Build adjacency list including the proposed new edge
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }
  if (!adj.has(newSource)) adj.set(newSource, []);
  adj.get(newSource)!.push(newTarget);

  // DFS from newTarget to see if we can reach newSource
  const visited = new Set<string>();
  const stack = [newTarget];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === newSource) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      stack.push(neighbor);
    }
  }
  return false;
}

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance<AppNode, Edge> | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedNodes,
    pushHistory,
  } = useWorkflowStore();

  // ─── Connection Validation ───────────────────────────
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target) return false;

      // No self-connections
      if (source === target) return false;

      // Cycle detection
      if (wouldCreateCycle(edges, source, target)) return false;

      // Find node types
      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return false;

      // Get the data types
      const sourceType =
        nodeOutputTypes[sourceNode.type || ""] || "text";
      const targetInputs =
        nodeInputTypes[targetNode.type || ""] || {};
      const targetType = targetHandle
        ? targetInputs[targetHandle]
        : undefined;

      // If target has no defined type, allow the connection
      if (!targetType) return true;

      // Type compatibility check
      if (sourceType === targetType) return true;
      if (sourceType === "text" && targetType === "number") return true;

      return false;
    },
    [edges, nodes]
  );

  // ─── Drag and Drop from Sidebar ──────────────────────
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      if (!nodeType) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(nodeType, position);
    },
    [addNode]
  );

  // ─── Keyboard Shortcuts ──────────────────────────────
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        // Don't delete if typing in an input
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        )
          return;
        deleteSelectedNodes();
      }
    },
    [deleteSelectedNodes]
  );

  // ─── Handle connect with history ─────────────────────
  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection);
    },
    [onConnect]
  );

  // ─── Handle node drag stop (push history) ────────────
  const onNodeDragStop = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        isValidConnection={isValidConnection}
        colorMode="dark"
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode={null} // We handle deletion ourselves
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#8B5CF6", strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#333333"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeStrokeWidth={3}
          maskColor="rgba(139, 92, 246, 0.08)"
        />
      </ReactFlow>
    </div>
  );
}
