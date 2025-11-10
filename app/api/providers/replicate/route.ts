import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ReplicateProvider } from '@/lib/ai-providers/replicate';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { projectId, action, data } = body;

    // Get project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project || !project.replicateKey) {
      return NextResponse.json(
        { error: 'Replicate API key not configured' },
        { status: 400 }
      );
    }

    const provider = new ReplicateProvider({ apiKey: project.replicateKey });

    switch (action) {
      case 'validate':
        const isValid = await provider.validateApiKey();
        return NextResponse.json({ valid: isValid });

      case 'credits':
        const credits = await provider.getCredits();
        return NextResponse.json({ credits });

      case 'estimate':
        const { style, budget, duration = 5 } = data;
        const cost = provider.estimateCost(style, budget, duration);
        return NextResponse.json({ estimatedCost: cost });

      case 'models':
        const { budget: modelBudget, duration: modelDuration = 5 } = data;
        const models = provider.getAvailableModels(modelBudget, modelDuration);
        return NextResponse.json({ models });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Replicate API error' },
      { status: 400 }
    );
  }
}
