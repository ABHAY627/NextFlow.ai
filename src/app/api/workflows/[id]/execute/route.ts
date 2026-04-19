import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  isValidDAG,
  topologicalSort,
  createWorkflowRun,
  createNodeExecution,
  updateNodeExecution,
  completeWorkflowRun,
  aggregateNodeInputs,
} from '@/lib/execution-engine';

const ExecuteWorkflowSchema = z.object({
  workflowId: z.string(),
  scope: z.enum(['full', 'partial', 'single']),
  nodeIds: z.array(z.string()).optional(),
});

type ExecuteWorkflowInput = z.infer<typeof ExecuteWorkflowSchema>;

/**
 * POST /api/workflows/[id]/execute
 * Execute a workflow or selected nodes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = ExecuteWorkflowSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { scope, nodeIds } = validation.data;

    // Fetch workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (workflow.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const nodes = workflow.nodes as any[];
    const edges = workflow.edges as any[];

    // Validate DAG
    const dagCheck = isValidDAG(nodes, edges);
    if (!dagCheck.valid) {
      return NextResponse.json(
        {
          error: 'Workflow contains a circular dependency',
          cycle: dagCheck.cycle,
        },
        { status: 400 }
      );
    }

    // Determine which nodes to execute
    let nodesToExecute = nodes;
    if (scope === 'partial' && nodeIds && nodeIds.length > 0) {
      nodesToExecute = nodes.filter((n) => nodeIds.includes(n.id));
    } else if (scope === 'single' && nodeIds && nodeIds.length > 0) {
      nodesToExecute = nodes.filter((n) => n.id === nodeIds[0]);
    }

    // Create workflow run
    const run = await createWorkflowRun(
      id,
      userId,
      scope,
      nodesToExecute.length
    );

    // Get execution plan
    const { phases } = topologicalSort(nodesToExecute, edges);

    // Execute phases in parallel
    let executionResults = new Map<string, any>();
    let executionStatus: Record<string, 'success' | 'failed'> = {};

    try {
      for (const phase of phases) {
        // Create execution records for all nodes in phase
        const phaseExecutions = await Promise.all(
          phase.nodeIds.map((nodeId) => {
            const node = nodes.find((n) => n.id === nodeId);
            const inputs = aggregateNodeInputs(nodeId, nodes, edges, executionResults);
            return createNodeExecution(
              run.id,
              nodeId,
              node?.type || 'unknown',
              node?.data?.label || nodeId,
              inputs
            );
          })
        );

        // Execute all nodes in phase in parallel
        const phasePromises = phase.nodeIds.map(async (nodeId, idx) => {
          const node = nodes.find((n) => n.id === nodeId);
          const execution = phaseExecutions[idx];
          const inputs = aggregateNodeInputs(nodeId, nodes, edges, executionResults);

          try {
            // Update to running status
            await updateNodeExecution(execution.id, 'running');

            // TODO: Execute node based on type
            // For now, we'll return mock results
            const nodeType = node?.type;
            let result: any = {};

            switch (nodeType) {
              case 'textNode':
                result = { output: node?.data?.text || '' };
                break;
              case 'uploadImageNode':
                result = { output: node?.data?.imageUrl || '' };
                break;
              case 'uploadVideoNode':
                result = { output: node?.data?.videoUrl || '' };
                break;
              case 'llmNode':
                // TODO: Call Trigger.dev task
                result = { output: 'LLM response would be here' };
                break;
              case 'cropImageNode':
                // TODO: Call Trigger.dev task
                result = { output: inputs.image_url || '' };
                break;
              case 'extractFrameNode':
                // TODO: Call Trigger.dev task
                result = { output: 'Frame URL would be here' };
                break;
              default:
                result = { output: '' };
            }

            // Update execution with success
            await updateNodeExecution(execution.id, 'success', result);

            executionResults.set(nodeId, result);
            executionStatus[nodeId] = 'success';

            return { nodeId, success: true, result };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';

            // Update execution with failure
            await updateNodeExecution(
              execution.id,
              'failed',
              undefined,
              errorMessage
            );

            executionStatus[nodeId] = 'failed';
            return { nodeId, success: false, error: errorMessage };
          }
        });

        await Promise.all(phasePromises);
      }

      // Determine final status
      const allSuccessful = Object.values(executionStatus).every(
        (status) => status === 'success'
      );
      const finalStatus = allSuccessful ? 'success' : 'partial';

      // Complete the run
      const completedRun = await completeWorkflowRun(run.id, finalStatus);

      return NextResponse.json(
        {
          success: true,
          data: {
            runId: completedRun.id,
            status: completedRun.status,
            duration: completedRun.duration,
            nodeExecutions: completedRun.nodeExecutions,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Mark run as failed
      await completeWorkflowRun(run.id, 'failed');

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          runId: run.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[POST /api/workflows/[id]/execute]', error);
    return NextResponse.json(
      { error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}
