import { NextRequest, NextResponse } from 'next/server';
//import { Redis } from '@upstash/redis';
// import { decodeAbiParameters } from 'viem';

// // Initialize Upstash Redis client
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

export async function POST(req: NextRequest) {
  try {
    // Log the raw request
    console.log(
      'Raw request headers:',
      Object.fromEntries(req.headers.entries())
    );

    const body = await req.json();
    console.log('Raw request body:', JSON.stringify(body, null, 2));

    // For now, just return success without processing
    return NextResponse.json({ ok: true, received: true });
  } catch (err) {
    console.error('❌ /api/events/highscore error:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
