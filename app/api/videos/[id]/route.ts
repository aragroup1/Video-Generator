import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { deleteFile } from '@/lib/storage/s3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const video = await prisma.video.findFirst({
      where: {
        id: id,
        project: {
          userId: user.id,
        },
      },
      include: {
        product: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video' },
      { status: 401 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const video = await prisma.video.findFirst({
      where: {
        id: id,
        project: {
          userId: user.id,
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete from S3
    if (video.fileUrl) {
      const key = video.fileUrl.split('/').pop();
      if (key) {
        await deleteFile(`videos/${video.projectId}/${key}`);
      }
    }

    if (video.thumbnailUrl) {
      const thumbKey = video.thumbnailUrl.split('/').pop();
      if (thumbKey) {
        await deleteFile(`thumbnails/${video.projectId}/${thumbKey}`);
      }
    }

    // Delete from database
    await prisma.video.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 400 }
    );
  }
}
