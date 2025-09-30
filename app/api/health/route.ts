import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const checks: any = {
      database: 'unknown',
      redis: 'unknown',
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'healthy';
    } catch (error: any) {
      checks.database = 'unhealthy';
      checks.databaseError = error.message;
    }
    
    // Check Redis connection (optional)
    try {
      if (process.env.REDIS_URL) {
        await redis.ping();
        checks.redis = 'healthy';
      } else {
        checks.redis = 'not configured';
      }
    } catch (error: any) {
      checks.redis = 'unhealthy';
      checks.redisError = error.message;
    }

    const isHealthy = checks.database === 'healthy';

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
