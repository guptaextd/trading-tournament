import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const submissions = db.getSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.submitted_by || !body.contact_email || !body.competition_data) {
      return NextResponse.json({ error: 'Missing required submission fields' }, { status: 400 });
    }

    const { triageSubmission } = await import('@/lib/triage');
    const ai_quality_note = await triageSubmission(body.competition_data);

    const newSub = db.createSubmission({
      submitted_by: body.submitted_by,
      contact_email: body.contact_email,
      competition_data: body.competition_data,
      ai_quality_note
    });

    return NextResponse.json(newSub, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
