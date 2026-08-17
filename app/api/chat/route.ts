import { NextResponse } from 'next/server';

const CANNED_RESPONSES: Record<string, string> = {
  code: '<p>Here\'s an implementation plan:</p><ol><li>Set up project architecture.</li><li>Create TypeScript interfaces for domain entities.</li><li>Build component layer with Tailwind.</li><li>Wire up Zustand state management.</li></ol>',
  comparison: '<p>Comparing options side by side: key differences are in <b>latency</b>, <b>throughput</b>, and <b>pricing</b>.</p>',
  fallback: '<p>Great question! Let me break this down step-by-step for you. Based on the context provided, starting simple and iterating is the best approach.</p>',
};

function pickResponse(prompt: string): string {
  const lower = (prompt || '').toLowerCase();
  if (lower.includes('code') || lower.includes('build') || lower.includes('implement'))
    return CANNED_RESPONSES.code;
  if (lower.includes('compare') || lower.includes('difference') || lower.includes('vs'))
    return CANNED_RESPONSES.comparison;
  return CANNED_RESPONSES.fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model } = body;

    if (!model) {
      return NextResponse.json({ error: 'Missing required field: model' }, { status: 400 });
    }

    // Simulate API latency
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 300));

    return NextResponse.json({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'assistant',
      model,
      content: pickResponse(prompt || ''),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
