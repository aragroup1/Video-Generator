import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { createShopifySyncJob } from '@/lib/queue/jobs';
import prisma from '@/lib/prisma';

const syncSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { projectId } = syncSchema.parse(body);

    // Get project with Shopify credentials
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.shopifyUrl || !project.shopifyToken) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured' },
        { status: 400 }
      );
    }

    // Queue sync job
    const job = await createShopifySyncJob({
      projectId: project.id,
      shopifyUrl: project.shopifyUrl,
      accessToken: project.shopifyToken,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync products' },
      { status: 400 }
    );
  }
}
