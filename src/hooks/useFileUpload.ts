'use client';

import { useState, useCallback } from 'react';

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    fileName: string;
    size: number;
    type: string;
  };
  error?: string;
}

export function useFileUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data: UploadResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setProgress(100);
      return data.data?.url || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadVideo = useCallback(async (file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const data: UploadResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload video');
      }

      setProgress(100);
      return data.data?.url || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    progress,
    uploadImage,
    uploadVideo,
  };
}
