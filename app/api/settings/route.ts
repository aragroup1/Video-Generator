import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  shopifyUrl: z.string().optional(),
  shopifyToken: z.string().optional(),
  replicateKey: z.string().optional(),
  lumaKey: z.string().optional(),
  runwayKey: z.string().optional(),
  pikaKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    console.log('📥 Received settings update:', body);
    
    const data = settingsSchema.parse(body);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: data.projectId },
      data: {
        name: data.name,
        shopifyUrl: data.shopifyUrl || null,
        shopifyToken: data.shopifyToken || null,
        replicateKey: data.replicateKey || null,
        lumaKey: data.lumaKey || null,
        runwayKey: data.runwayKey || null,
        pikaKey: data.pikaKey || null,
      },
    });

    console.log('✅ Settings updated successfully');

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error: any) {
    console.error('❌ Settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 400 }
    );
  }
}
