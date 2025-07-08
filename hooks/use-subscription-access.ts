"use client"

import { useState, useEffect } from "react"
import { getAppSettings } from "@/lib/firebase-admin"
import { useAuth } from "@/components/auth-provider"

export function useSubscriptionAccess() {
  const { user, isAdmin } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        // Admins always have access
        if (isAdmin) {
          setHasAccess(true)
          setLoading(false)
          return
        }

        // Get current app settings
        const settings = await getAppSettings()

        if (!settings || !settings.requireSubscriptionForVideos) {
          // If subscription is not required, all authenticated users have access
          setHasAccess(true)
        } else {
          // Subscription is required, check if user is a subscriber
          const { doc, getDoc } = await import("firebase/firestore")
          const { db } = await import("@/lib/firebase")

          const userDoc = await getDoc(doc(db, "users", user.uid))
          const userData = userDoc.data()

          setHasAccess(userData?.isSubscriber === true)
        }
      } catch (error) {
        console.error("Error checking subscription access:", error)
        // On error, default to allowing access
        setHasAccess(true)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, isAdmin])

  return { hasAccess, loading }
}
