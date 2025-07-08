"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import VideoCard from "@/components/video-card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoFilters } from "@/components/video-filters"
import RequireAuth from "@/components/require-auth"
import { useAuth } from "@/components/auth-provider"
import { useSubscriptionAccess } from "@/hooks/use-subscription-access"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Crown } from "lucide-react"
import type { Video, Coach } from "@/lib/types"

// Loading component for videos
function VideosSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden h-full">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 flex flex-col h-[calc(100%-56.25%)]">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4 flex-grow" />
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          </div>
        ))}
    </div>
  )
}

// Subscription required component
function SubscriptionRequired() {
  return (
    <div className="flex justify-center py-12">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Subscription Required
          </CardTitle>
          <CardDescription>Access to coaching videos requires an active subscription</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Contact an administrator to upgrade your account to access premium content.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function VideosContent() {
  const { user } = useAuth()
  const { hasAccess, loading: accessLoading } = useSubscriptionAccess()
  const searchParams = useSearchParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // Get filter values from URL params
  const sortOrder = searchParams.get("sort") || "newest"
  const tag = searchParams.get("tag") || ""
  const level = searchParams.get("level") || ""

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user || !auth.currentUser) {
        setLoading(false)
        return
      }

      // Test connection first
      const testQuery = query(collection(db, "videos"), limit(1))
      await getDocs(testQuery)

      // Fetch videos and coaches in parallel
      const [videosSnapshot, usersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "videos"), orderBy("date", "desc"))),
        getDocs(collection(db, "users")),
      ])

      // Process videos
      const videosData = videosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[]

      // Process coaches
      const allUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      const coachesData = allUsers
        .filter((user) => user.isCoach === true || user.isCoach === "true")
        .map((user) => ({
          id: user.id,
          name: user.displayName || user.name || "Unnamed Coach",
          avatar: user.photoURL || user.avatar || null,
        })) as Coach[]

      setVideos(videosData)
      setCoaches(coachesData)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(error.message || "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true)
    })
    return () => unsubscribe()
  }, [])

  // Fetch data when user and auth are ready and has access
  useEffect(() => {
    if (authReady && user && hasAccess && !accessLoading) {
      fetchData()
    } else if (authReady && (!user || !hasAccess) && !accessLoading) {
      setLoading(false)
    }
  }, [user, authReady, hasAccess, accessLoading])

  // Show loading while checking access or fetching data
  if (!authReady || accessLoading || loading) {
    return <VideosSkeleton />
  }

  // Show subscription required if user doesn't have access
  if (!hasAccess) {
    return <SubscriptionRequired />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Error loading videos</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Apply filters
  let filteredVideos = [...videos]

  if (tag) {
    filteredVideos = filteredVideos.filter((video) => video.tag === tag)
  }

  if (level) {
    filteredVideos = filteredVideos.filter((video) => video.level === level)
  }

  // Sort videos
  const sortedVideos = filteredVideos.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  if (sortedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No coaching sessions found</h2>
        <p className="text-slate-600 dark:text-slate-400">
          {tag || level
            ? "No sessions match your selected filters. Try changing or clearing your filters."
            : "There are no recorded sessions in the database yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedVideos.map((video) => {
        const coachId = video.coachId || video.teacherId
        const coach = coaches.find((c) => c.id === coachId)
        return <VideoCard key={video.id} video={video} coach={coach} showCoach={true} />
      })}
    </div>
  )
}

export default function VideosPage() {
  return (
    <RequireAuth>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
                Latest Coaching Sessions
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mt-2">
                Browse our collection of recorded coaching sessions from the LetPhil community coaches.
              </p>
            </div>

            <VideoFilters />
          </div>

          <Suspense fallback={<VideosSkeleton />}>
            <VideosContent />
          </Suspense>
        </div>
      </div>
    </RequireAuth>
  )
}
