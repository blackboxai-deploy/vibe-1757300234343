import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkTracker Pro - Advanced Link Tracking & Analytics',
  description: 'Create trackable links with precise location analytics. Monitor click-through rates, geographic distribution, and user engagement with interactive maps and comprehensive dashboards.',
  keywords: 'link tracking, analytics, location tracking, click tracking, link management, geographic analytics',
  authors: [{ name: 'LinkTracker Pro' }],
  openGraph: {
    title: 'LinkTracker Pro - Advanced Link Tracking & Analytics',
    description: 'Create trackable links with precise location analytics and comprehensive dashboards.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100">
          {children}
        </div>
      </body>
    </html>
  );
}