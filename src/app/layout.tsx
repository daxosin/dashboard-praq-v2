import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Dashboard PRAQ - Pharma78',
  description: 'Cockpit qualité ISO 9001:2015 pour Pharma78',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
