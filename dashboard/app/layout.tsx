import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sola Analytics',
  description: 'Sola startup analytics dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sola-bg text-sola-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
