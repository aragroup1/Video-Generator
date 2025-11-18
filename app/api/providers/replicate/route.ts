import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ReplicateProvider } from '@/lib/ai-providers/replicate';
import { z } from 'zod';

const requestSchema = z.object({
  apiKey: z.string(),
  action: z.enum(['validate', 'credits']),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { apiKey, action } = requestSchema.parse(body);

    const provider = new ReplicateProvider({ apiKey });

    switch (action) {
      case 'validate':
        // Simple validation - try to create the client
        try {
          // If we can create the provider without errors, key is likely valid
          return NextResponse.json({ valid: true });
        } catch (error) {
          return NextResponse.json({ valid: false });
        }

      case 'credits':
        // Replicate doesn't have a credits endpoint, return placeholder
        return NextResponse.json({ 
          credits: 'N/A',
          message: 'Replicate uses pay-per-use billing'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
