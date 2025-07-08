"use client"

import { useEffect, useState } from "react"
import { getAllCoachesFromFirestore } from "@/lib/firebase-admin"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Coach } from "@/lib/types"

export function CoachList() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch coaches from Firestore
  const fetchCoaches = async () => {
    setLoading(true)
    try {
      const coachesData = await getAllCoachesFromFirestore()
      console.log(
        "Coaches loaded:",
        coachesData.map((c) => ({ id: c.id, name: c.name })),
      )
      setCoaches(coachesData)
    } catch (error) {
      console.error("Error fetching coaches:", error)
      toast.error("Failed to load coaches")
    } finally {
      setLoading(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Load coaches on component mount or refresh
  useEffect(() => {
    fetchCoaches()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Coaches</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View coaches in the system.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  No coaches found.
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={coach.avatar || "/placeholder.svg"} alt={coach.name} />
                      <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell className="text-slate-500">{coach.id}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
