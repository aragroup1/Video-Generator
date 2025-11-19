// Video style types
export type VideoStyle = 
  | '360_rotation'
  | 'lifestyle_casual'
  | 'lifestyle_premium'
  | 'ad_testimonial'
  | 'ad_feature_focus'
  | 'ad_problem_solution'
  | 'how_to_use'
  | 'influencer_showcase';

// Budget level types
export type BudgetLevel = 'economy' | 'standard' | 'premium';

// Request and response interfaces
export interface VideoGenerationRequest {
  imageUrl: string;
  prompt?: string;
  duration?: number;
}

export interface VideoGenerationResponse {
  videoUrl: string;
  estimatedCost: number;
}

// Provider configuration
export interface AIProviderConfig {
  apiKey: string;
}

// Provider interface
export interface AIProvider {
  generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
}
