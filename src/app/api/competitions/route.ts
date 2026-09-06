import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CompetitionFilterParams } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const params: CompetitionFilterParams = {
      status: (searchParams.get('status') as any) || 'all',
      market: (searchParams.get('market') as any) || 'all',
      entry: (searchParams.get('entry') as any) || 'all',
      format: (searchParams.get('format') as any) || 'all',
      team: (searchParams.get('team') as any) || 'all',
      country: searchParams.get('country') || undefined,
      minPrize: searchParams.get('minPrize') ? Number(searchParams.get('minPrize')) : undefined,
      maxPrize: searchParams.get('maxPrize') ? Number(searchParams.get('maxPrize')) : undefined,
      search: searchParams.get('search') || undefined,
      platformId: searchParams.get('platformId') || undefined,
      beginnerOnly: searchParams.get('beginnerOnly') === 'true',
      sort: (searchParams.get('sort') as any) || 'ending_soon',
    };

    const result = db.getCompetitions(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.platform_id || !body.prize_pool || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Missing required tournament fields' }, { status: 400 });
    }

    const newComp = {
      id: `comp-${Date.now()}`,
      title: body.title,
      slug: (body.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
      platform_id: body.platform_id,
      description: body.description || '',
      prize_pool: Number(body.prize_pool),
      currency: body.currency || 'USD',
      market_type: body.market_type || 'crypto',
      entry_fee: body.entry_fee !== undefined && body.entry_fee !== null ? Number(body.entry_fee) : null,
      entry_requirements: body.entry_requirements || 'See official tournament page for rules.',
      start_date: body.start_date,
      end_date: body.end_date,
      country_eligibility: body.country_eligibility || ['Global'],
      format: body.format || 'online',
      team_type: body.team_type || 'solo',
      official_url: body.official_url,
      featured: Boolean(body.featured),
      legitimacy_score: Number(body.legitimacy_score) || 90,
      evaluation_metric: body.evaluation_metric || 'Highest Net PnL %',
      rules_summary: body.rules_summary || ['Standard trading competition terms apply.'],
      prize_breakdown: body.prize_breakdown || [
        { rank: '1st Place', reward: `${body.prize_pool} ${body.currency || 'USD'}` }
      ],
      is_beginner_friendly: Boolean(body.is_beginner_friendly),
      created_at: new Date().toISOString()
    };

    const created = db.createCompetition(newComp);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 });
  }
}
