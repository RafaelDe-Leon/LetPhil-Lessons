"use client"

import { useState, useEffect } from "react"
import { getAppSettings, updateAppSettings } from "@/lib/firebase-admin"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Shield } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import type { AppSettings } from "@/lib/types"

export function AppSettingsComponent() {
  const { user, initializing } = useAuth()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      const currentSettings = await getAppSettings()
      setSettings(currentSettings)
    } catch (error: any) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  // Update subscription requirement setting
  const handleSubscriptionToggle = async (requireSubscription: boolean) => {
    if (!user || !settings) return

    setUpdating(true)
    try {
      await updateAppSettings({ requireSubscriptionForVideos: requireSubscription }, user.uid)

      setSettings({
        ...settings,
        requireSubscriptionForVideos: requireSubscription,
      })

      toast.success(
        requireSubscription
          ? "Videos now require subscription to view"
          : "Videos are now accessible to all authenticated users",
      )
    } catch (error: any) {
      console.error("Error updating subscription requirement:", error)
      toast.error("Failed to update setting")
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    // Wait until Firebase Auth has finished loading AND we have a user
    if (!initializing && user) {
      fetchSettings()
    }
  }, [initializing, user])

  if (initializing || !user) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
        </CardContent>
      </Card>
    )
  }

  if (!settings) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Video Access Control
        </CardTitle>
        <CardDescription>Control who can access video content on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-medium">Require Subscription for Videos</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {settings.requireSubscriptionForVideos
                ? "Only subscribers can view videos"
                : "All authenticated users can view videos"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {updating && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch
              checked={settings.requireSubscriptionForVideos}
              onCheckedChange={handleSubscriptionToggle}
              disabled={updating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
