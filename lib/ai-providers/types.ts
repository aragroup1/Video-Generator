export type VideoStyle = 
  | '360_rotation'
  | 'lifestyle_casual'
  | 'lifestyle_premium'
  | 'ad_testimonial'
  | 'ad_feature_focus'
  | 'ad_problem_solution'
  | 'how_to_use'
  | 'influencer_showcase';

export type BudgetLevel = 'economy' | 'standard' | 'premium';

export interface VideoGenerationRequest {
  imageUrl: string;
  prompt?: string;
  duration?: number;
}

export interface VideoGenerationResponse {
  videoUrl: string;
  estimatedCost: number;
}

export interface AIProvider {
  generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
}
