import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '{{project-name}}',
  description: 'GainInsight Standard - Hello World',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
