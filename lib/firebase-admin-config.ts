import { initializeApp, getApps, cert } from "firebase-admin/app"

// Initialize Firebase Admin
export function initializeFirebaseAdmin() {
  // Skip initialization during build time or if already initialized
  if (typeof window !== "undefined" || getApps().length > 0) {
    return
  }

  try {
    // Check if we have the environment variables we need
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    // If we're in build mode and don't have credentials, skip initialization
    if (!privateKey || !clientEmail || !projectId) {
      console.warn("Firebase Admin credentials not found. Skipping initialization.")
      return
    }

    // Initialize the app with the service account credentials
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // The private key comes as a string with \n characters
        // We need to replace them with actual newlines
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    })

    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.warn("Failed to initialize Firebase Admin:", error)
    // Don't throw during build time
  }
}
