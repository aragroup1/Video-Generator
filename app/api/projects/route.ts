import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  shopifyUrl: z.string().optional(),
  shopifyToken: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            products: true,
            videos: true,
            videoJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 400 }
    );
  }
}
