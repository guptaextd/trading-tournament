// app/api/monitoring/flags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unresolvedOnly = searchParams.get('all') !== 'true';
    const flags = db.getParticipantFlags(unresolvedOnly);

    return NextResponse.json({
      flags,
      unresolvedCount: flags.filter(f => !f.resolved).length
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { flagId, note, applyCount } = body;

    if (!flagId) {
      return NextResponse.json({ error: 'flagId is required' }, { status: 400 });
    }

    const success = db.resolveParticipantFlag(flagId, note, Boolean(applyCount));
    if (!success) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Flag resolved successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
