"use client"

import { useState, useEffect } from "react"
import {
  getAllUsersFromFirestore,
  updateUserRole,
  updateUserCoachStatus,
  updateUserSubscriptionStatus,
} from "@/lib/firebase-admin"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { RefreshCw, Loader2, CheckCircle, XCircle, ShieldAlert } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Starting to fetch users...")
      const usersData = await getAllUsersFromFirestore()
      console.log(`Successfully fetched ${usersData.length} users`)
      setUsers(usersData)
    } catch (error: any) {
      console.error("Error fetching users:", error)

      // Set a user-friendly error message
      setError(error.message || "Failed to load users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle role toggle
  const handleRoleToggle = async (userId: string, isCurrentlyAdmin: boolean) => {
    setUpdatingUserId(userId)
    try {
      await updateUserRole(userId, !isCurrentlyAdmin)
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, isAdmin: !isCurrentlyAdmin } : user)),
      )
      toast.success(`User is now ${!isCurrentlyAdmin ? "an admin" : "a regular user"}`)
    } catch (error: any) {
      console.error("Error updating user role:", error)
      toast.error(error.message || "Failed to update user role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Handle coach status toggle
  const handleCoachToggle = async (userId: string, isCurrentlyCoach: boolean) => {
    setUpdatingUserId(userId)
    try {
      await updateUserCoachStatus(userId, !isCurrentlyCoach)
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, isCoach: !isCurrentlyCoach } : user)),
      )
      toast.success(`User is now ${!isCurrentlyCoach ? "a coach" : "not a coach"}`)
    } catch (error: any) {
      console.error("Error updating coach status:", error)
      toast.error(error.message || "Failed to update coach status")
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Handle subscription status toggle
  const handleSubscriptionToggle = async (userId: string, isCurrentlySubscriber: boolean) => {
    setUpdatingUserId(userId)
    try {
      await updateUserSubscriptionStatus(userId, !isCurrentlySubscriber)
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, isSubscriber: !isCurrentlySubscriber } : user)),
      )
      toast.success(`User is now ${!isCurrentlySubscriber ? "a subscriber" : "not a subscriber"}`)
    } catch (error: any) {
      console.error("Error updating subscription status:", error)
      toast.error(error.message || "Failed to update subscription status")
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      // Handle Firestore timestamps
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Invalid date"
    }
  }

  // Determine if a user is active (logged in within the last 30 days)
  const isUserActive = (user: any) => {
    if (!user.lastLoginAt && !user.lastSignInTime) return false

    const lastActivity = user.lastLoginAt || user.lastSignInTime
    if (!lastActivity) return false

    try {
      const lastActivityDate = lastActivity.toDate ? lastActivity.toDate() : new Date(lastActivity)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      return lastActivityDate > thirtyDaysAgo
    } catch (error) {
      return false
    }
  }

  // Load users on component mount or refresh
  useEffect(() => {
    fetchUsers()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    )
  }

  // If there's an error, show an error message with retry button
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">User Management</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>

        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Access Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error}</p>
            <div className="text-sm">
              <p className="font-semibold">Possible solutions:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Update your Firestore security rules to allow admin access to the users collection</li>
                <li>Make sure your account has admin privileges in the Firestore database</li>
                <li>Check the browser console for more detailed error information</li>
                <li>Try signing out and signing back in to refresh your authentication token</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Count active users and subscribers
  const activeUsers = users.filter(isUserActive).length
  const subscribers = users.filter((user) => user.isSubscriber === true).length

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeUsers} active users, {subscribers} subscribers out of {users.length} total users
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Subscriber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const active = isUserActive(user)
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                          <AvatarFallback>{(user.displayName || user.email || "U").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName || "Unnamed User"}</p>
                          <p className="text-xs text-slate-500">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.lastLoginAt || user.updatedAt)}</TableCell>
                    <TableCell>
                      {active ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800"
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isAdmin === true}
                          onCheckedChange={() => handleRoleToggle(user.id, user.isAdmin === true)}
                          disabled={updatingUserId === user.id}
                        />
                        <span className="text-sm">
                          {updatingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isAdmin === true ? (
                            "Admin"
                          ) : (
                            "User"
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isCoach === true}
                          onCheckedChange={() => handleCoachToggle(user.id, user.isCoach === true)}
                          disabled={updatingUserId === user.id}
                        />
                        <span className="text-sm">
                          {updatingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isCoach === true ? (
                            "Coach"
                          ) : (
                            "Not Coach"
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isSubscriber === true}
                          onCheckedChange={() => handleSubscriptionToggle(user.id, user.isSubscriber === true)}
                          disabled={updatingUserId === user.id}
                        />
                        <span className="text-sm">
                          {updatingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isSubscriber === true ? (
                            "Subscriber"
                          ) : (
                            "Free User"
                          )}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
