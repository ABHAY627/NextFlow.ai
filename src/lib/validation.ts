import { z } from 'zod';

/**
 * Common validation schemas for API routes
 */

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
});

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  animated: z.boolean().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * API response wrapper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return {
    success: true,
    data,
    status,
  };
}

export function errorResponse(error: string, status: number = 500) {
  return {
    success: false,
    error,
    status,
  };
}

/**
 * Request validation helper
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return {
        valid: false,
        error: JSON.stringify(validation.error.errors),
      };
    }

    return {
      valid: true,
      data: validation.data,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON in request body',
    };
  }
}
