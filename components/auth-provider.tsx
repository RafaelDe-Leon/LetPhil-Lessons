"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { updateUserLastLogin } from "@/lib/firebase-admin"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSigningUp, setIsSigningUp] = useState(false) // Track signup state
  const router = useRouter()

  // Check if user exists in Firestore and get their data
  const checkUserExists = async (user: User): Promise<boolean> => {
    try {
      console.log(`🔍 [AUTH] Checking if user exists in Firestore: ${user.uid}`)
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        console.log(`✅ [AUTH] User exists in Firestore:`, userData)
        setIsAdmin(userData.isAdmin === true)
        return true
      } else {
        console.log(`❌ [AUTH] User does not exist in Firestore: ${user.uid}`)
        return false
      }
    } catch (error) {
      console.error("❌ [AUTH] Error checking user existence:", error)
      return false
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 Auth state changed:", user ? `User: ${user.uid} (${user.email})` : "No user")

      if (user) {
        // Skip the existence check if we're in the middle of signing up
        if (isSigningUp) {
          console.log("⏳ [AUTH] Signup in progress, skipping existence check")
          setUser(user)
          setLoading(false)
          return
        }

        // Check if user exists in Firestore
        const userExists = await checkUserExists(user)

        if (userExists) {
          setUser(user)
          console.log("✅ [AUTH] User authenticated and exists in Firestore")
        } else {
          console.log("❌ [AUTH] User authenticated but not found in Firestore - signing out")
          await firebaseSignOut(auth)
          setUser(null)
          setIsAdmin(false)
          toast.error("Account not found. Please contact an administrator.")
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [isSigningUp])

  // Google sign-in - only allow existing users
  const signInWithGoogle = async () => {
    try {
      console.log("🚀 Starting Google sign-in...")
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      console.log("✅ Google sign-in successful:", result.user.uid)

      // Check if user exists in Firestore
      const userExists = await checkUserExists(result.user)

      if (!userExists) {
        // Sign out the user since they don't exist in Firestore
        await firebaseSignOut(auth)
        toast.error("Account not found. Please sign up first or contact an administrator.")
        return
      }

      // Update last login time
      if (result.user) {
        updateUserLastLogin(result.user.uid).catch((error) => {
          console.warn("⚠️ Could not update login time:", error.message)
        })
      }

      toast.success("Signed in successfully!")
    } catch (error: any) {
      console.error("❌ Error signing in with Google:", error)

      if (error.code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname
        toast.error(
          `This domain (${currentDomain}) is not authorized for authentication. Please add it to your Firebase console.`,
          {
            duration: 6000,
          },
        )
      } else {
        toast.error("Authentication failed. Please try again later.")
      }
      throw error
    }
  }

  // Email sign-in - only allow existing users
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("🚀 Starting email sign-in...")
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Email sign-in successful:", result.user.uid)

      // Check if user exists in Firestore
      const userExists = await checkUserExists(result.user)

      if (!userExists) {
        // Sign out the user since they don't exist in Firestore
        await firebaseSignOut(auth)
        toast.error("Account not found. Please sign up first or contact an administrator.")
        return
      }

      // Update last login time
      if (result.user) {
        updateUserLastLogin(result.user.uid).catch((error) => {
          console.warn("⚠️ Could not update login time:", error.message)
        })
      }

      toast.success("Signed in successfully!")
    } catch (error) {
      console.error("❌ Error signing in with email:", error)
      throw error
    }
  }

  // Sign up with email and password - creates new users
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setIsSigningUp(true) // Set signup flag
      console.log("🚀 [SIGNUP] Starting email sign-up...")
      console.log(`📧 [SIGNUP] Email: ${email}`)
      console.log(`👤 [SIGNUP] Display name: ${displayName}`)

      // Step 1: Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("✅ [SIGNUP] Firebase Auth account created:", user.uid)

      // Step 2: Update profile with display name
      await updateProfile(user, { displayName })
      console.log("✅ [SIGNUP] Profile updated with display name:", displayName)

      // Step 3: Create user document in Firestore
      console.log("🚀 [SIGNUP] Creating Firestore document...")
      const userData = {
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL,
        isAdmin: false,
        isCoach: false,
        isSubscriber: false,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }

      console.log(`📄 [SIGNUP] User data to be saved:`, userData)

      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, userData)
      console.log(`✅ [SIGNUP] User document created successfully`)

      // Step 4: Verify the document was created
      const verifySnap = await getDoc(userRef)
      if (verifySnap.exists()) {
        console.log(`✅ [SIGNUP] Verification successful - document exists`)
        toast.success("Account created successfully! You can now sign in.")
      } else {
        console.error(`❌ [SIGNUP] Verification failed - document does not exist`)
        toast.error("Account created but verification failed. Please try signing in.")
      }

      // Step 5: Sign out after registration
      await firebaseSignOut(auth)
      console.log("✅ [SIGNUP] User signed out after registration")
    } catch (error: any) {
      console.error("❌ [SIGNUP] Error during sign-up:", error)
      console.error("❌ [SIGNUP] Error code:", error.code)
      console.error("❌ [SIGNUP] Error message:", error.message)

      // Handle specific Firebase Auth errors
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already in use. Please sign in instead.")
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address. Please check and try again.")
      } else if (error.code === "permission-denied") {
        toast.error("Permission denied. Please check Firestore security rules.")
      } else {
        toast.error(`Failed to create account: ${error.message}`)
      }

      throw error
    } finally {
      setIsSigningUp(false) // Clear signup flag
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out. Please try again.")
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
