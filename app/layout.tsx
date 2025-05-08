import type React from 'react'
import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import { LoadingIndicator } from '@/components/loading-indicator'
import { ScrollToTop } from '@/components/scroll-to-top'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LetPhil - Lessons',
  description: 'A modern platform for educational video lessons',
}

// Create a client component wrapper for LoadingIndicator
function ClientLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <LoadingIndicator />
    </Suspense>
  )
}

// Create a client component wrapper for ScrollToTop
function ClientScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTop />
    </Suspense>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <ClientLoadingIndicator />
          <div className='min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900'>
            <header className='sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80 dark:border-slate-800'>
              <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='flex h-16 items-center justify-between'>
                  <Link href='/' className='flex items-center gap-2' prefetch={true}>
                    <div className='rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-1 text-white dark:from-slate-700 dark:to-slate-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-play'>
                        <polygon points='5 3 19 12 5 21 5 3' />
                      </svg>
                    </div>
                    <span className='text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300'>
                      LetPhil - Lessons
                    </span>
                  </Link>
                  <Navigation />
                </div>
              </div>
            </header>
            <main>
              <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>{children}</div>
            </main>
            <footer className='border-t py-6 md:py-0 dark:border-slate-800'>
              <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row'>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    © {new Date().getFullYear()} LetPhil - Lessons. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
            <ClientScrollToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
