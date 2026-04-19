import { task } from '@trigger.dev/sdk/v3';

interface CropImageTaskInput {
  imageUrl: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

interface CropImageTaskOutput {
  croppedUrl: string;
  originalUrl: string;
  timestamp: string;
}

export const cropImageTask = task<CropImageTaskInput, CropImageTaskOutput>({
  id: 'crop-image-ffmpeg',
  run: async (input) => {
    try {
      // Fetch the image from the URL
      const response = await fetch(input.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Prepare crop parameters
      // Since we don't have direct FFmpeg access here, we'll simulate the crop
      // In production, this would call an FFmpeg service or Lambda function
      // For now, we return a processed image indication

      // TODO: Integrate with actual FFmpeg service or AWS Lambda
      // For demo purposes, we'll return the original image with metadata
      const croppedUrl = input.imageUrl; // In production: process and upload via Transloadit

      return {
        croppedUrl: croppedUrl,
        originalUrl: input.imageUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Crop image task failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
