import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/layout.css';

export const metadata: Metadata = {
  title: 'Merchant Platform - LOS',
  description: 'Loan Origination System for Merchants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <div id="__next">{children}</div>
      </body>
    </html>
  );
}
