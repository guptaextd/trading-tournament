import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = db.getCompetitionById(id);

    if (!result) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching competition:', error);
    return NextResponse.json({ error: 'Failed to fetch competition' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = db.updateCompetition(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating competition:', error);
    return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = db.deleteCompetition(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Competition deleted successfully' });
  } catch (error) {
    console.error('Error deleting competition:', error);
    return NextResponse.json({ error: 'Failed to delete competition' }, { status: 500 });
  }
}
