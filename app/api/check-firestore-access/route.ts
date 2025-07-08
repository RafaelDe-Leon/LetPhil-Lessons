import { db } from "@/lib/firebase"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to get a single document from the videos collection
    const videosCollection = collection(db, "videos")
    const q = query(videosCollection, limit(1))
    const querySnapshot = await getDocs(q)

    // Try to get a single document from the users collection
    let hasUsersAccess = true
    let usersError = null

    try {
      const usersCollection = collection(db, "users")
      const usersQuery = query(usersCollection, limit(1))
      await getDocs(usersQuery)
    } catch (error: any) {
      hasUsersAccess = false
      usersError = error.message
    }

    // Return whether we have access and whether the collection is empty
    return NextResponse.json({
      videosAccess: true,
      videosEmpty: querySnapshot.empty,
      usersAccess: hasUsersAccess,
      usersError: usersError,
    })
  } catch (error: any) {
    // Check if this is a permissions error
    const isPermissionError =
      error.code === "permission-denied" ||
      error.message?.includes("permission") ||
      error.message?.includes("insufficient")

    return NextResponse.json({
      videosAccess: false,
      videosEmpty: false,
      isPermissionError,
      error: error.message,
    })
  }
}
