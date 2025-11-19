import axios, { AxiosInstance } from 'axios';
import { AIProvider, VideoGenerationRequest, VideoGenerationResponse } from './types';

export class PikaProvider implements AIProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: 'https://api.pika.art/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      console.log('🎬 Starting Pika generation...');
      
      const response = await this.client.post('/generations', {
        prompt: request.prompt,
        image_url: request.imageUrl,
      });

      console.log('✅ Pika video generated successfully');

      return {
        videoUrl: response.data.video_url || response.data.url,
        estimatedCost: 0.50,
      };
    } catch (error: any) {
      console.error('❌ Pika generation failed:', error);
      throw new Error(`Pika generation failed: ${error.message}`);
    }
  }
}
