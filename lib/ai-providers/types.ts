import axios, { AxiosInstance } from 'axios';
import { AIProvider, VideoGenerationRequest, VideoGenerationResponse } from './types';

export class LumaProvider implements AIProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: 'https://api.lumalabs.ai/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.post('/generations', {
        prompt: request.prompt,
        image_url: request.imageUrl,
      });

      return {
        videoUrl: response.data.video_url,
        estimatedCost: 0.40,
      };
    } catch (error: any) {
      throw new Error(`Luma generation failed: ${error.message}`);
    }
  }
}
