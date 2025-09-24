import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Set up SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        // Send initial status
        const job = await prisma.videoJob.findFirst({
          where: {
            id: id,
            project: {
              userId: user.id,
            },
          },
        });

        if (!job) {
          sendEvent({ error: 'Job not found' });
          controller.close();
          return;
        }

        sendEvent({
          status: job.status,
          progress: job.progress,
          errorMessage: job.errorMessage,
        });

        // Poll for updates
        const interval = setInterval(async () => {
          const updatedJob = await prisma.videoJob.findUnique({
            where: { id: id },
          });

          if (!updatedJob) {
            clearInterval(interval);
            controller.close();
            return;
          }

          sendEvent({
            status: updatedJob.status,
            progress: updatedJob.progress,
            resultUrl: updatedJob.resultUrl,
            errorMessage: updatedJob.errorMessage,
          });

          if (
            updatedJob.status === 'COMPLETED' ||
            updatedJob.status === 'FAILED'
          ) {
            clearInterval(interval);
            controller.close();
          }
        }, 2000);

        // Clean up on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get progress' },
      { status: 401 }
    );
  }
}
