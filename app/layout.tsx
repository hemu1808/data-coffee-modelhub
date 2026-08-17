import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Data Coffee — Model Hub',
  description:
    'Enterprise multi-model AI workspace platform. Chat with Claude, GPT, and Gemini in one unified interface.',
  keywords: ['AI', 'LLM', 'multi-model', 'workspace', 'enterprise', 'chat'],
  authors: [{ name: 'Data Coffee' }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0F10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-hub-bg text-hub-text antialiased selection:bg-hub-accent selection:text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
