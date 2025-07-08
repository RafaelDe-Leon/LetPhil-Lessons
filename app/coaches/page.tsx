"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import CoachCard from "@/components/coach-card"
import RequireAuth from "@/components/require-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import { useSubscriptionAccess } from "@/hooks/use-subscription-access"
import { Crown, Lock } from "lucide-react"
import type { Coach } from "@/lib/types"

// Loading component for coaches
function CoachesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
    </div>
  )
}

export default function CoachesPage() {
  const { user } = useAuth()
  const { hasAccess, loading: accessLoading } = useSubscriptionAccess()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoaches = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    // Add detailed debugging
    console.log("🔍 [DEBUG] Current user:", {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
    })

    try {
      setLoading(true)
      setError(null)
      console.log("🔍 [COACHES_CLIENT] Fetching coaches from Firestore...")

      const usersCollection = collection(db, "users")

      // Method 1: Try to query directly for users with isCoach=true
      console.log("🔍 [COACHES_CLIENT] Attempting direct query for isCoach=true...")
      let coachesQuery = query(usersCollection, where("isCoach", "==", true))
      let querySnapshot = await getDocs(coachesQuery)

      console.log(`📊 [COACHES_CLIENT] Direct query (isCoach=true) found ${querySnapshot.size} documents`)

      // If no results with boolean true, try with string "true"
      if (querySnapshot.empty) {
        console.log("🔍 [COACHES_CLIENT] No results with boolean true, trying string 'true'...")
        coachesQuery = query(usersCollection, where("isCoach", "==", "true"))
        querySnapshot = await getDocs(coachesQuery)
        console.log(`📊 [COACHES_CLIENT] String query (isCoach='true') found ${querySnapshot.size} documents`)
      }

      // If still no results, fall back to getting all users and filtering
      if (querySnapshot.empty) {
        console.log("🔍 [COACHES_CLIENT] No results from queries, falling back to get all users and filter...")

        // Get all users and filter manually
        const allUsersSnapshot = await getDocs(usersCollection)
        console.log(`📊 [COACHES_CLIENT] Found ${allUsersSnapshot.size} total users`)

        const allUsers = allUsersSnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))

        // Filter for coaches manually
        const coachUsers = allUsers.filter((user) => {
          const isCoach = user.data.isCoach === true || user.data.isCoach === "true"
          return isCoach
        })

        console.log(`🎯 [COACHES_CLIENT] Found ${coachUsers.length} coaches after manual filtering`)

        // Convert to Coach objects
        const coachesData = coachUsers.map((user) => ({
          id: user.id,
          name: user.data.displayName || user.data.name || "Unnamed Coach",
          avatar: user.data.photoURL || user.data.avatar || null,
        })) as Coach[]

        // Sort coaches by name
        const sortedCoaches = coachesData.sort((a, b) => a.name.localeCompare(b.name))
        setCoaches(sortedCoaches)
      } else {
        // We got results from the query, process them
        const coachesData = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.displayName || data.name || "Unnamed Coach",
            avatar: data.photoURL || data.avatar || null,
          }
        }) as Coach[]

        // Sort coaches by name
        const sortedCoaches = coachesData.sort((a, b) => a.name.localeCompare(b.name))
        setCoaches(sortedCoaches)
      }
    } catch (error: any) {
      console.error("❌ [COACHES_CLIENT] Error getting coaches:", error)
      setError(`Failed to fetch coaches: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoaches()
  }, [user])

  // Show loading while checking access
  if (accessLoading || loading) {
    return <CoachesSkeleton />
  }

  // Show subscription required message if no access
  if (!hasAccess) {
    return (
      <RequireAuth>
        <div className="py-10">
          <div className="flex flex-col gap-4 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
              Our Coaches
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Meet the LetPhil community coaches and explore their recorded sessions.
            </p>
          </div>

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
                Access to coaching profiles requires an active subscription
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Contact an administrator to upgrade your account to access premium content.
              </p>
            </div>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="py-10">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Our Coaches
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Meet the LetPhil community coaches and explore their recorded sessions.
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error loading coaches</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchCoaches}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : coaches.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No coaches available</h2>
            <p className="text-slate-600 dark:text-slate-400">
              There are currently no coaches in the system. Please check back later or contact an administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
