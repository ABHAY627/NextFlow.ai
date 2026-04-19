import { task } from '@trigger.dev/sdk/v3';

interface ExtractFrameTaskInput {
  videoUrl: string;
  timestamp: string | number;
}

interface ExtractFrameTaskOutput {
  frameUrl: string;
  videoUrl: string;
  timestamp: string;
  extractedAt: string;
}

export const extractFrameTask = task<ExtractFrameTaskInput, ExtractFrameTaskOutput>({
  id: 'extract-frame-ffmpeg',
  run: async (input) => {
    try {
      // Parse timestamp
      let secondsOffset = 0;

      if (typeof input.timestamp === 'string') {
        if (input.timestamp.includes('%')) {
          // Percentage-based timestamp
          const percent = parseFloat(input.timestamp);
          // For now, we estimate duration; in production, probe the video
          const estimatedDuration = 300; // 5 minutes default
          secondsOffset = (percent / 100) * estimatedDuration;
        } else {
          // Direct seconds
          secondsOffset = parseFloat(input.timestamp);
        }
      } else {
        secondsOffset = input.timestamp;
      }

      // Fetch video metadata
      const response = await fetch(input.videoUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      // TODO: Integrate with FFmpeg service or AWS Lambda for frame extraction
      // For now, return a mock extracted frame URL
      // In production, this would:
      // 1. Download the video
      // 2. Use FFmpeg to extract frame at timestamp
      // 3. Upload extracted frame to Transloadit
      // 4. Return the frame URL

      const frameUrl = input.videoUrl; // Placeholder

      return {
        frameUrl: frameUrl,
        videoUrl: input.videoUrl,
        timestamp: input.timestamp.toString(),
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Extract frame task failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
