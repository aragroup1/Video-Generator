// Add to your existing schema.prisma

model Product {
  // ... existing fields ...
  
  // Priority fields
  isFlagged     Boolean   @default(false) @map("is_flagged")  // Custom flagged for video generation
  flaggedAt     DateTime? @map("flagged_at")
  flaggedBy     String?   @map("flagged_by")
  priority      Int       @default(0)  // Higher number = higher priority
  
  // Traffic and performance
  viewCount     Int       @default(0) @map("view_count")
  salesCount    Int       @default(0) @map("sales_count")
  lastSyncedAt  DateTime? @map("last_synced_at")
  
  // Video generation tracking
  lastVideoGeneratedAt DateTime? @map("last_video_generated_at")
  videoGenerationCount Int @default(0) @map("video_generation_count")
}

// New table for tracking product metrics
model ProductMetrics {
  id          String   @id @default(cuid())
  productId   String   @map("product_id")
  date        DateTime @db.Date
  views       Int      @default(0)
  sales       Int      @default(0)
  revenue     Decimal  @db.Decimal(10, 2)
  
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([productId, date])
  @@index([productId])
  @@index([date])
  @@map("product_metrics")
}

// API endpoint: /api/products/prioritize
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { productIds, action } = await request.json();

    if (action === 'flag') {
      // Flag products for video generation
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          isFlagged: true,
          flaggedAt: new Date(),
          priority: 100, // High priority for flagged items
        },
      });
    } else if (action === 'unflag') {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          isFlagged: false,
          flaggedAt: null,
          priority: 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// API endpoint: /api/products/sync-metrics
export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    // Sync with Shopify Analytics
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project?.shopifyToken) {
      throw new Error('Shopify not configured');
    }

    // Fetch analytics from Shopify
    const analytics = await fetchShopifyAnalytics(project.shopifyUrl!, project.shopifyToken);

    // Update product metrics
    for (const item of analytics) {
      await prisma.product.update({
        where: {
          projectId_shopifyId: {
            projectId,
            shopifyId: item.productId,
          },
        },
        data: {
          viewCount: item.views,
          salesCount: item.sales,
          lastSyncedAt: new Date(),
          priority: calculatePriority(item),
        },
      });

      // Store daily metrics
      await prisma.productMetrics.upsert({
        where: {
          productId_date: {
            productId: item.productId,
            date: new Date(),
          },
        },
        update: {
          views: item.views,
          sales: item.sales,
          revenue: item.revenue,
        },
        create: {
          productId: item.productId,
          date: new Date(),
          views: item.views,
          sales: item.sales,
          revenue: item.revenue,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

function calculatePriority(metrics: any): number {
  // Priority algorithm based on:
  // - Sales volume (40%)
  // - Traffic (30%)
  // - Conversion rate (30%)
  
  const salesScore = Math.min(metrics.sales / 10, 10) * 4;
  const trafficScore = Math.min(metrics.views / 100, 10) * 3;
  const conversionScore = metrics.views > 0 
    ? Math.min((metrics.sales / metrics.views) * 100, 10) * 3
    : 0;

  return Math.round(salesScore + trafficScore + conversionScore);
}
