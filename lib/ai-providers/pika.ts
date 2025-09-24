import axios, { AxiosInstance } from 'axios';
import { AIProvider, AIProviderConfig, VideoGenerationRequest, VideoGenerationResponse } from './types';

export class PikaProvider implements AIProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.pika.art/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.post('/generate', {
        image: request.imageUrl,
        prompt: request.prompt || 'Animate this image into a video',
        options: {
          frameRate: 24,
          duration: request.duration || 3,
          aspectRatio: request.aspectRatio || '16:9',
          quality: request.quality || 'medium',
          style: request.style,
        },
      });

      return {
        jobId: response.data.taskId,
        status: 'pending',
        progress: 0,
        estimatedTime: response.data.estimatedTime,
      };
    } catch (error: any) {
      console.error('Pika generation error:', error.response?.data || error.message);
      throw new Error(`Failed to generate video: ${error.response?.data?.error || error.message}`);
    }
  }

  async checkStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.get(`/status/${jobId}`);
      
      return {
        jobId: response.data.taskId,
        status: this.mapStatus(response.data.status),
        progress: response.data.progress || 0,
        resultUrl: response.data.resultUrl,
        error: response.data.error,
        estimatedTime: response.data.remainingTime,
      };
    } catch (error: any) {
      console.error('Pika status check error:', error.response?.data || error.message);
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
      const response = await this.client.get('/account');
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

  private mapStatus(status: string): VideoGenerationResponse['status'] {
    switch (status) {
      case 'waiting':
      case 'queued':
        return 'pending';
      case 'processing':
      case 'generating':
        return 'processing';
      case 'completed':
      case 'done':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'pending';
    }
  }
}
