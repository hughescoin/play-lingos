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
    // Alchemy wraps logs under `body.block.logs`
    const log = body.block.logs[0];

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
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
