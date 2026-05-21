import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MY PROMPT CRAFT',
  description: '曖昧なプロンプトをAIとの対話で改善するツール',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
