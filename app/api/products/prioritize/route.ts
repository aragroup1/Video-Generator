import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productIds, action } = body;

    if (action === 'flag') {
      // Flag products for video generation
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          isFlagged: true,
          flaggedAt: new Date(),
          flaggedBy: user.id,
          priority: 100, // High priority for flagged items
        },
      });
    } else if (action === 'unflag') {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          isFlagged: false,
          flaggedAt: null,
          flaggedBy: null,
          priority: 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
