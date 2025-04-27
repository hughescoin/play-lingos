import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { decodeAbiParameters } from 'viem';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log the incoming webhook payload for debugging
    console.log('Received webhook payload:', JSON.stringify(body, null, 2));

    // Validate the webhook payload structure
    if (
      !body ||
      !body.block ||
      !Array.isArray(body.block.logs) ||
      body.block.logs.length === 0
    ) {
      console.error('Invalid webhook payload structure:', body);
      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 }
      );
    }

    const log = body.block.logs[0];

    // Validate log structure
    if (!log.data || !log.topics || log.topics.length < 2) {
      console.error('Invalid log structure:', log);
      return NextResponse.json(
        { error: 'Invalid log structure' },
        { status: 400 }
      );
    }

    // 1) Decode the single uint256 "score" from log.data (hex)
    const [scoreBigInt] = decodeAbiParameters(
      [{ type: 'uint256', name: 'score' }],
      log.data as `0x${string}`
    );
    const score = Number(scoreBigInt);

    // 2) Extract player address from topics[1]
    //    topics[1] is zero-padded 32 bytes: strip leading zeros
    const topic1 = log.topics[1] as string;
    const player = `0x${topic1.slice(26)}`;

    // 3) Upsert into a Redis sorted set called "leaderboard"
    await redis.zadd('leaderboard', { score, member: player });

    return NextResponse.json({ ok: true });
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
