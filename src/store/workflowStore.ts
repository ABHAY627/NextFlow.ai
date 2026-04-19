import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type Viewport,
} from '@xyflow/react';
import type { BaseNodeData, NodeType, ExecutionStatus } from '@/lib/types';
import { getDefaultNodeData } from '@/lib/types';

// ─── History Snapshot ───────────────────────────────────────
interface HistorySnapshot {
  nodes: Node<BaseNodeData>[];
  edges: Edge[];
}

// ─── Store State ────────────────────────────────────────────
interface WorkflowState {
  // Canvas state
  nodes: Node<BaseNodeData>[];
  edges: Edge[];
  viewport: Viewport;

  // Sidebar state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // Execution state
  executingNodes: Record<string, ExecutionStatus>;
  nodeOutputs: Record<string, string>;
  currentRunId: string | null;

  // Selection
  selectedNodeIds: string[];

  // Undo/Redo
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  maxHistorySize: number;

  // Workflow metadata
  workflowId: string | null;
  workflowName: string;
  isDirty: boolean;

  // ─── Actions ─────────────────────────────────────────────
  onNodesChange: OnNodesChange<Node<BaseNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setNodes: (nodes: Node<BaseNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;

  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  updateNodeData: (nodeId: string, data: Partial<BaseNodeData>) => void;

  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;

  setNodeExecutionStatus: (nodeId: string, status: ExecutionStatus) => void;
  setNodeOutput: (nodeId: string, output: string) => void;
  clearExecutionState: () => void;
  setCurrentRunId: (runId: string | null) => void;

  setSelectedNodeIds: (ids: string[]) => void;

  // Undo/Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Workflow
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setIsDirty: (dirty: boolean) => void;
  loadWorkflow: (nodes: Node<BaseNodeData>[], edges: Edge[], viewport?: Viewport) => void;
  resetWorkflow: () => void;

  // Helpers
  getConnectedInputs: (nodeId: string) => string[];
  isInputConnected: (nodeId: string, handleId: string) => boolean;
}

let nodeIdCounter = 0;

const generateNodeId = () => {
  nodeIdCounter += 1;
  return `node-${Date.now()}-${nodeIdCounter}`;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // ─── Initial State ──────────────────────────────────────
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  leftSidebarOpen: true,
  rightSidebarOpen: true,

  executingNodes: {},
  nodeOutputs: {},
  currentRunId: null,

  selectedNodeIds: [],

  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,

  workflowId: null,
  workflowName: 'Untitled Workflow',
  isDirty: false,

  // ─── React Flow Callbacks ──────────────────────────────
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as Node<BaseNodeData>[],
      isDirty: true,
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }));
  },

  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#8B5CF6', strokeWidth: 2 },
        },
        state.edges
      ),
      isDirty: true,
    }));
    // Push to undo stack
    get().pushHistory();
  },

  // ─── Setters ───────────────────────────────────────────
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  setViewport: (viewport) => set({ viewport }),

  // ─── Node Operations ──────────────────────────────────
  addNode: (type, position) => {
    get().pushHistory();
    const id = generateNodeId();
    const data = getDefaultNodeData(type);
    const newNode: Node<BaseNodeData> = {
      id,
      type,
      position,
      data,
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
    }));
  },

  deleteNode: (nodeId) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      isDirty: true,
    }));
  },

  deleteSelectedNodes: () => {
    const { selectedNodeIds, nodes } = get();
    const selectedSet = new Set(selectedNodeIds);
    const selectedFromReactFlow = nodes.filter((n) => n.selected).map((n) => n.id);
    selectedFromReactFlow.forEach((id) => selectedSet.add(id));

    if (selectedSet.size === 0) return;

    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => !selectedSet.has(n.id)),
      edges: state.edges.filter(
        (e) => !selectedSet.has(e.source) && !selectedSet.has(e.target)
      ),
      selectedNodeIds: [],
      isDirty: true,
    }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      isDirty: true,
    }));
  },

  // ─── Sidebar ───────────────────────────────────────────
  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

  // ─── Execution ─────────────────────────────────────────
  setNodeExecutionStatus: (nodeId, status) =>
    set((state) => ({
      executingNodes: { ...state.executingNodes, [nodeId]: status },
    })),

  setNodeOutput: (nodeId, output) =>
    set((state) => ({
      nodeOutputs: { ...state.nodeOutputs, [nodeId]: output },
    })),

  clearExecutionState: () =>
    set({ executingNodes: {}, currentRunId: null }),

  setCurrentRunId: (runId) => set({ currentRunId: runId }),

  // ─── Selection ─────────────────────────────────────────
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),

  // ─── Undo/Redo ─────────────────────────────────────────
  pushHistory: () => {
    const { nodes, edges, undoStack, maxHistorySize } = get();
    const snapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const newStack = [...undoStack, snapshot].slice(-maxHistorySize);
    set({ undoStack: newStack, redoStack: [] });
  },

  undo: () => {
    const { undoStack, nodes, edges } = get();
    if (undoStack.length === 0) return;

    const currentSnapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    const previous = undoStack[undoStack.length - 1];
    set((state) => ({
      nodes: previous.nodes,
      edges: previous.edges,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentSnapshot],
      isDirty: true,
    }));
  },

  redo: () => {
    const { redoStack, nodes, edges } = get();
    if (redoStack.length === 0) return;

    const currentSnapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    const next = redoStack[redoStack.length - 1];
    set((state) => ({
      nodes: next.nodes,
      edges: next.edges,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentSnapshot],
      isDirty: true,
    }));
  },

  // ─── Workflow ──────────────────────────────────────────
  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),

  loadWorkflow: (nodes, edges, viewport) => {
    set({
      nodes,
      edges,
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      undoStack: [],
      redoStack: [],
      isDirty: false,
    });
  },

  resetWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      undoStack: [],
      redoStack: [],
      executingNodes: {},
      nodeOutputs: {},
      currentRunId: null,
      selectedNodeIds: [],
      workflowId: null,
      workflowName: 'Untitled Workflow',
      isDirty: false,
    });
  },

  // ─── Helpers ───────────────────────────────────────────
  getConnectedInputs: (nodeId) => {
    const { edges } = get();
    return edges
      .filter((e) => e.target === nodeId)
      .map((e) => e.targetHandle || '');
  },

  isInputConnected: (nodeId, handleId) => {
    const { edges } = get();
    return edges.some(
      (e) => e.target === nodeId && e.targetHandle === handleId
    );
  },
}));
