import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ShopifyClient } from '@/lib/shopify/client';

const syncSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { projectId } = syncSchema.parse(body);

    // Get project with Shopify credentials
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.shopifyUrl || !project.shopifyToken) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured. Please add them in Settings first.' },
        { status: 400 }
      );
    }

    // Sync products directly
    const client = new ShopifyClient(project.shopifyUrl, project.shopifyToken);
    
    let pageInfo: string | undefined;
    let totalSynced = 0;

    do {
      const { products, pageInfo: nextPageInfo } = await client.getProducts(50, pageInfo);
      
      for (const product of products) {
        await prisma.product.upsert({
          where: {
            projectId_shopifyId: {
              projectId,
              shopifyId: product.id,
            },
          },
          update: {
            title: product.title,
            description: product.body_html,
            images: product.images.map(img => img.src),
            tags: product.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            price: product.variants[0]?.price ? parseFloat(product.variants[0].price) : null,
            lastSyncedAt: new Date(),
          },
          create: {
            projectId,
            shopifyId: product.id,
            title: product.title,
            description: product.body_html,
            images: product.images.map(img => img.src),
            category: product.product_type,
            tags: product.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            price: product.variants[0]?.price ? parseFloat(product.variants[0].price) : null,
            lastSyncedAt: new Date(),
          },
        });

        totalSynced++;
      }

      pageInfo = nextPageInfo;
    } while (pageInfo);

    return NextResponse.json({
      success: true,
      totalSynced,
      message: `Successfully synced ${totalSynced} products from Shopify`,
    });
  } catch (error: any) {
    console.error('Shopify sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync products' },
      { status: 400 }
    );
  }
}
