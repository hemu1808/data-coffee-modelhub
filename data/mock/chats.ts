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
        content: `Here is a structured 6-week product launch roadmap:

- **Weeks 1–2: Positioning & Pricing**
  Finalize messaging pillars, value propositions, and tier pricing.
- **Weeks 3–4: Asset Production & Testing**
  Build high-converting landing pages, interactive product demos, and documentation.
- **Week 5: Sales Enablement & Pre-Launch Outreach**
  Brief customer-facing teams and line up VIP beta users.
- **Week 6: Public Launch Day & Sequence**
  Execute coordinated multi-channel rollout with a 10-day onboarding email cadence.`,
      },
    ],
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
        content: `### Executive Summary: Q2 Financial Report

- **Revenue**: Grew **14% QoQ**, driven predominantly by the enterprise SaaS segment.
- **Operating Costs**: Increased by **6%**, resulting in overall net margin expansion.
- **Key Risk Factor**: Customer concentration risk flagged — top three accounts currently comprise **41%** of ARR.`,
      },
    ],
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
        content: `Your format string is likely using \`%m\` and \`%d\`, which expect zero-padded numbers (\`"2026-07-05"\`).

#### Recommended Fix:
\`\`\`python
from datetime import datetime

# Method 1: Using datetime (pad single-digit months/days)
raw_date = "2026-7-5"
parts = [f"{int(p):02d}" if i > 0 else p for i, p in enumerate(raw_date.split("-"))]
formatted = "-".join(parts)
dt = datetime.strptime(formatted, "%Y-%m-%d")
\`\`\``,
      },
    ],
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
        content: `### Cloud Object Storage Comparison

| Feature | **AWS S3** | **Google Cloud Storage** | **Azure Blob** |
| :--- | :--- | :--- | :--- |
| **Standard Tier** | ~$0.023 / GB | ~$0.020 / GB | ~$0.0184 / GB |
| **Egress (Internet)** | $0.09 / GB | $0.08–0.12 / GB | $0.087 / GB |
| **Best Used For** | Broadest tool ecosystem | AI data pipelines & BigQuery | Microsoft enterprise stacks |`,
      },
    ],
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
        content: `**Subject**: Delivery Status Update — Immediate Action Required

Hi [Supplier Name],

I am following up on Order #[OrderNumber], which was scheduled for delivery on [OriginalDate] and is now two weeks overdue. 

This delay is beginning to impact our manufacturing timeline and downstream commitments. Please provide a verified dispatch date and tracking reference by end-of-day tomorrow.

Thank you for your prompt attention.

Best regards,  
[Your Name]`,
      },
    ],
  },
];
