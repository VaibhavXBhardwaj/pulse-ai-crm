import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/providers/query-provider'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'PulseAI', template: '%s — PulseAI' },
  description: 'AI-native CRM for reaching shoppers intelligently',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${plusJakarta.variable} ${inter.variable}`}>
        <body className="font-sans antialiased">
          <QueryProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}