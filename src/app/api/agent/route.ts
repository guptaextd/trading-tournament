// app/api/agent/route.ts
import { NextRequest } from 'next/server';
import { handleAgentQuery } from '@/lib/agent';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, history } = body;

  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
  const allowed = await rateLimit(identifier, { max: 20, windowMs: 60 * 60 * 1000 }); // 20/hour
  if (!allowed) {
    return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  if (!message || typeof message !== 'string' || message.length > 500) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }

  try {
    const result = await handleAgentQuery(message, history || []);
    return Response.json(result);
  } catch (err) {
    console.error("Agent error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
