import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { VideoStyle, BudgetLevel } from '@/lib/ai-providers/types';
import { ReplicateProvider } from '@/lib/ai-providers/replicate';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    // ... rest of the code
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
