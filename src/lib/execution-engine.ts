import type { Edge, Node } from '@xyflow/react';
import { prisma } from './prisma';

/**
 * Execution engine for NextFlow workflows
 * Handles:
 * - DAG validation
 * - Topological sorting
 * - Parallel execution grouping
 * - Dependency resolution
 * - Real-time status tracking
 */

export interface ExecutionPhase {
  nodeIds: string[];
  dependencies: Map<string, string[]>;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  nodeToPhase: Map<string, number>;
}

/**
 * Build a dependency graph from workflow edges
 */
export function buildDependencyGraph(
  nodes: Node[],
  edges: Edge[]
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  // Initialize all nodes with empty dependency lists
  for (const node of nodes) {
    graph.set(node.id, []);
  }

  // Add dependencies based on edges
  for (const edge of edges) {
    const { source, target } = edge;
    const deps = graph.get(target) || [];
    deps.push(source);
    graph.set(target, deps);
  }

  return graph;
}

/**
 * Check if workflow is a valid DAG (no cycles)
 */
export function isValidDAG(
  nodes: Node[],
  edges: Edge[]
): { valid: boolean; cycle?: string[] } {
  const graph = buildDependencyGraph(nodes, edges);
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(nodeId: string): string[] | null {
    visited.add(nodeId);
    recStack.add(nodeId);

    const deps = graph.get(nodeId) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        const cycle = hasCycle(dep);
        if (cycle) return cycle;
      } else if (recStack.has(dep)) {
        // Found a cycle
        return [nodeId, dep];
      }
    }

    recStack.delete(nodeId);
    return null;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const cycle = hasCycle(node.id);
      if (cycle) {
        return { valid: false, cycle };
      }
    }
  }

  return { valid: true };
}

/**
 * Topological sort using Kahn's algorithm
 * Returns nodes grouped into execution phases for parallel processing
 */
export function topologicalSort(
  nodes: Node[],
  edges: Edge[]
): ExecutionPlan {
  const graph = buildDependencyGraph(nodes, edges);
  const inDegree = new Map<string, number>();
  const nodeToPhase = new Map<string, number>();
  const phases: ExecutionPhase[] = [];

  // Calculate in-degrees
  for (const node of nodes) {
    inDegree.set(node.id, graph.get(node.id)?.length || 0);
  }

  let currentPhase = 0;

  // Process nodes level by level (phases)
  while (inDegree.size > 0) {
    const phaseNodes = Array.from(inDegree.entries())
      .filter(([, degree]) => degree === 0)
      .map(([nodeId]) => nodeId);

    if (phaseNodes.length === 0) {
      throw new Error('Circular dependency detected in workflow');
    }

    // Create phase with dependencies
    const phaseDependencies = new Map<string, string[]>();
    for (const nodeId of phaseNodes) {
      phaseDependencies.set(nodeId, graph.get(nodeId) || []);
    }

    phases.push({
      nodeIds: phaseNodes,
      dependencies: phaseDependencies,
    });

    // Mark phase assignment
    for (const nodeId of phaseNodes) {
      nodeToPhase.set(nodeId, currentPhase);
    }

    // Remove processed nodes and update in-degrees
    for (const nodeId of phaseNodes) {
      inDegree.delete(nodeId);
    }

    // Update in-degrees for remaining nodes
    for (const [nodeId, degree] of inDegree.entries()) {
      const deps = Array.from(inDegree.keys()).filter((n) =>
        graph.get(n)?.includes(nodeId)
      );
      inDegree.set(nodeId, deps.filter((d) => !phaseNodes.includes(d)).length);
    }

    currentPhase++;
  }

  return { phases, nodeToPhase };
}

/**
 * Collect inputs for a node from its connected dependencies
 */
export function aggregateNodeInputs(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  executionResults: Map<string, any>
): Record<string, any> {
  const inputs: Record<string, any> = {};

  // Find all incoming edges for this node
  const incomingEdges = edges.filter((edge) => edge.target === nodeId);

  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const result = executionResults.get(edge.source);

    if (!sourceNode || !result) continue;

    // Map edge handle to input key
    const handleKey = edge.targetHandle || 'input';

    // For nodes that accept multiple images, collect them in an array
    if (handleKey === 'images' || handleKey.startsWith('images_')) {
      if (!Array.isArray(inputs[handleKey])) {
        inputs[handleKey] = [];
      }
      inputs[handleKey].push(result.output || result);
    } else {
      inputs[handleKey] = result.output || result;
    }
  }

  return inputs;
}

/**
 * Create a workflow run and initialize tracking
 */
export async function createWorkflowRun(
  workflowId: string,
  userId: string,
  scope: 'full' | 'partial' | 'single',
  nodeCount: number
) {
  const run = await prisma.workflowRun.create({
    data: {
      workflowId,
      userId,
      status: 'running',
      scope,
      nodeCount,
      startedAt: new Date(),
    },
    include: {
      nodeExecutions: true,
    },
  });

  return run;
}

/**
 * Create a node execution record
 */
export async function createNodeExecution(
  runId: string,
  nodeId: string,
  nodeType: string,
  nodeLabel: string,
  inputs?: any
) {
  const execution = await prisma.nodeExecution.create({
    data: {
      runId,
      nodeId,
      nodeType,
      nodeLabel,
      status: 'pending',
      inputs: inputs || {},
      startedAt: new Date(),
    },
  });

  return execution;
}

/**
 * Update node execution with results
 */
export async function updateNodeExecution(
  executionId: string,
  status: 'running' | 'success' | 'failed',
  outputs?: any,
  error?: string
) {
  const now = new Date();
  const completedAt = status !== 'running' ? now : undefined;

  const execution = await prisma.nodeExecution.update({
    where: { id: executionId },
    data: {
      status,
      outputs: outputs || {},
      error,
      completedAt,
      duration: completedAt
        ? completedAt.getTime() - (await prisma.nodeExecution.findUnique({
            where: { id: executionId },
          }))?.startedAt.getTime()!
        : undefined,
    },
  });

  return execution;
}

/**
 * Update workflow run with final status
 */
export async function completeWorkflowRun(
  runId: string,
  status: 'success' | 'failed' | 'partial'
) {
  const now = new Date();
  const run = await prisma.workflowRun.findUnique({
    where: { id: runId },
  });

  if (!run) throw new Error('Run not found');

  const duration = now.getTime() - run.startedAt.getTime();

  const updated = await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status,
      completedAt: now,
      duration,
    },
    include: {
      nodeExecutions: true,
    },
  });

  return updated;
}
