'use client';

import { useState, useCallback } from 'react';

interface NodeExecution {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  inputs?: any;
  outputs?: any;
  error?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed' | 'partial';
  scope: 'full' | 'partial' | 'single';
  nodeCount: number;
  duration?: number;
  startedAt: string;
  completedAt?: string;
  nodeExecutions?: NodeExecution[];
}

export function useWorkflowExecution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWorkflow = useCallback(
    async (
      workflowId: string,
      scope: 'full' | 'partial' | 'single' = 'full',
      nodeIds?: string[]
    ): Promise<WorkflowRun | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/workflows/${workflowId}/execute`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflowId,
              scope,
              nodeIds,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to execute workflow');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to execute workflow');
        }

        return data.data || null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getWorkflowRuns = useCallback(
    async (workflowId: string): Promise<WorkflowRun[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workflows/${workflowId}/runs`);

        if (!response.ok) {
          throw new Error('Failed to fetch workflow runs');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch workflow runs');
        }

        return data.data || [];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getRunDetails = useCallback(
    async (runId: string): Promise<WorkflowRun | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/runs/${runId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch run details');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch run details');
        }

        return data.data || null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    executeWorkflow,
    getWorkflowRuns,
    getRunDetails,
  };
}
