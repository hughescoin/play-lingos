import { NextResponse } from 'next/server';
import lingosData from '@/data/lingos.json';

export async function GET() {
  try {
    const lingos = lingosData.lingos;
    const randomIndex = Math.floor(Math.random() * lingos.length);
    const randomLingo = lingos[randomIndex];

    return NextResponse.json(randomLingo);
  } catch (error) {
    console.error('Error serving lingo:', error);
    return NextResponse.json(
      { error: 'Failed to serve lingo' },
      { status: 500 }
    );
  }
}
