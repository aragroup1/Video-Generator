import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const prioritized = searchParams.get('prioritized') === 'true';

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let products;

    if (prioritized) {
      // Get products sorted by priority
      products = await prisma.product.findMany({
        where: {
          projectId,
        },
        include: {
          _count: {
            select: {
              videos: true,
              videoJobs: true,
            },
          },
        },
        orderBy: [
          { isFlagged: 'desc' },
          { priority: 'desc' },
          { salesCount: 'desc' },
          { viewCount: 'desc' },
        ],
        take: 100, // Limit to top 100 for performance
      });
    } else {
      products = await prisma.product.findMany({
        where: {
          projectId,
        },
        include: {
          _count: {
            select: {
              videos: true,
              videoJobs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 401 }
    );
  }
}
