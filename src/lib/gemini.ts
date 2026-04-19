/**
 * Google Gemini API Service
 * Handles LLM calls and multimodal processing
 * 
 * Official docs: https://ai.google.dev/gemini-api/docs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiImageInput {
  data: string; // base64
  mimeType: string;
}

interface GeminiRequestOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiService {
  private client: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }

    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Generate text response from Gemini model
   */
  async generateText(
    model: string,
    prompt: string,
    images?: string[],
    options?: GeminiRequestOptions
  ): Promise<string> {
    try {
      const geminiModel = this.client.getGenerativeModel({ model });

      // Build content array
      const content: any[] = [];

      // Add system prompt and user message
      if (options?.systemPrompt) {
        content.push({
          text: `System: ${options.systemPrompt}\n\nUser: ${prompt}`,
        });
      } else {
        content.push({
          text: prompt,
        });
      }

      // Add images if provided
      if (images && images.length > 0) {
        for (const imageUrl of images) {
          try {
            const imageData = await this.fetchImageAsBase64(imageUrl);
            content.push({
              inlineData: {
                data: imageData,
                mimeType: 'image/jpeg',
              },
            });
          } catch (error) {
            console.error(`Failed to fetch image: ${imageUrl}`, error);
          }
        }
      }

      const result = await geminiModel.generateContent(content);
      return result.response.text();
    } catch (error) {
      throw new Error(
        `Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Stream text generation from Gemini model
   * Useful for real-time responses
   */
  async *generateTextStream(
    model: string,
    prompt: string,
    images?: string[],
    options?: GeminiRequestOptions
  ): AsyncGenerator<string> {
    try {
      const geminiModel = this.client.getGenerativeModel({ model });

      // Build content
      const content: any[] = [];

      if (options?.systemPrompt) {
        content.push({
          text: `System: ${options.systemPrompt}\n\nUser: ${prompt}`,
        });
      } else {
        content.push({
          text: prompt,
        });
      }

      // Add images
      if (images && images.length > 0) {
        for (const imageUrl of images) {
          try {
            const imageData = await this.fetchImageAsBase64(imageUrl);
            content.push({
              inlineData: {
                data: imageData,
                mimeType: 'image/jpeg',
              },
            });
          } catch (error) {
            console.error(`Failed to fetch image: ${imageUrl}`, error);
          }
        }
      }

      const stream = await geminiModel.generateContentStream(content);

      for await (const chunk of stream.stream) {
        if (chunk.choices[0]?.delta?.text) {
          yield chunk.choices[0].delta.text;
        }
      }
    } catch (error) {
      throw new Error(
        `Gemini stream failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * List available Gemini models
   */
  async listModels(): Promise<string[]> {
    // Returns hardcoded list since Gemini API doesn't have a list models endpoint
    return [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];
  }

  /**
   * Fetch image from URL and convert to base64
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
      throw new Error(
        `Failed to fetch image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Create singleton instance
 */
let geminiInstance: GeminiService | null = null;

export function getGeminiService(apiKey?: string): GeminiService {
  if (!geminiInstance) {
    geminiInstance = new GeminiService(apiKey);
  }
  return geminiInstance;
}
