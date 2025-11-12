import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const user = await requireAuth();

    await prisma.videoJob.deleteMany({
      where: {
        project: { userId: user.id },
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
