import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Validation schemas for uploads
const ImageUploadSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string(),
});

const VideoUploadSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string(),
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * POST /api/upload/image
 * Upload an image file
 * 
 * In production, this would integrate with Transloadit
 * For now, we'll create a mock implementation that would be replaced
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get the path to determine upload type
    const pathname = new URL(request.url).pathname;
    const isImage = pathname.includes('image');
    const isVideo = pathname.includes('video');

    if (isImage) {
      // Validate image
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: 'Invalid file type. Allowed types: jpg, jpeg, png, webp, gif',
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds 50MB limit' },
          { status: 400 }
        );
      }

      // TODO: Upload to Transloadit
      // For now, create a mock URL
      const mockUrl = `https://cdn.transloadit.com/mock/${userId}/${Date.now()}-${file.name}`;

      return NextResponse.json(
        {
          success: true,
          data: {
            url: mockUrl,
            fileName: file.name,
            size: file.size,
            type: file.type,
          },
        },
        { status: 201 }
      );
    } else if (isVideo) {
      // Validate video
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: 'Invalid file type. Allowed types: mp4, mov, webm, m4v',
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds 500MB limit' },
          { status: 400 }
        );
      }

      // TODO: Upload to Transloadit
      // For now, create a mock URL
      const mockUrl = `https://cdn.transloadit.com/mock/${userId}/${Date.now()}-${file.name}`;

      return NextResponse.json(
        {
          success: true,
          data: {
            url: mockUrl,
            fileName: file.name,
            size: file.size,
            type: file.type,
          },
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[POST /api/upload/*]', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
