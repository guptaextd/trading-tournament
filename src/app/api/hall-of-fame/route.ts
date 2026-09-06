import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const hallOfFame = db.getHallOfFame();
    return NextResponse.json(hallOfFame);
  } catch (error) {
    console.error('Error fetching Hall of Fame:', error);
    return NextResponse.json({ error: 'Failed to fetch Hall of Fame' }, { status: 500 });
  }
}
