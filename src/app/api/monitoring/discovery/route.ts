// app/api/monitoring/discovery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { discoverBestMonitoringUrl } from '@/lib/monitoring/discoveryAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitionId } = body;

    if (!competitionId) {
      return NextResponse.json({ error: 'competitionId is required' }, { status: 400 });
    }

    const result = await discoverBestMonitoringUrl(competitionId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
