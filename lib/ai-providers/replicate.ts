import Replicate from 'replicate';
import { AIProvider, VideoGenerationRequest, VideoGenerationResponse, VideoStyle, BudgetLevel } from './types';

type AIModel = 'sora-2' | 'veo-3.1';

export class ReplicateProvider implements AIProvider {
  private client: Replicate;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    this.client = new Replicate({
      auth: config.apiKey,
    });
  }

  private selectModel(budget: BudgetLevel, preferredModel?: AIModel): { model: string; type: AIModel } {
    // If no preference, use Veo for economy/standard, Sora for premium
    if (!preferredModel) {
      const defaultMap: Record<BudgetLevel, { model: string; type: AIModel }> = {
        economy: { model: 'google/veo-3.1', type: 'veo-3.1' },
        standard: { model: 'google/veo-3.1', type: 'veo-3.1' },
        premium: { model: 'openai/sora-2', type: 'sora-2' },
      };
      return defaultMap[budget];
    }

    // Allow both models for all tiers
    const models: Record<AIModel, string> = {
      'veo-3.1': 'google/veo-3.1',
      'sora-2': 'openai/sora-2',
    };

    return { model: models[preferredModel], type: preferredModel };
  }

  private generatePrompt(
    style: VideoStyle,
    productTitle: string,
    productDescription: string,
    budget: BudgetLevel
  ): string {
    const prompts: Record<VideoStyle, string> = {
      '360_rotation': `Professional 360 degree smooth rotation of ${productTitle}. Clean white studio background, seamless continuous rotation showing all angles, premium product photography style, studio lighting, commercial video quality. The product rotates smoothly from front to back showing every detail.`,
      
      'lifestyle_casual': `${productTitle} being used naturally in everyday casual setting. Natural daylight, authentic lifestyle moment, person casually using the product in their daily routine, relatable and genuine atmosphere, warm and inviting mood, Instagram lifestyle aesthetic.`,
      
      'lifestyle_premium': `${productTitle} elegantly showcased in luxurious premium setting. Golden hour lighting, high-end sophisticated lifestyle, beautiful upscale environment, aspirational and elegant atmosphere, magazine editorial quality, refined and tasteful presentation.`,
      
      'ad_testimonial': `Person authentically sharing their positive experience with ${productTitle}. Natural setting, genuine emotion and excitement, speaking directly to viewer, trustworthy and relatable presentation, warm and friendly atmosphere, user testimonial style.`,
      
      'ad_feature_focus': `Professional close-up demonstration of ${productTitle} showcasing key features and details. Clean commercial presentation, clear feature highlights, detailed product view, informative and engaging, high production value, advertisement quality.`,
      
      'ad_problem_solution': `Visual story showing ${productTitle} solving a problem. Clear before and after sequence, problem identification to solution, engaging narrative flow, relatable scenario, commercial advertisement style, satisfying resolution.`,
      
      'how_to_use': `Clear step-by-step tutorial demonstrating ${productTitle} in use. Easy to follow instructions, helpful and informative presentation, hands demonstrating usage, educational video format, friendly instructional style, good lighting and clarity.`,
      
      'influencer_showcase': `Authentic influencer-style POV showcasing ${productTitle}. First-person perspective, natural and casual vibe, ring light aesthetic, speaking to camera with genuine enthusiasm, social media content style, trendy and engaging, relatable presentation.`,
    };

    return prompts[style] || prompts['lifestyle_casual'];
  }

  private getAspectRatio(style: VideoStyle): string {
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
    preferredModel?: AIModel;
  }): Promise<VideoGenerationResponse> {
    try {
      const { model, type } = this.selectModel(request.budget, request.preferredModel);
      const prompt = this.generatePrompt(
        request.style,
        request.productTitle,
        request.productDescription,
        request.budget
      );
      const aspectRatio = this.getAspectRatio(request.style);

      console.log('🎬 Starting AI video generation...');
      console.log('📦 Model:', model, `(${type})`);
      console.log('🖼️ Image URL:', request.imageUrl);
      console.log('📝 Prompt:', prompt);
      console.log('🎨 Style:', request.style);
      console.log('💰 Budget:', request.budget);
      console.log('📐 Aspect Ratio:', aspectRatio);

      let output;

      if (type === 'veo-3.1') {
        // Veo 3.1 uses reference_images
        output = await this.client.run(model as any, {
          input: {
            prompt: prompt,
            reference_images: [request.imageUrl],
          },
        });
      } else if (type === 'sora-2') {
        // Sora 2 uses input_reference
        output = await this.client.run(model as any, {
          input: {
            prompt: prompt,
            aspect_ratio: aspectRatio,
            input_reference: request.imageUrl,
          },
        });
      }

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
        estimatedCost: this.calculateCost(request.budget, type),
      };
    } catch (error: any) {
      console.error('❌ Video generation failed:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  private calculateCost(budget: BudgetLevel, model: AIModel): number {
    // Pricing for both models at all tiers
    const costs: Record<AIModel, Record<BudgetLevel, number>> = {
      'veo-3.1': {
        economy: 1.00,    // Veo economy
        standard: 2.50,   // Veo standard
        premium: 5.00,    // Veo premium
      },
      'sora-2': {
        economy: 3.00,    // Sora economy
        standard: 6.00,   // Sora standard
        premium: 12.00,   // Sora premium
      },
    };

    return costs[model][budget];
  }
}
