import axios from 'axios';
import Replicate from 'replicate';
import { AIProvider, AIProviderConfig, VideoGenerationRequest, VideoGenerationResponse } from './types';

interface ReplicateModel {
  name: string;
  version: string;
  costPerSecond: number; // in cents
  quality: 'economy' | 'standard' | 'premium';
  bestFor: VideoStyle[];
}

export enum VideoStyle {
  ROTATION_360 = "360_rotation",
  LIFESTYLE_CASUAL = "lifestyle_casual",
  LIFESTYLE_PREMIUM = "lifestyle_premium",
  AD_TESTIMONIAL = "ad_testimonial",
  AD_FEATURE_FOCUS = "ad_feature_focus",
  AD_PROBLEM_SOLUTION = "ad_problem_solution",
  HOW_TO_USE = "how_to_use",
  INFLUENCER_SHOWCASE = "influencer_showcase"  // ADD THIS
}

export enum BudgetLevel {
  ECONOMY = 'economy',    // $0.01-0.05 per video
  STANDARD = 'standard',  // $0.05-0.15 per video
  PREMIUM = 'premium'     // $0.15-0.50 per video
}

const REPLICATE_MODELS: ReplicateModel[] = [
  {
    name: 'stable-video-diffusion',
    version: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    costPerSecond: 0.5,
    quality: 'standard',
    bestFor: [VideoStyle.ROTATION_360, VideoStyle.HOW_TO_USE, VideoStyle.INFLUENCER_SHOWCASE]
  },
  {
    name: 'animatediff',
    version: 'lucataco/animatediff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
    costPerSecond: 0.3,
    quality: 'economy',
    bestFor: [VideoStyle.ROTATION_360, VideoStyle.LIFESTYLE_CASUAL]
  },
  {
    name: 'cogvideox',
    version: 'THUDM/CogVideoX-5b:70cd3c7e0d3a34e88e709e0297cbd9c6be1cf68f3f263f0c71df1c4e5ea3a6c8',
    costPerSecond: 1.2,
    quality: 'premium',
    bestFor: [VideoStyle.LIFESTYLE_PREMIUM, VideoStyle.AD_TESTIMONIAL, VideoStyle.AD_FEATURE_FOCUS]
  },
  {
    name: 'i2vgen-xl',
    version: 'ali-vilab/i2vgen-xl:5821a338d00033abaaba89080a17eb8783d9a17ed710a6b4246a18e0900ccad4',
    costPerSecond: 0.8,
    quality: 'standard',
    bestFor: [VideoStyle.AD_PROBLEM_SOLUTION, VideoStyle.LIFESTYLE_CASUAL]
  },
  {
    name: 'zeroscope-v2',
    version: 'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
    costPerSecond: 0.2,
    quality: 'economy',
    bestFor: [VideoStyle.ROTATION_360, VideoStyle.HOW_TO_USE]
  }
];

export class ReplicateProvider implements AIProvider {
  private client: Replicate;
  private apiKey: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.client = new Replicate({
      auth: config.apiKey,
    });
  }

  selectBestModel(
    style: VideoStyle,
    budget: BudgetLevel,
    duration: number = 5
  ): ReplicateModel {
    // Filter models by budget constraints
    const maxCostPerVideo = this.getBudgetLimit(budget);
    const affordableModels = REPLICATE_MODELS.filter(
      model => (model.costPerSecond * duration) / 100 <= maxCostPerVideo
    );

    // Find models that are good for this style
    const styleMatches = affordableModels.filter(
      model => model.bestFor.includes(style)
    );

    // If we have style matches, pick the highest quality one
    if (styleMatches.length > 0) {
      return styleMatches.sort((a, b) => b.costPerSecond - a.costPerSecond)[0];
    }

    // Otherwise, pick the best quality model within budget
    return affordableModels.sort((a, b) => b.costPerSecond - a.costPerSecond)[0] || REPLICATE_MODELS[0];
  }

  private getBudgetLimit(budget: BudgetLevel): number {
    switch (budget) {
      case BudgetLevel.ECONOMY:
        return 0.05;
      case BudgetLevel.STANDARD:
        return 0.15;
      case BudgetLevel.PREMIUM:
        return 0.50;
      default:
        return 0.15;
    }
  }

  async generateVideo(request: VideoGenerationRequest & { 
    style: VideoStyle; 
    budget: BudgetLevel;
    productTitle: string;
    productDescription: string;
  }): Promise<VideoGenerationResponse> {
    try {
      const model = this.selectBestModel(
        request.style,
        request.budget,
        request.duration
      );

      // Generate intelligent prompt based on style and product info
      const prompt = this.generatePrompt(
        request.style,
        request.productTitle,
        request.productDescription,
        request.prompt
      );

      const input = {
        image: request.imageUrl,
        prompt: prompt,
        num_frames: (request.duration || 5) * 24, // 24 fps
        num_inference_steps: request.budget === BudgetLevel.PREMIUM ? 50 : 25,
        guidance_scale: 7.5,
        fps: 24,
        seed: Math.floor(Math.random() * 1000000)
      };

      const output = await this.client.run(model.version as `${string}/${string}:${string}`, { input });

      // Extract the video URL from the output
      const videoUrl = Array.isArray(output) ? output[0] : output;

      return {
        jobId: `replicate_${Date.now()}`,
        status: 'completed',
        progress: 100,
        resultUrl: videoUrl as string,
        metadata: {
          model: model.name,
          cost: (model.costPerSecond * request.duration!) / 100,
          prompt: prompt
        }
      };
    } catch (error: any) {
      console.error('Replicate generation error:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  private generatePrompt(
  style: VideoStyle,
  productTitle: string,
  productDescription: string,
  customPrompt?: string
): string {
  if (customPrompt) return customPrompt;

  const stylePrompts: Record<VideoStyle, string> = {
    [VideoStyle.ROTATION_360]: `360 degree rotation of ${productTitle}, smooth camera movement, professional product photography, studio lighting, white background`,
    
    [VideoStyle.LIFESTYLE_CASUAL]: `${productTitle} in everyday use, natural lighting, casual setting, relatable lifestyle scene, ${productDescription}`,
    
    [VideoStyle.LIFESTYLE_PREMIUM]: `Luxury lifestyle featuring ${productTitle}, elegant setting, sophisticated atmosphere, high-end production, ${productDescription}`,
    
    [VideoStyle.AD_TESTIMONIAL]: `Customer happily using ${productTitle}, genuine emotional response, testimonial style, warm lighting, ${productDescription}`,
    
    [VideoStyle.AD_FEATURE_FOCUS]: `Cinematic close-up highlighting features of ${productTitle}, dramatic lighting, professional advertisement style, ${productDescription}`,
    
    [VideoStyle.AD_PROBLEM_SOLUTION]: `Before and after transformation using ${productTitle}, problem-solving demonstration, clear visual narrative, ${productDescription}`,
    
    [VideoStyle.HOW_TO_USE]: `Step-by-step demonstration of ${productTitle}, clear instructional visuals, hands showing usage, ${productDescription}`,  // ADD COMMA HERE
    
    [VideoStyle.INFLUENCER_SHOWCASE]: `Influencer-style showcase of ${productTitle}, authentic presentation, engaging personality, lifestyle integration, ${productDescription}`,
  };

  return stylePrompts[style] || `Professional showcase of ${productTitle}, ${productDescription}`;
}

  async checkStatus(jobId: string): Promise<VideoGenerationResponse> {
    // Replicate typically returns immediately with a URL
    // This is mainly for compatibility with the interface
    return {
      jobId,
      status: 'completed',
      progress: 100,
    };
  }

  async downloadVideo(videoUrl: string): Promise<Buffer> {
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  async getCredits(): Promise<number> {
    // Replicate doesn't have a credits system, return budget remaining if needed
    return 1000;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  // Get estimated cost for a video generation
  estimateCost(style: VideoStyle, budget: BudgetLevel, duration: number = 5): number {
    const model = this.selectBestModel(style, budget, duration);
    return (model.costPerSecond * duration) / 100;
  }

  // Get available models for a given budget
  getAvailableModels(budget: BudgetLevel, duration: number = 5): ReplicateModel[] {
    const maxCost = this.getBudgetLimit(budget);
    return REPLICATE_MODELS.filter(
      model => (model.costPerSecond * duration) / 100 <= maxCost
    );
  }
}
