'use client';

import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport?: any;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowResponse {
  success: boolean;
  data?: Workflow;
  error?: string;
}

export function useWorkflowAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkflow = useCallback(
    async (name: string, description?: string): Promise<Workflow | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            nodes: [],
            edges: [],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create workflow');
        }

        const data: WorkflowResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to create workflow');
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

  const getWorkflow = useCallback(
    async (workflowId: string): Promise<Workflow | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workflows/${workflowId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch workflow');
        }

        const data: WorkflowResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch workflow');
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

  const updateWorkflow = useCallback(
    async (
      workflowId: string,
      updates: Partial<Workflow>
    ): Promise<Workflow | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update workflow');
        }

        const data: WorkflowResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to update workflow');
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

  const deleteWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete workflow');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createWorkflow,
    getWorkflow,
    updateWorkflow,
    deleteWorkflow,
  };
}
