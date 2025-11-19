interface ProductInfo {
  title: string;
  description: string;
  category?: string;
}

interface ScriptOptions {
  style: string;
  duration: number; // in seconds
  productInfo: ProductInfo;
}

interface VoiceSelection {
  gender: 'female' | 'male';
  age: 'young' | 'professional' | 'mature';
  reason: string;
}

export class ScriptGenerator {
  
  // Analyze product to determine best voice
  static analyzeProductForVoice(productInfo: ProductInfo): VoiceSelection {
    const text = `${productInfo.title} ${productInfo.description || ''}`.toLowerCase();
    
    // Female-targeted keywords
    const femaleKeywords = [
      'women', 'woman', 'ladies', 'girl', 'beauty', 'makeup', 'skincare', 
      'dress', 'jewelry', 'handbag', 'purse', 'bra', 'lingerie', 'nail',
      'hair', 'fashion', 'baby', 'mom', 'mother', 'maternity'
    ];
    
    // Male-targeted keywords
    const maleKeywords = [
      'men', 'man', 'guy', 'beard', 'shaving', 'razor', 'tool', 'gaming',
      'sports', 'workout', 'protein', 'muscle', 'dad', 'father', 'cologne'
    ];

    // Check for gender-specific keywords
    const hasFemaleKeywords = femaleKeywords.some(kw => text.includes(kw));
    const hasMaleKeywords = maleKeywords.some(kw => text.includes(kw));

    let gender: 'female' | 'male';
    let reason: string;

    if (hasFemaleKeywords && !hasMaleKeywords) {
      gender = 'female';
      reason = 'Product is targeted towards women';
    } else if (hasMaleKeywords && !hasFemaleKeywords) {
      gender = 'male';
      reason = 'Product is targeted towards men';
    } else {
      // Neutral or both - use female (better engagement on social)
      gender = 'female';
      reason = 'Neutral product - female voice converts better on social media';
    }

    // Determine age based on product category
    let age: 'young' | 'professional' | 'mature' = 'professional';
    
    if (text.includes('teen') || text.includes('trending') || text.includes('tiktok')) {
      age = 'young';
    } else if (text.includes('luxury') || text.includes('premium') || text.includes('parent')) {
      age = 'mature';
    }

    return { gender, age, reason };
  }

  // Generate TikTok/Instagram-style script
  static generateScript(options: ScriptOptions): string {
    const { style, duration, productInfo } = options;
    const { title, description } = productInfo;

    // Calculate word count (avg 150 words per minute, adjusted for pauses)
    const wordCount = Math.floor((duration / 60) * 130);

    const scripts: Record<string, (title: string, desc: string, words: number) => string> = {
      
      'ad_testimonial': (t, d, w) => {
        if (w < 20) {
          return `Oh my god, you NEED this! ${t} literally changed everything. Best purchase ever!`;
        }
        return `Okay so I've been using ${t} for a week now and I'm obsessed! ${this.extractBenefit(d)} The quality is amazing and it's so worth it. If you've been thinking about getting one, this is your sign. Trust me, you won't regret it!`;
      },

      'influencer_showcase': (t, d, w) => {
        if (w < 20) {
          return `Wait, you haven't seen ${t} yet? Let me show you why everyone's obsessed!`;
        }
        return `Alright so everyone's been asking me about this, and yes, ${t} is totally worth the hype! ${this.extractBenefit(d)} I've been using it nonstop and honestly can't imagine going back. Link is in my bio if you want to check it out!`;
      },

      'ad_feature_focus': (t, d, w) => {
        if (w < 20) {
          return `Three things that make ${t} incredible: ${this.extractFeatures(d, 3)}`;
        }
        return `Let me show you what makes ${t} so special. ${this.extractFeatures(d, 3)} Plus, ${this.extractBenefit(d)} It's actually genius how well-designed this is!`;
      },

      'ad_problem_solution': (t, d, w) => {
        if (w < 20) {
          return `Struggling with this? ${t} solves it perfectly. Here's how it works!`;
        }
        return `If you've ever dealt with this problem, you need to see this! ${t} completely fixes it. ${this.extractBenefit(d)} Honestly wish I'd found this sooner. Game changer!`;
      },

      'how_to_use': (t, d, w) => {
        if (w < 20) {
          return `Here's how to use ${t} the right way. Super easy, watch this!`;
        }
        return `Okay so here's exactly how you use ${t}. First, ${this.extractStep(d, 1)} Then ${this.extractStep(d, 2)} And that's it! Way easier than you'd think. Let me know if you have questions!`;
      },

      'lifestyle_casual': (t, d, w) => {
        return `Just me and my ${t} having the best day! ${this.extractBenefit(d)}`;
      },

      'lifestyle_premium': (t, d, w) => {
        return `Elevate your lifestyle with ${t}. ${this.extractBenefit(d)} Pure luxury, pure quality.`;
      },

      '360_rotation': (t, d, w) => {
        return ''; // No audio needed for 360
      },
    };

    const scriptGenerator = scripts[style] || scripts['ad_testimonial'];
    return scriptGenerator(title, description || '', wordCount);
  }

  private static extractBenefit(description: string): string {
    // Simple extraction - in production, use AI to analyze
    if (!description) return 'It works amazing and you\'ll love it!';
    
    const benefits = [
      'makes life so much easier',
      'saves you tons of time',
      'actually works like they say',
      'feels so premium and high quality',
      'everyone compliments it',
    ];
    
    return benefits[Math.floor(Math.random() * benefits.length)];
  }

  private static extractFeatures(description: string, count: number): string {
    const features = [
      'the design is sleek',
      'it\'s super durable',
      'the quality is insane',
    ];
    
    return features.slice(0, count).join(', ');
  }

  private static extractStep(description: string, step: number): string {
    const steps = [
      'get it set up',
      'start using it',
      'see the results',
    ];
    
    return steps[step - 1] || 'follow the instructions';
  }
}
