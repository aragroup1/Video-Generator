import Replicate from 'replicate';
import { AIProvider, VideoGenerationRequest, VideoGenerationResponse, VideoStyle, BudgetLevel } from './types';

export class ReplicateProvider implements AIProvider {
  private client: Replicate;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    this.client = new Replicate({
      auth: config.apiKey,
    });
  }

  private generatePrompt(
    style: VideoStyle,
    productTitle: string,
    productDescription: string,
    budget: BudgetLevel
  ): string {
    // Generate intelligent prompts based on style
    const prompts: Record<VideoStyle, string> = {
      '360_rotation': `Professional 360 degree rotating view of ${productTitle}. Clean white studio background, smooth continuous rotation, product photography style, high quality commercial video, perfect lighting.`,
      
      'lifestyle_casual': `${productTitle} being used in everyday casual setting. Natural lighting, authentic lifestyle photography, person using the product in their daily routine, relatable and genuine atmosphere, Instagram aesthetic.`,
      
      'lifestyle_premium': `${productTitle} showcased in luxurious premium setting. Golden hour lighting, high-end lifestyle photography, elegant and sophisticated atmosphere, aspirational aesthetic, magazine-quality production.`,
      
      'ad_testimonial': `Person genuinely excited about ${productTitle}. Authentic testimonial style, direct to camera, positive emotional reaction, relatable setting, trustworthy and honest vibe, user-generated content aesthetic.`,
      
      'ad_feature_focus': `Close-up product demonstration of ${productTitle} key features. Professional product video, detailed feature showcase, clear and informative, commercial advertisement style, high production value.`,
      
      'ad_problem_solution': `${productTitle} solving a problem. Before and after demonstration, clear problem identification, product as the solution, engaging narrative, commercial advertisement style.`,
      
      'how_to_use': `Step-by-step tutorial demonstrating how to use ${productTitle}. Clear instructional style, helpful and informative, easy to follow, educational video format, friendly demonstration.`,
      
      'influencer_showcase': `Influencer-style first-person POV showcasing ${productTitle}. Authentic and casual vibe, ring light aesthetic, talking to camera, genuine excitement, social media content style, trendy and engaging.`,
    };

    return prompts[style] || prompts['lifestyle_casual'];
  }

  private selectModel(budget: BudgetLevel): string {
    // For now, use Sora 2 for all tiers
    // You can differentiate later with different settings or models
    return 'openai/sora-2';
  }

  private getAspectRatio(style: VideoStyle): string {
    // Different aspect ratios for different styles
    const aspectRatios: Record<VideoStyle, string> = {
      '360_rotation': 'square',
      'lifestyle_casual': 'landscape',
      'lifestyle_premium': 'landscape',
      'ad_testimonial': 'portrait',
      'ad_feature_focus': 'square',
      'ad_problem_solution': 'landscape',
      'how_to_use': 'landscape',
      'influencer_showcase': 'portrait',
    };

    return aspectRatios[style] || 'landscape';
  }

  async generateVideo(request: VideoGenerationRequest & {
    style: VideoStyle;
    budget: BudgetLevel;
    productTitle: string;
    productDescription: string;
  }): Promise<VideoGenerationResponse> {
    try {
      const model = this.selectModel(request.budget);
      const prompt = this.generatePrompt(
        request.style,
        request.productTitle,
        request.productDescription,
        request.budget
      );
      const aspectRatio = this.getAspectRatio(request.style);

      console.log('🎬 Starting Sora 2 video generation...');
      console.log('📦 Model:', model);
      console.log('🖼️ Image URL:', request.imageUrl);
      console.log('📝 Prompt:', prompt);
      console.log('🎨 Style:', request.style);
      console.log('💰 Budget:', request.budget);
      console.log('📐 Aspect Ratio:', aspectRatio);

      const output = await this.client.run(model as any, {
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
          input_reference: request.imageUrl,
        },
      });

      console.log('✅ Video generated successfully');
      console.log('📹 Output:', output);

      // Extract video URL from output
      let videoUrl: string;
      if (typeof output === 'object' && output !== null && 'url' in output) {
        videoUrl = (output as any).url();
      } else if (Array.isArray(output)) {
        videoUrl = output[0];
      } else {
        videoUrl = output as string;
      }

      return {
        videoUrl: videoUrl,
        estimatedCost: this.calculateCost(request.budget),
      };
    } catch (error: any) {
      console.error('❌ Sora 2 generation failed:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  private calculateCost(budget: BudgetLevel): number {
    // Sora 2 pricing (estimate based on Replicate pricing)
    const costs: Record<BudgetLevel, number> = {
      economy: 2.50,   // Shorter, lower quality
      standard: 5.00,  // Standard quality
      premium: 10.00,  // Highest quality, longer
    };
    return costs[budget];
  }
}
