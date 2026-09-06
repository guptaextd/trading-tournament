import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') as any) || 'all';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const search = searchParams.get('search') || undefined;

    const platforms = db.getPlatforms({ type, verifiedOnly, search });
    return NextResponse.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}
