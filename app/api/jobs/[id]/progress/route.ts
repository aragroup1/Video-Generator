import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        const job = await prisma.videoJob.findUnique({
          where: { id },
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

        const interval = setInterval(async () => {
          const updatedJob = await prisma.videoJob.findUnique({
            where: { id },
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
      { status: 500 }
    );
  }
}
