'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = (resolvedTheme || theme) === 'dark'

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label='Toggle dark mode'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='ml-2'>
      {isDark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
    </Button>
  )
}
