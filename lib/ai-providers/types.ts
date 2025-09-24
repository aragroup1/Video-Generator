export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface VideoGenerationRequest {
  imageUrl: string;
  prompt?: string;
  duration?: number; // in seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'low' | 'medium' | 'high';
  style?: string;
}

export interface VideoGenerationResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  error?: string;
  estimatedTime?: number;
}

export interface AIProvider {
  generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  checkStatus(jobId: string): Promise<VideoGenerationResponse>;
  downloadVideo(jobId: string): Promise<Buffer>;
  getCredits(): Promise<number>;
  validateApiKey(): Promise<boolean>;
}
