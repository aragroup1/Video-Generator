import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { VideoStyle, BudgetLevel, ReplicateProvider } from '@/lib/ai-providers/replicate';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { productCount, styles, budget } = body;

    if (!productCount || !styles || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a temporary provider instance just for cost estimation
    const provider = new ReplicateProvider({ apiKey: 'temp' });
    
    let totalCost = 0;
    const duration = 5; // Default duration

    for (const style of styles) {
      const costPerVideo = provider.estimateCost(style as VideoStyle, budget as BudgetLevel, duration);
      totalCost += costPerVideo * productCount;
    }

    return NextResponse.json({ 
      estimatedCost: totalCost,
      breakdown: {
        productCount,
        stylesCount: styles.length,
        totalVideos: productCount * styles.length,
        avgCostPerVideo: totalCost / (productCount * styles.length)
      }
    });
  } catch (error: any) {
    console.error('Cost estimation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to estimate cost' },
      { status: 400 }
    );
  }
}
