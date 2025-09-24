import axios, { AxiosInstance } from 'axios';
import { AIProvider, AIProviderConfig, VideoGenerationRequest, VideoGenerationResponse } from './types';

export class RunwayProvider implements AIProvider {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.runway.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.post('/video-generations', {
        model: 'gen-3-alpha',
        input: {
          image_url: request.imageUrl,
          text_prompt: request.prompt || 'Create a cinematic video from this image',
        },
        parameters: {
          duration: request.duration || 5,
          aspect_ratio: request.aspectRatio || '16:9',
          resolution: this.mapQualityToResolution(request.quality),
        },
      });

      return {
        jobId: response.data.id,
        status: this.mapStatus(response.data.status),
        progress: response.data.progress || 0,
        estimatedTime: response.data.estimated_completion_time,
      };
    } catch (error: any) {
      console.error('Runway generation error:', error.response?.data || error.message);
      throw new Error(`Failed to generate video: ${error.response?.data?.message || error.message}`);
    }
  }

  async checkStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await this.client.get(`/video-generations/${jobId}`);
      
      return {
        jobId: response.data.id,
        status: this.mapStatus(response.data.status),
        progress: response.data.progress || 0,
        resultUrl: response.data.output?.video_url,
        error: response.data.error,
        estimatedTime: response.data.estimated_completion_time,
      };
    } catch (error: any) {
      console.error('Runway status check error:', error.response?.data || error.message);
      throw new Error(`Failed to check status: ${error.response?.data?.message || error.message}`);
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
      const response = await this.client.get('/account/credits');
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
      case 'PENDING':
      case 'QUEUED':
        return 'pending';
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'processing';
      case 'COMPLETED':
      case 'SUCCESS':
        return 'completed';
      case 'FAILED':
      case 'ERROR':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapQualityToResolution(quality?: string): string {
    switch (quality) {
      case 'high':
        return '1080p';
      case 'medium':
        return '720p';
      case 'low':
        return '480p';
      default:
        return '720p';
    }
  }
}
