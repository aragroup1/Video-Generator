import axios, { AxiosInstance } from 'axios';
import { AIProvider, AIProviderConfig, VideoGenerationRequest, VideoGenerationResponse } from './types';

export class LumaProvider implements AIProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.lumalabs.ai/dream-machine/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.post('/generations', {
        prompt: request.prompt || 'Transform this image into a dynamic video',
        keyframes: {
          frame0: {
            type: 'image',
            url: request.imageUrl,
          },
        },
        aspect_ratio: request.aspectRatio || '16:9',
        loop: false,
        duration: request.duration || 5,
      });

      return {
        jobId: response.data.id,
        status: this.mapStatus(response.data.state),
        progress: response.data.progress || 0,
        estimatedTime: response.data.estimated_time_to_completion,
      };
    } catch (error: any) {
      console.error('Luma generation error:', error.response?.data || error.message);
      throw new Error(`Failed to generate video: ${error.response?.data?.error || error.message}`);
    }
  }

  async checkStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.get(`/generations/${jobId}`);
      
      return {
        jobId: response.data.id,
        status: this.mapStatus(response.data.state),
        progress: response.data.progress || 0,
        resultUrl: response.data.video?.url,
        error: response.data.failure_reason,
        estimatedTime: response.data.estimated_time_to_completion,
      };
    } catch (error: any) {
      console.error('Luma status check error:', error.response?.data || error.message);
      throw new Error(`Failed to check status: ${error.response?.data?.error || error.message}`);
    }
  }

  async downloadVideo(jobId: string): Promise<Buffer> {
    const status = await this.checkStatus(jobId);
    
    if (!status.resultUrl) {
      throw new Error('Video not ready for download');
    }

    const response = await axios.get(status.resultUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  async getCredits(): Promise<number> {
    try {
      const response = await this.client.get('/credits');
      return response.data.credits || 0;
    } catch {
      return 0;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.getCredits();
      return true;
    } catch {
      return false;
    }
  }

  private mapStatus(state: string): VideoGenerationResponse['status'] {
    switch (state) {
      case 'pending':
      case 'queued':
        return 'pending';
      case 'processing':
      case 'dreaming':
        return 'processing';
      case 'completed':
      case 'ready':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'pending';
    }
  }
}
