"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function SocialAuth() {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDomainError, setShowDomainError] = useState(false)
  const router = useRouter()
  const currentDomain = typeof window !== "undefined" ? window.location.hostname : ""

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setShowDomainError(false)

    try {
      await signInWithGoogle()
      router.push("/videos") // Redirect to sessions page after login
    } catch (error: any) {
      console.error("Google sign in error:", error)

      if (error.code === "auth/unauthorized-domain") {
        setShowDomainError(true)
        toast.error("Authentication domain not authorized", {
          description: "Please add this domain to your Firebase console.",
          duration: 5000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      {showDomainError && (
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Unauthorized Domain</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              The domain <strong>{currentDomain}</strong> is not authorized for Firebase authentication.
            </p>
            <p className="text-xs">
              To fix this, go to the Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains and add{" "}
              <strong>{currentDomain}</strong> to the list.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Google
      </Button>

      {/* Development mode emulator option */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 p-2 border border-dashed rounded-md">
          <p className="font-medium mb-1">Development Mode Options:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <a
                href="https://console.firebase.google.com/project/_/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add {currentDomain} to Firebase authorized domains
              </a>
            </li>
            <li>
              <a
                href="https://firebase.google.com/docs/emulator-suite"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Use Firebase Emulator for local development
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
