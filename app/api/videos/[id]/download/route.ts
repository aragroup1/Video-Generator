import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/storage/s3';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get video with product info
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            title: true,
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

    // Generate signed URL for download
    const downloadUrl = await getSignedDownloadUrl(video.fileUrl);
    const filename = `${video.product.title.replace(/\s+/g, '_')}_${video.videoType}_${video.id}.mp4`;

    return NextResponse.json({ downloadUrl, filename });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
