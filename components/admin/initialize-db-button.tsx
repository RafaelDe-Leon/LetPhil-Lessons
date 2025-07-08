"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeFirestoreWithSampleData } from "@/lib/firebase-admin"
import { toast } from "sonner"
import { Loader2, Database, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InitializeDbButton() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      await initializeFirestoreWithSampleData()
      toast.success("Database initialized with sample data!")
    } catch (error: any) {
      console.error("Error initializing database:", error)
      setError(error.message || "Failed to initialize database")

      if (error.code === "permission-denied" || error.message?.includes("permission")) {
        toast.error("Permission denied. Please check your Firestore security rules.", {
          duration: 6000,
        })
      } else {
        toast.error("Failed to initialize database")
      }
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialize Database</CardTitle>
        <CardDescription>
          Populate the database with sample teachers and videos. This will only add data if the collections are empty.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          This action will add sample teachers and videos to your Firestore database. It's useful for testing or when
          setting up the application for the first time. The sample data will only be added if the collections are
          empty.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("permission") && (
                <p className="mt-2 text-xs">
                  Please check your Firestore security rules to ensure you have write access to the collections.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleInitialize} disabled={isInitializing}>
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Initialize with Sample Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
