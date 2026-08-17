import { Workspace } from '../../types';

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'product',
    name: 'Product Research',
    description: 'Compare foundation models and prepare recommendations for the client demo.',
    tokens: 18420,
    credits: 11.28,
    members: [
      { initials: 'U', name: 'User', role: 'Owner', color: '#3B4A6B' },
      { initials: 'AK', name: 'Ava Kim', role: 'Editor', color: '#8B5CF6' },
      { initials: 'JM', name: 'Jordan Miles', role: 'Editor', color: '#C56A46' },
      { initials: 'RS', name: 'Riya Shah', role: 'Viewer', color: '#287A68' },
      { initials: 'DL', name: 'Daniel Lee', role: 'Editor', color: '#4F70C8' }
    ],
    documents: [
      { name: 'enterprise-requirements.pdf', info: 'PDF · 2.4 MB', uploadedBy: 'Jordan' },
      { name: 'model-comparison.xlsx', info: 'Excel · 820 KB', uploadedBy: 'Ava' },
      { name: 'client-demo-notes.docx', info: 'Word · 340 KB', uploadedBy: 'User' },
      { name: 'security-checklist.pdf', info: 'PDF · 1.1 MB', uploadedBy: 'Riya' }
    ],
    chats: [
      {
        id: 'tc-1',
        title: 'Model comparison matrix',
        model: 'claude-sonnet',
        pinned: false,
        createdAt: new Date('2026-07-08').toISOString(),
        messages: [
          { id: 'tm1', role: 'user', content: 'Compare the models using our requirements document.', files: ['enterprise-requirements.pdf'] },
          { id: 'tm2', role: 'assistant', model: 'claude-sonnet', content: '<p>I compared the requirements against the candidate models. Claude Sonnet is strongest for long-document analysis, GPT-5 for general reasoning, and Gemini Pro for multimodal workflows.</p>' }
        ]
      },
      { id: 'tc-2', title: 'Enterprise security questions', model: 'gpt-5', pinned: false, createdAt: new Date('2026-07-09').toISOString(), messages: [] }
    ]
  },
  {
    id: 'client',
    name: 'Client Delivery',
    description: 'Coordinate requirements, meeting notes, deliverables, and approved AI outputs.',
    tokens: 12780,
    credits: 7.64,
    members: [
      { initials: 'U', name: 'User', role: 'Owner', color: '#3B4A6B' },
      { initials: 'JM', name: 'Jordan Miles', role: 'Admin', color: '#C56A46' },
      { initials: 'DL', name: 'Daniel Lee', role: 'Editor', color: '#4F70C8' }
    ],
    documents: [
      { name: 'meeting-notes-july.pdf', info: 'PDF · 680 KB', uploadedBy: 'Daniel' },
      { name: 'approved-prompts.docx', info: 'Word · 190 KB', uploadedBy: 'User' },
      { name: 'delivery-plan.xlsx', info: 'Excel · 410 KB', uploadedBy: 'Jordan' }
    ],
    chats: [
      { id: 'tc-3', title: 'Requirements summary', model: 'gpt-5', pinned: false, createdAt: new Date('2026-07-10').toISOString(), messages: [] },
      { id: 'tc-4', title: 'Meeting action items', model: 'claude-sonnet', pinned: false, createdAt: new Date('2026-07-11').toISOString(), messages: [] }
    ]
  }
];
