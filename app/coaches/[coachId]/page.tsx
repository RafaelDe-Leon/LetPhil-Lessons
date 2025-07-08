"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VideoCard from "@/components/video-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { VideoFilters } from "@/components/video-filters"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import RequireAuth from "@/components/require-auth"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams } from "next/navigation"
import type { Video, Coach } from "@/lib/types"

// Loading component for videos
function VideosSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(3)
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

function CoachContent({ coachId }: { coachId: string }) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [coach, setCoach] = useState<Coach | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
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
      console.log(`🔍 [COACH_CLIENT] Fetching coach and videos for ID: ${coachId}`)

      // Fetch coach data
      const coachDoc = await getDoc(doc(db, "users", coachId))

      if (!coachDoc.exists()) {
        console.log(`❌ [COACH_CLIENT] No user found with ID: ${coachId}`)
        notFound()
        return
      }

      const coachData = coachDoc.data()
      console.log(`📊 [COACH_CLIENT] Coach data:`, {
        name: coachData.displayName || coachData.name,
        isCoach: coachData.isCoach,
        email: coachData.email,
      })

      // Check if user is a coach
      if (!(coachData.isCoach === true || coachData.isCoach === "true")) {
        console.log(`❌ [COACH_CLIENT] User ${coachId} is not a coach`)
        notFound()
        return
      }

      const coachInfo: Coach = {
        id: coachDoc.id,
        name: coachData.displayName || coachData.name || "Unnamed Coach",
        avatar: coachData.photoURL || coachData.avatar || null,
      }

      setCoach(coachInfo)

      // Fetch videos for this coach
      const videosCollection = collection(db, "videos")

      // Try coachId first, then teacherId for backward compatibility
      let videosQuery = query(videosCollection, where("coachId", "==", coachId))
      let videosSnapshot = await getDocs(videosQuery)

      if (videosSnapshot.empty) {
        videosQuery = query(videosCollection, where("teacherId", "==", coachId))
        videosSnapshot = await getDocs(videosQuery)
      }

      const videosData = videosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[]

      console.log(`📊 [COACH_CLIENT] Found ${videosData.length} videos for coach ${coachInfo.name}`)

      setVideos(videosData)
    } catch (error: any) {
      console.error("❌ [COACH_CLIENT] Error fetching data:", error)
      setError(`Failed to load coach data: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user, coachId])

  if (loading) {
    return (
      <div className="py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <VideosSkeleton />
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="py-10">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Error loading coach</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error || "Coach not found"}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
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

  // Sort videos by date based on sortOrder
  const sortedVideos = filteredVideos.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  // Get unique categories from filtered videos
  const categories = Array.from(new Set(filteredVideos.map((video) => video.category)))

  return (
    <div className="py-10">
      <Link
        href="/coaches"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all coaches
      </Link>

      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl">
        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-700 shadow-md">
          <AvatarImage src={coach.avatar || "/placeholder.svg"} alt={coach.name} />
          <AvatarFallback className="text-2xl">{coach.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            {coach.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {filteredVideos.length} coaching sessions across {categories.length} topics
          </p>
        </div>
      </div>

      <div className="mb-8">
        <VideoFilters />
      </div>

      {categories.length > 0 ? (
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
                  .map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            {tag || level
              ? "No sessions match your selected filters. Try changing or clearing your filters."
              : "No recorded sessions found for this coach."}
          </p>
        </div>
      )}
    </div>
  )
}

export default function CoachPage({ params }: { params: { coachId: string } }) {
  return (
    <RequireAuth>
      <Suspense fallback={<div>Loading...</div>}>
        <CoachContent coachId={params.coachId} />
      </Suspense>
    </RequireAuth>
  )
}
