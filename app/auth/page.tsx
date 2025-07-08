"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { SocialAuth } from "@/components/auth/social-auth"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("signin")
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/videos")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="py-10 flex justify-center">
      <div className="max-w-md w-full">
        <div className="flex flex-col gap-4 mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Welcome
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your account or create a new one.</p>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="signin" className="mt-0 space-y-4">
                <SignInForm />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                <SocialAuth />
              </TabsContent>
              <TabsContent value="signup" className="mt-0 space-y-4">
                <SignUpForm onSuccess={() => setActiveTab("signin")} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                <SocialAuth />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
            {activeTab === "signin" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-slate-900 underline hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("signin")}
                  className="text-slate-900 underline hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  Sign in
                </button>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
