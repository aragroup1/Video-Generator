import { NextResponse } from 'next/response';
import { videoQueue } from '@/lib/queue';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    if (!videoQueue) {
      return NextResponse.json({ 
        error: 'Queue not available',
        redis: false 
      });
    }

    const [waiting, active, completed, failed] = await Promise.all([
      videoQueue.getWaitingCount(),
      videoQueue.getActiveCount(),
      videoQueue.getCompletedCount(),
      videoQueue.getFailedCount(),
    ]);

    return NextResponse.json({
      redis: true,
      queue: {
        waiting,
        active,
        completed,
        failed,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
