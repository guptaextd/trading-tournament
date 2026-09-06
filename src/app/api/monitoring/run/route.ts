// app/api/monitoring/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runMonitoringPipeline } from '@/lib/monitoring/scheduler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const competitionId = body.competitionId || undefined;

    const summary = await runMonitoringPipeline(competitionId);
    return NextResponse.json(summary);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('competitionId') || undefined;

    const summary = await runMonitoringPipeline(competitionId);
    return NextResponse.json(summary);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
