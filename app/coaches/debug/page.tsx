"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAllCoachesFromFirestore } from "@/lib/firebase-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import RequireAuth from "@/components/require-auth"
import { Loader2, RefreshCw, Users, Database } from "lucide-react"

export default function CoachesDebugPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [coaches, setCoaches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queryResults, setQueryResults] = useState<any>({})

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("🔍 [DEBUG] Starting comprehensive data fetch...")

      // 1. Get all users
      const usersCollection = collection(db, "users")
      const allUsersSnapshot = await getDocs(usersCollection)
      const usersData = allUsersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        _isCoachType: typeof doc.data().isCoach,
        _isAdminType: typeof doc.data().isAdmin,
      }))

      console.log("📊 [DEBUG] All users:", usersData)
      setUsers(usersData)

      // 2. Test different queries for coaches
      const queryResults: any = {}

      // Query 1: isCoach === true (boolean)
      try {
        const booleanQuery = query(usersCollection, where("isCoach", "==", true))
        const booleanSnapshot = await getDocs(booleanQuery)
        queryResults.booleanTrue = {
          count: booleanSnapshot.size,
          docs: booleanSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        }
        console.log("📊 [DEBUG] Boolean true query:", queryResults.booleanTrue)
      } catch (err) {
        queryResults.booleanTrue = { error: (err as Error).message }
      }

      // Query 2: isCoach === "true" (string)
      try {
        const stringQuery = query(usersCollection, where("isCoach", "==", "true"))
        const stringSnapshot = await getDocs(stringQuery)
        queryResults.stringTrue = {
          count: stringSnapshot.size,
          docs: stringSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        }
        console.log("📊 [DEBUG] String true query:", queryResults.stringTrue)
      } catch (err) {
        queryResults.stringTrue = { error: (err as Error).message }
      }

      setQueryResults(queryResults)

      // 3. Use our getAllCoachesFromFirestore function
      try {
        const coachesData = await getAllCoachesFromFirestore()
        console.log("📊 [DEBUG] getAllCoachesFromFirestore result:", coachesData)
        setCoaches(coachesData)
      } catch (err) {
        console.error("❌ [DEBUG] getAllCoachesFromFirestore error:", err)
        setCoaches([])
      }
    } catch (err: any) {
      console.error("❌ [DEBUG] Error fetching data:", err)
      setError(err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const revalidatePage = async (path: string) => {
    try {
      const response = await fetch(`/api/revalidate?path=${path}`)
      const data = await response.json()
      alert(`Revalidation ${data.revalidated ? "successful" : "failed"}: ${path}`)
      console.log("Revalidation response:", data)
    } catch (err) {
      console.error("Revalidation error:", err)
      alert(`Revalidation failed: ${(err as Error).message}`)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const coachUsers = users.filter((u) => u.isCoach === true || u.isCoach === "true")
  const nonCoachUsers = users.filter((u) => !(u.isCoach === true || u.isCoach === "true"))

  return (
    <RequireAuth>
      <div className="py-10">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Coaches Debug Page
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            This page helps diagnose issues with the coaches data and queries.
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={() => fetchAllData()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Data
          </Button>
          <Button onClick={() => revalidatePage("/coaches")}>Revalidate Coaches Page</Button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coach Users (Filtered)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coachUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boolean Query</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queryResults.booleanTrue?.count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">String Query</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queryResults.stringTrue?.count || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Query Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Boolean Query (isCoach === true):</h4>
                <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(queryResults.booleanTrue, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold">String Query (isCoach === "true"):</h4>
                <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(queryResults.stringTrue, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold">getAllCoachesFromFirestore() Result:</h4>
                <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(coaches, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coach Users Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Users with isCoach=true ({coachUsers.length} found)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : coachUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found with isCoach=true</div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        isCoach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {coachUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.displayName || user.name || "No name"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || "No email"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{String(user.isCoach)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user._isCoachType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        isCoach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        isAdmin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className={coachUsers.some((c) => c.id === user.id) ? "bg-green-50 dark:bg-green-900/20" : ""}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.displayName || user.name || "No name"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || "No email"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {String(user.isCoach)} ({user._isCoachType})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {String(user.isAdmin)} ({user._isAdminType})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  )
}
