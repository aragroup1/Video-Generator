import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { LumaProvider } from '@/lib/ai-providers/luma';
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

    if (!project || !project.lumaKey) {
      return NextResponse.json(
        { error: 'Luma API key not configured' },
        { status: 400 }
      );
    }

    const provider = new LumaProvider({ apiKey: project.lumaKey });

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
      { error: error.message || 'Luma API error' },
      { status: 400 }
    );
  }
}
