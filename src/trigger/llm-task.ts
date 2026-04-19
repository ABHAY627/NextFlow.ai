import { task } from '@trigger.dev/sdk/v3';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface LLMTaskInput {
  model: string;
  systemPrompt?: string;
  userMessage: string;
  imageUrls?: string[];
}

interface LLMTaskOutput {
  result: string;
  model: string;
  timestamp: string;
}

export const runLLMTask = task<LLMTaskInput, LLMTaskOutput>({
  id: 'run-llm-gemini',
  run: async (input) => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: input.model });

    // Build the content array with text and images
    const content: any[] = [];

    // Add system prompt as first message if provided
    if (input.systemPrompt) {
      content.push({
        text: `System: ${input.systemPrompt}\n\nUser: ${input.userMessage}`,
      });
    } else {
      content.push({
        text: input.userMessage,
      });
    }

    // Add images if provided
    if (input.imageUrls && input.imageUrls.length > 0) {
      for (const imageUrl of input.imageUrls) {
        try {
          // Fetch image and convert to base64
          const response = await fetch(imageUrl);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mediaType = response.headers.get('content-type') || 'image/jpeg';

          content.push({
            inlineData: {
              data: base64,
              mimeType: mediaType,
            },
          });
        } catch (error) {
          console.error(`Failed to fetch image from ${imageUrl}:`, error);
        }
      }
    }

    try {
      const result = await model.generateContent(content);
      const text = result.response.text();

      return {
        result: text,
        model: input.model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`LLM execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
