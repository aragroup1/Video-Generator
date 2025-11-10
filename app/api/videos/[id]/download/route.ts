
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/storage/s3';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const video = await prisma.video.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Extract S3 key from fileUrl
    const url = new URL(video.fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    // Generate signed URL for download
    const downloadUrl = await getSignedDownloadUrl(key, 3600);
    const filename = `${video.product.title.replace(/\s+/g, '_')}_${video.videoType}_${video.id}.mp4`;

    return NextResponse.json({ downloadUrl, filename });
  } catch (error: any) {
    console.error('Download URL generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
