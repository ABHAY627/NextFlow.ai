import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workflows/[id]/runs
 * Get workflow execution history
 */
export async function GET(
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

    // Verify workflow ownership
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

    const runs = await prisma.workflowRun.findMany({
      where: { workflowId: id },
      include: {
        nodeExecutions: {
          select: {
            id: true,
            nodeId: true,
            nodeType: true,
            nodeLabel: true,
            status: true,
            duration: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: runs,
    });
  } catch (error) {
    console.error('[GET /api/workflows/[id]/runs]', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow runs' },
      { status: 500 }
    );
  }
}
