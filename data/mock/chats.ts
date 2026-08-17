import { Chat } from '../../types';

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat_1',
    title: 'Plan a product launch timeline',
    model: 'claude-sonnet',
    pinned: true,
    createdAt: new Date('2026-07-10').toISOString(),
    messages: [
      { id: 'm1', role: 'user', content: 'Help me plan a 6-week product launch timeline.' },
      {
        id: 'm2',
        role: 'assistant',
        model: 'claude-sonnet',
        content: '<p>Here is a simple 6-week structure:</p><p><b>Weeks 1–2:</b> finalize messaging and pricing. <b>Weeks 3–4:</b> build landing page and demo assets. <b>Week 5:</b> brief sales and line up early customers. <b>Week 6:</b> launch, then a follow-up email sequence over the next 10 days.</p>'
      }
    ]
  },
  {
    id: 'chat_2',
    title: 'Summarize quarterly report',
    model: 'gpt-5',
    pinned: true,
    createdAt: new Date('2026-07-11').toISOString(),
    messages: [
      { id: 'm3', role: 'user', content: 'Summarize the key points of a quarterly financial report for me.', files: ['Q2-report.pdf'] },
      {
        id: 'm4',
        role: 'assistant',
        model: 'gpt-5',
        content: '<p>Revenue grew 14% quarter over quarter, driven mostly by the enterprise segment. Costs rose 6%, so margin improved. The main risk flagged is customer concentration — the top three accounts are 41% of revenue.</p>'
      }
    ]
  },
  {
    id: 'chat_3',
    title: 'Fix a Python date bug',
    model: 'claude-sonnet',
    pinned: false,
    createdAt: new Date('2026-07-12').toISOString(),
    messages: [
      { id: 'm5', role: 'user', content: 'Why does datetime.strptime fail on "2026-7-5"?' },
      {
        id: 'm6',
        role: 'assistant',
        model: 'claude-sonnet',
        content: '<p>Your format string probably expects zero-padded values. Use <b>%Y-%m-%d</b> and pad the input, or parse with a more forgiving approach.</p>'
      }
    ]
  },
  {
    id: 'chat_4',
    title: 'Compare cloud storage pricing',
    model: 'gemini-pro',
    pinned: false,
    createdAt: new Date('2026-07-13').toISOString(),
    messages: [
      { id: 'm7', role: 'user', content: 'Compare S3, GCS and Azure Blob pricing at a high level.' },
      {
        id: 'm8',
        role: 'assistant',
        model: 'gemini-pro',
        content: '<p>All three land within a few cents per GB for standard storage. The real differences show up in egress fees and API request pricing — model your read/write pattern before choosing.</p>'
      }
    ]
  },
  {
    id: 'chat_5',
    title: 'Email to a late supplier',
    model: 'gpt-5-mini',
    pinned: false,
    createdAt: new Date('2026-07-14').toISOString(),
    messages: [
      { id: 'm9', role: 'user', content: 'Draft a firm but polite email to a supplier who is 2 weeks late.' },
      {
        id: 'm10',
        role: 'assistant',
        model: 'gpt-5-mini',
        content: '<p>Subject: Delivery status — action needed</p><p>Hi [Name], the order due on the 1st is now two weeks late and it is affecting our schedule. Please confirm a firm ship date by Friday, or we will need to discuss alternatives.</p>'
      }
    ]
  }
];
