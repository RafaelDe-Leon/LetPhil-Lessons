import { NextResponse } from "next/server"

// Lazy import Firebase Admin to avoid initialization during build
async function getFirebaseAdmin() {
  try {
    const { getAuth } = await import("firebase-admin/auth")
    const { getFirestore } = await import("firebase-admin/firestore")
    const { initializeFirebaseAdmin } = await import("@/lib/firebase-admin-config")

    // Initialize Firebase Admin if needed
    initializeFirebaseAdmin()

    return { getAuth, getFirestore }
  } catch (error) {
    console.error("Failed to load Firebase Admin:", error)
    throw new Error("Firebase Admin not available")
  }
}

export async function GET(request: Request) {
  try {
    // Check if we're in a build environment
    if (process.env.NODE_ENV === "production" && !process.env.FIREBASE_PRIVATE_KEY) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 })
    }

    const { getAuth, getFirestore } = await getFirebaseAdmin()

    // Get the authorization token from the request headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]

    // Verify the token and get the user
    const decodedToken = await getAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // Check if the user is an admin
    const adminDoc = await getFirestore().collection("users").doc(uid).get()
    const isAdmin = adminDoc.exists && adminDoc.data()?.isAdmin === true

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Fetch all users from Firestore
    const usersSnapshot = await getFirestore().collection("users").get()
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Error fetching users:", error)

    // Handle specific Firebase Admin errors
    if (error.message?.includes("Firebase Admin not available")) {
      return NextResponse.json({ error: "Firebase Admin service unavailable" }, { status: 503 })
    }

    return NextResponse.json({ error: "Failed to fetch users: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

// Update user role endpoint
export async function PUT(request: Request) {
  try {
    // Check if we're in a build environment
    if (process.env.NODE_ENV === "production" && !process.env.FIREBASE_PRIVATE_KEY) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 })
    }

    const { getAuth, getFirestore } = await getFirebaseAdmin()

    // Get the authorization token from the request headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]

    // Verify the token and get the user
    const decodedToken = await getAuth().verifyIdToken(token)
    const adminUid = decodedToken.uid

    // Check if the user is an admin
    const adminDoc = await getFirestore().collection("users").doc(adminUid).get()
    const isAdmin = adminDoc.exists && adminDoc.data()?.isAdmin === true

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Get the user ID and new role from the request body
    const { userId, isAdmin: newIsAdmin } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (typeof newIsAdmin !== "boolean") {
      return NextResponse.json({ error: "isAdmin must be a boolean" }, { status: 400 })
    }

    // Update the user's role
    await getFirestore().collection("users").doc(userId).update({
      isAdmin: newIsAdmin,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating user role:", error)

    // Handle specific Firebase Admin errors
    if (error.message?.includes("Firebase Admin not available")) {
      return NextResponse.json({ error: "Firebase Admin service unavailable" }, { status: 503 })
    }

    return NextResponse.json(
      { error: "Failed to update user role: " + (error.message || "Unknown error") },
      { status: 500 },
    )
  }
}
