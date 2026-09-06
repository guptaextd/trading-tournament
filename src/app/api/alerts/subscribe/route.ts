import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const subscriber = db.addSubscriber({
      email: body.email,
      telegram_handle: body.telegram_handle,
      country: body.country || 'Global',
      min_prize: Number(body.min_prize) || 0,
      markets: body.markets || ['crypto', 'forex']
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription successful! You will receive daily tournament digests.',
      subscriber
    });
  } catch (error) {
    console.error('Error in subscription:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
