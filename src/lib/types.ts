import type { Node, Edge } from '@xyflow/react';

// ─── Handle Types ───────────────────────────────────────────
export type HandleDataType = 'text' | 'image' | 'video' | 'number';

export interface HandleConfig {
  id: string;
  label: string;
  dataType: HandleDataType;
  required?: boolean;
  multiple?: boolean;
}

// ─── Node Data Types ────────────────────────────────────────
export interface BaseNodeData {
  label: string;
  status: ExecutionStatus;
  output?: string;
  error?: string;
  [key: string]: unknown;
}

export interface TextNodeData extends BaseNodeData {
  text: string;
}

export interface UploadImageNodeData extends BaseNodeData {
  imageUrl: string;
  fileName: string;
  uploading: boolean;
}

export interface UploadVideoNodeData extends BaseNodeData {
  videoUrl: string;
  fileName: string;
  uploading: boolean;
}

export interface LLMNodeData extends BaseNodeData {
  model: string;
  systemPrompt: string;
  userMessage: string;
  imageUrls: string[];
  result: string;
}

export interface CropImageNodeData extends BaseNodeData {
  imageUrl: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  croppedUrl: string;
}

export interface ExtractFrameNodeData extends BaseNodeData {
  videoUrl: string;
  timestamp: string;
  frameUrl: string;
}

// ─── Node Types ─────────────────────────────────────────────
export type NodeType =
  | 'textNode'
  | 'uploadImageNode'
  | 'uploadVideoNode'
  | 'llmNode'
  | 'cropImageNode'
  | 'extractFrameNode';

export type AppNode = Node<BaseNodeData>;

// ─── Execution Types ────────────────────────────────────────
export type ExecutionStatus = 'idle' | 'pending' | 'running' | 'success' | 'failed';
export type RunScope = 'full' | 'partial' | 'single';
export type RunStatus = 'running' | 'success' | 'failed' | 'partial';

// ─── Connection Validation ──────────────────────────────────
export const HANDLE_TYPE_COMPATIBILITY: Record<HandleDataType, HandleDataType[]> = {
  text: ['text'],
  image: ['image'],
  video: ['video'],
  number: ['number', 'text'],
};

// ─── Gemini Models ──────────────────────────────────────────
export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
] as const;

// ─── Sidebar Node Definitions ───────────────────────────────
export interface SidebarNodeDef {
  type: NodeType;
  label: string;
  icon: string; // Lucide icon name
  description: string;
}

export const SIDEBAR_NODES: SidebarNodeDef[] = [
  {
    type: 'textNode',
    label: 'Text',
    icon: 'Type',
    description: 'Simple text input with textarea',
  },
  {
    type: 'uploadImageNode',
    label: 'Upload Image',
    icon: 'Image',
    description: 'Upload an image file via Transloadit',
  },
  {
    type: 'uploadVideoNode',
    label: 'Upload Video',
    icon: 'Video',
    description: 'Upload a video file via Transloadit',
  },
  {
    type: 'llmNode',
    label: 'Run Any LLM',
    icon: 'Brain',
    description: 'Execute LLM models with prompts and images',
  },
  {
    type: 'cropImageNode',
    label: 'Crop Image',
    icon: 'Crop',
    description: 'Crop an image using FFmpeg via Trigger.dev',
  },
  {
    type: 'extractFrameNode',
    label: 'Extract Frame',
    icon: 'Film',
    description: 'Extract a frame from a video via FFmpeg',
  },
];

// ─── Default Node Data ──────────────────────────────────────
export function getDefaultNodeData(type: NodeType): BaseNodeData {
  const base: BaseNodeData = { label: '', status: 'idle' };
  
  switch (type) {
    case 'textNode':
      return { ...base, label: 'Text', text: '' } as TextNodeData;
    case 'uploadImageNode':
      return { ...base, label: 'Upload Image', imageUrl: '', fileName: '', uploading: false } as UploadImageNodeData;
    case 'uploadVideoNode':
      return { ...base, label: 'Upload Video', videoUrl: '', fileName: '', uploading: false } as UploadVideoNodeData;
    case 'llmNode':
      return { ...base, label: 'Run Any LLM', model: 'gemini-2.0-flash', systemPrompt: '', userMessage: '', imageUrls: [], result: '' } as LLMNodeData;
    case 'cropImageNode':
      return { ...base, label: 'Crop Image', imageUrl: '', xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, croppedUrl: '' } as CropImageNodeData;
    case 'extractFrameNode':
      return { ...base, label: 'Extract Frame', videoUrl: '', timestamp: '0', frameUrl: '' } as ExtractFrameNodeData;
    default:
      return base;
  }
}

// ─── Workflow Types ─────────────────────────────────────────
export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  nodes: AppNode[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
}

// ─── History Types ──────────────────────────────────────────
export interface WorkflowRunEntry {
  id: string;
  workflowId: string;
  status: RunStatus;
  scope: RunScope;
  nodeCount: number;
  duration?: number;
  startedAt: string;
  completedAt?: string;
  nodeExecutions: NodeExecutionEntry[];
}

export interface NodeExecutionEntry {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: ExecutionStatus;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
}
