import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schemas
const CreateWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(255),
  description: z.string().optional(),
  nodes: z.array(z.record(z.any())).optional().default([]),
  edges: z.array(z.record(z.any())).optional().default([]),
  viewport: z.record(z.any()).optional(),
});

type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;

/**
 * GET /api/workflows
 * List all workflows for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { runs: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.error('[GET /api/workflows]', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CreateWorkflowSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, description, nodes, edges, viewport } = validation.data;

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description,
        nodes,
        edges,
        viewport,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: workflow,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/workflows]', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
