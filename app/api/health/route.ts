import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ai-video-dashboard',
      database: 'connected'
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
