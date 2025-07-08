"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Play, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to sessions page if user is logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/videos")
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  // If user is logged in, we'll redirect, but return null here to prevent flash of content
  if (user) {
    return null
  }

  // Marketing homepage for logged-out users
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-28 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
                LetPhil Community Learning Hub
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 text-base md:text-xl dark:text-slate-400 px-4">
                Access recordings of live coaching sessions from the LetPhil community coaches to review and enhance
                your learning journey.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 min-[400px]:gap-4 w-full sm:w-auto px-4">
              <Button asChild size="lg" className="gap-1 w-full sm:w-auto">
                <Link href="/auth">
                  Access Sessions <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                Enhance Your Learning Experience
              </h2>
              <p className="mx-auto max-w-[700px] text-slate-500 text-base md:text-xl/relaxed dark:text-slate-400 px-4">
                Our platform provides access to all recorded coaching sessions to help you review and master concepts at
                your own pace.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 mt-12 px-4">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Play className="h-8 w-8 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Session Recordings</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Access recordings of live coaching sessions to review material and reinforce your learning.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Users className="h-8 w-8 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Expert Coaches</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Learn from LetPhil community coaches who are passionate about helping you succeed.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <BookOpen className="h-8 w-8 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Organized Content</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Browse sessions by category or coach to quickly find the content you need to review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                Ready to Access Your Sessions?
              </h2>
              <p className="mx-auto max-w-[700px] text-slate-500 text-base md:text-xl/relaxed dark:text-slate-400 px-4">
                Sign in to your LetPhil community account to access all recorded coaching sessions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 min-[400px]:gap-4 w-full sm:w-auto px-4">
              <Button asChild size="lg" className="gap-1 w-full sm:w-auto">
                <Link href="/auth">
                  Sign In Now <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                What Our Community Says
              </h2>
              <p className="mx-auto max-w-[700px] text-slate-500 text-base md:text-xl/relaxed dark:text-slate-400 px-4">
                Hear from mentees who have improved their skills by reviewing coaching sessions.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 mt-12 px-4">
            <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  "Being able to review the coaching sessions has been invaluable. I can go back and rewatch parts I
                  didn't fully grasp during the live session."
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-1">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium">Alex Johnson</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">LetPhil Mentee</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  "The platform makes it easy to find specific coaching sessions by topic. It's been a great supplement
                  to the live classes."
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-1">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sarah Miller</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">LetPhil Mentee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                Join Our Learning Community
              </h2>
              <p className="mx-auto max-w-[700px] text-slate-500 text-base md:text-xl/relaxed dark:text-slate-400 px-4">
                Sign in now to access all coaching session recordings and continue your learning journey.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto px-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth">Sign In Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
