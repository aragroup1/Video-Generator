import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { RunwayProvider } from '@/lib/ai-providers/runway';
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

    if (!project || !project.runwayKey) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 400 }
      );
    }

    const provider = new RunwayProvider({ apiKey: project.runwayKey });

    switch (action) {
      case 'validate':
        const isValid = await provider.validateApiKey();
        return NextResponse.json({ valid: isValid });

      case 'credits':
        const credits = await provider.getCredits();
        return NextResponse.json({ credits });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Runway API error' },
      { status: 400 }
    );
  }
}
