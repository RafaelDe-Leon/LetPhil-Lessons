"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export function LoadingIndicator() {
  const pathname = usePathname()
  // The issue is with useSearchParams() not being wrapped in a Suspense boundary
  // Let's make it conditional to avoid the error during static generation
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Handle route changes
  useEffect(() => {
    // Skip during SSR/static generation
    if (typeof window === "undefined") return

    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Start loading
    setIsLoading(true)

    // Set a timer to stop loading
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }, 500)

    // Set a backup timer to ensure loading always stops
    const backupTimer = setTimeout(() => {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }, 2000)

    return () => {
      clearTimeout(backupTimer)
    }
  }, [pathname, searchParams])

  // Don't render anything if not loading or during SSR
  if (!isLoading || typeof window === "undefined") return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-slate-300 via-slate-500 to-slate-700"
      style={{
        animation: "progressAnimation 1s ease-in-out infinite",
      }}
      aria-hidden="true"
    ></div>
  )
}
