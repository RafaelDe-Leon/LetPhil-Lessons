'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add suppressHydrationWarning to prevent hydration mismatch errors
  return (
    <NextThemesProvider {...props} enableSystem={true} attribute='class'>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Get stored theme or system preference
                const theme = localStorage.getItem('theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolvedTheme = theme === 'system' ? systemTheme : theme;
                
                // Apply theme immediately to prevent flash
                if (resolvedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {
                // Fail silently if localStorage is not available
                console.error(e);
              }
            })();
          `,
        }}
      />
      {children}
    </NextThemesProvider>
  )
}
