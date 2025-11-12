import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// In-memory flag for system pause (in production, use Redis)
let systemPaused = false;

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    
    systemPaused = body.paused;

    return NextResponse.json({ 
      success: true, 
      paused: systemPaused 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await requireAuth();
    
    return NextResponse.json({ 
      paused: systemPaused 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
