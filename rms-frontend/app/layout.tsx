import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bistro RMS — Restaurant Management System',
  description: 'Modern restaurant management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#FFF8F0',
                color: '#4E342E',
                border: '1px solid #F5E6D3',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#66BB6A', secondary: '#FFF8F0' } },
              error: { iconTheme: { primary: '#EF5350', secondary: '#FFF8F0' } },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
