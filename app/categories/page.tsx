"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import VideoCard from "@/components/video-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoFilters } from "@/components/video-filters"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import RequireAuth from "@/components/require-auth"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams } from "next/navigation"
import { useSubscriptionAccess } from "@/hooks/use-subscription-access"
import { Crown, Lock } from "lucide-react"
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

function CategoriesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const { hasAccess, loading: accessLoading } = useSubscriptionAccess()
  const [videos, setVideos] = useState<Video[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get filter values from URL params
  const sortOrder = searchParams.get("sort") || "newest"
  const tag = searchParams.get("tag") || ""
  const level = searchParams.get("level") || ""

  const fetchData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("🔍 [CATEGORIES_CLIENT] Fetching videos and coaches from Firestore...")

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

      console.log(`📊 [CATEGORIES_CLIENT] Found ${videosData.length} videos`)

      // Process coaches (users with isCoach=true)
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

      console.log(`📊 [CATEGORIES_CLIENT] Found ${coachesData.length} coaches`)

      setVideos(videosData)
      setCoaches(coachesData)
    } catch (error: any) {
      console.error("❌ [CATEGORIES_CLIENT] Error fetching data:", error)
      setError(`Failed to load videos: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  // Show loading while checking access
  if (accessLoading || loading) {
    return <VideosSkeleton />
  }

  // Show subscription required message if no access
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md mx-auto text-center p-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Lock className="h-12 w-12 text-amber-500" />
              <Crown className="h-6 w-6 text-amber-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Subscription Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Access to coaching topics requires an active subscription
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contact an administrator to upgrade your account to access premium content.
          </p>
        </div>
      </div>
    )
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

  // Filter by tag if specified
  if (tag) {
    filteredVideos = filteredVideos.filter((video) => video.tag === tag)
  }

  // Filter by level if specified
  if (level) {
    filteredVideos = filteredVideos.filter((video) => video.level === level)
  }

  // Get unique categories from filtered videos
  const categories = Array.from(new Set(filteredVideos.map((video) => video.category)))

  // Sort videos by date based on sortOrder
  const sortedVideos = filteredVideos.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  if (categories.length === 0) {
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
    <Tabs defaultValue={categories[0]} className="w-full">
      <TabsList className="mb-8 w-full justify-start overflow-auto">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category} className="px-6">
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={`${category}-${sortOrder}-${tag}-${level}`} value={category}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos
              .filter((video) => video.category === category)
              .map((video) => {
                const coach = coaches.find((c) => c.id === (video.coachId || video.teacherId))
                return <VideoCard key={video.id} video={video} coach={coach} showCoach={true} />
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function CategoriesPage() {
  return (
    <RequireAuth>
      <div className="py-10">
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
              Browse by Topic
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mt-2">
              Explore our coaching session recordings organized by subject area.
            </p>
          </div>

          <VideoFilters />
        </div>

        <Suspense fallback={<VideosSkeleton />}>
          <CategoriesContent />
        </Suspense>
      </div>
    </RequireAuth>
  )
}
