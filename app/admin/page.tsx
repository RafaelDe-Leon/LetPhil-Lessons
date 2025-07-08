import AdminAuthCheck from "@/components/admin-auth-check"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoForm } from "@/components/admin/video-form"
import { VideoList } from "@/components/admin/video-list"
import { CoachList } from "@/components/admin/coach-list"
import { UserManagement } from "@/components/admin/user-management"
import { AppSettingsComponent } from "@/components/admin/app-settings"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component for tabs content
function TabContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminAuthCheck>
      <div className="py-10">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Manage video lessons, coaches, and view system information.
          </p>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <VideoForm />
              </div>
              <div className="lg:col-span-2">
                <VideoList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coaches">
            <div className="max-w-5xl">
              <CoachList />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="max-w-5xl">
              <Suspense fallback={<TabContentSkeleton />}>
                <UserManagement />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl">
              <AppSettingsComponent />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}
