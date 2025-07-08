import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  setDoc,
} from "firebase/firestore"
import type { Coach, Video, AppSettings } from "@/lib/types"

// Collection references
const videosCollection = collection(db, "videos")
const usersCollection = collection(db, "users")
const settingsCollection = collection(db, "settings")

// App Settings operations
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const settingsRef = doc(settingsCollection, "app")
    const snap = await getDoc(settingsRef)

    // 1️⃣ Document exists – return it
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AppSettings
    }

    // 2️⃣ Doc missing – just return safe defaults (DO NOT write)
    return {
      id: "app",
      requireSubscriptionForVideos: false,
    } as AppSettings
  } catch (error) {
    console.error("❌ [SETTINGS] Error getting app settings:", error)
    // Fallback to safe defaults on any error
    return {
      id: "app",
      requireSubscriptionForVideos: false,
    } as AppSettings
  }
}

export async function updateAppSettings(settings: Partial<AppSettings>, adminUserId: string): Promise<void> {
  try {
    const settingsRef = doc(settingsCollection, "app")

    // create-or-update (merge) so it works even if the doc doesn't exist yet
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: serverTimestamp(),
        createdBy: adminUserId,
        // add createdAt if the doc is being created for the first time
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )

    console.log("✅ [SETTINGS] App settings saved")
  } catch (error) {
    console.error("❌ [SETTINGS] Error updating app settings:", error)
    throw error
  }
}

// Video CRUD operations
export async function getAllVideosFromFirestore(): Promise<Video[]> {
  try {
    // First try to get a limited number of videos to test permissions
    const testQuery = query(videosCollection, limit(1))
    await getDocs(testQuery)

    // If the above doesn't throw, proceed with the full query
    const querySnapshot = await getDocs(query(videosCollection, orderBy("date", "desc")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[]
  } catch (error) {
    console.error("Error getting videos:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

export async function getVideosByCoachIdFromFirestore(coachId: string): Promise<Video[]> {
  try {
    console.log(`Fetching videos for coach ID: "${coachId}"`)

    // First, try to get videos where coachId exactly matches the provided ID
    const q = query(videosCollection, where("coachId", "==", coachId))
    let querySnapshot = await getDocs(q)

    // If no results, try with teacherId (for backward compatibility)
    if (querySnapshot.empty) {
      const teacherQuery = query(videosCollection, where("teacherId", "==", coachId))
      querySnapshot = await getDocs(teacherQuery)
    }

    const videos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[]

    console.log(`Found ${videos.length} videos for coach "${coachId}"`)

    return videos
  } catch (error) {
    console.error("Error getting videos by coach:", error)
    return []
  }
}

export async function getVideosByCategoryFromFirestore(category: string): Promise<Video[]> {
  try {
    const q = query(videosCollection, where("category", "==", category), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[]
  } catch (error) {
    console.error("Error getting videos by category:", error)
    return []
  }
}

export async function addVideoToFirestore(videoData: any): Promise<string> {
  try {
    // Generate a URL-friendly ID from the title if not provided
    const id =
      videoData.id ||
      videoData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    // Ensure coachId is trimmed
    const coachId = videoData.coachId?.trim()

    console.log(`Adding video with title: ${videoData.title}, coachId: ${coachId}, id: ${id}`)

    // Create a document with a custom ID
    const docRef = doc(videosCollection, id)
    await setDoc(docRef, {
      ...videoData,
      id, // Ensure the ID is included in the document data
      coachId, // Use the trimmed coachId
      createdAt: serverTimestamp(),
    })

    console.log(`Video added successfully with ID: ${id}`)
    return id
  } catch (error) {
    console.error("Error adding video:", error)
    throw error
  }
}

export async function updateVideoInFirestore(id: string, videoData: Partial<Video>): Promise<void> {
  try {
    const videoRef = doc(db, "videos", id)
    await updateDoc(videoRef, {
      ...videoData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating video:", error)
    throw error
  }
}

export async function deleteVideoFromFirestore(id: string): Promise<void> {
  try {
    console.log(`Attempting to delete video with ID: ${id}`)
    const videoRef = doc(db, "videos", id)
    await deleteDoc(videoRef)
    console.log(`Successfully deleted video with ID: ${id}`)
  } catch (error) {
    console.error(`Error deleting video with ID: ${id}:`, error)
    throw error
  }
}

// Coach operations - FIXED: Properly query users collection for isCoach=true
export async function getAllCoachesFromFirestore(): Promise<Coach[]> {
  try {
    console.log("🔍 [COACHES] Starting to fetch coaches from users collection...")

    // Method 1: Try to query directly for users with isCoach=true
    console.log("🔍 [COACHES] Attempting direct query for isCoach=true...")
    let coachesQuery = query(usersCollection, where("isCoach", "==", true))
    let querySnapshot = await getDocs(coachesQuery)

    console.log(`📊 [COACHES] Direct query (isCoach=true) found ${querySnapshot.size} documents`)

    // If no results with boolean true, try with string "true"
    if (querySnapshot.empty) {
      console.log("🔍 [COACHES] No results with boolean true, trying string 'true'...")
      coachesQuery = query(usersCollection, where("isCoach", "==", "true"))
      querySnapshot = await getDocs(coachesQuery)
      console.log(`📊 [COACHES] String query (isCoach='true') found ${querySnapshot.size} documents`)
    }

    // If still no results, fall back to getting all users and filtering
    if (querySnapshot.empty) {
      console.log("🔍 [COACHES] No results from queries, falling back to get all users and filter...")

      // Get all users and filter manually
      const allUsersSnapshot = await getDocs(usersCollection)
      console.log(`📊 [COACHES] Found ${allUsersSnapshot.size} total users`)

      const allUsers = allUsersSnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }))

      // Log all users for debugging
      console.log("👥 [COACHES] All users in collection:")
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`)
        console.log(`     Name: ${user.data.displayName || user.data.name || "No name"}`)
        console.log(`     Email: ${user.data.email || "No email"}`)
        console.log(`     isCoach: ${user.data.isCoach} (type: ${typeof user.data.isCoach})`)
        console.log(`     isAdmin: ${user.data.isAdmin} (type: ${typeof user.data.isAdmin})`)
        console.log("     ---")
      })

      // Filter for coaches manually
      const coachUsers = allUsers.filter((user) => {
        const isCoach = user.data.isCoach === true || user.data.isCoach === "true"
        console.log(`🔍 [COACHES] User ${user.id}: isCoach check = ${isCoach}`)
        return isCoach
      })

      console.log(`🎯 [COACHES] Found ${coachUsers.length} coaches after manual filtering`)

      // Convert to Coach objects
      const coaches = coachUsers.map((user) => ({
        id: user.id,
        name: user.data.displayName || user.data.name || "Unnamed Coach",
        avatar: user.data.photoURL || user.data.avatar || null,
      })) as Coach[]

      // Sort coaches by name
      const sortedCoaches = coaches.sort((a, b) => a.name.localeCompare(b.name))
      console.log(
        `✅ [COACHES] Returning ${sortedCoaches.length} coaches:`,
        sortedCoaches.map((c) => ({ id: c.id, name: c.name })),
      )

      return sortedCoaches
    } else {
      // We got results from the query, process them
      const coaches = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        console.log(`📄 [COACHES] Processing coach document ${doc.id}:`, {
          name: data.displayName || data.name,
          isCoach: data.isCoach,
          email: data.email,
        })

        return {
          id: doc.id,
          name: data.displayName || data.name || "Unnamed Coach",
          avatar: data.photoURL || data.avatar || null,
        }
      }) as Coach[]

      // Sort coaches by name
      const sortedCoaches = coaches.sort((a, b) => a.name.localeCompare(b.name))
      console.log(
        `✅ [COACHES] Query successful! Returning ${sortedCoaches.length} coaches:`,
        sortedCoaches.map((c) => ({ id: c.id, name: c.name })),
      )

      return sortedCoaches
    }
  } catch (error: any) {
    console.error("❌ [COACHES] Error getting coaches:", error)
    console.error("❌ [COACHES] Error code:", error.code)
    console.error("❌ [COACHES] Error message:", error.message)
    console.error("❌ [COACHES] Full error:", error)

    // Check if this is a permissions error
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission") ||
      error.message?.includes("insufficient")
    ) {
      console.error("❌ [COACHES] Permission denied error - check Firestore security rules")
      throw new Error("Permission denied: Unable to read coaches data. Please check your access permissions.")
    }

    // For other errors, provide more details
    throw new Error(`Failed to fetch coaches: ${error.message || "Unknown error"}`)
  }
}

export async function getCoachByIdFromFirestore(id: string): Promise<Coach | null> {
  try {
    console.log(`🔍 [COACH] Fetching coach with ID: ${id}`)
    const userDoc = await getDoc(doc(usersCollection, id))

    if (!userDoc.exists()) {
      console.log(`❌ [COACH] No user found with ID: ${id}`)
      return null
    }

    const userData = userDoc.data()
    console.log(`📊 [COACH] User data for ${id}:`, {
      name: userData.displayName || userData.name,
      isCoach: userData.isCoach,
      email: userData.email,
    })

    // Check if user is a coach (accept both boolean true and string "true")
    if (userData.isCoach === true || userData.isCoach === "true") {
      const coach = {
        id: userDoc.id,
        name: userData.displayName || userData.name || "Unnamed Coach",
        avatar: userData.photoURL || userData.avatar || null,
      } as Coach

      console.log(`✅ [COACH] Found coach: ${coach.name} (ID: ${coach.id})`)
      return coach
    }

    console.log(`❌ [COACH] User ${id} is not a coach (isCoach: ${userData.isCoach})`)
    return null
  } catch (error) {
    console.error("❌ [COACH] Error getting coach:", error)
    return null
  }
}

export async function updateCoachInFirestore(id: string, coachData: Partial<Coach>): Promise<void> {
  try {
    const userRef = doc(usersCollection, id)
    await updateDoc(userRef, {
      name: coachData.name,
      displayName: coachData.name, // Update both name and displayName
      avatar: coachData.avatar,
      photoURL: coachData.avatar, // Update both avatar and photoURL
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating coach:", error)
    throw error
  }
}

export async function addCoachToFirestore(coachData: Coach): Promise<string> {
  try {
    // Generate a URL-friendly ID from the name if not provided
    const id =
      coachData.id ||
      coachData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    console.log(`🔍 [ADD_COACH] Adding coach with ID: ${id}, name: ${coachData.name}`)

    // Create a document with a custom ID
    const docRef = doc(usersCollection, id)
    await setDoc(docRef, {
      name: coachData.name,
      displayName: coachData.name,
      avatar: coachData.avatar,
      photoURL: coachData.avatar,
      isCoach: true, // Ensure this is boolean true
      isAdmin: false,
      createdAt: serverTimestamp(),
    })

    console.log(`✅ [ADD_COACH] Coach added successfully with ID: ${id}`)
    return id
  } catch (error) {
    console.error("❌ [ADD_COACH] Error adding coach:", error)
    throw error
  }
}

export async function updateUserCoachStatus(userId: string, isCoach: boolean): Promise<void> {
  try {
    console.log(`🔍 [UPDATE_COACH_STATUS] Updating user ${userId} isCoach to ${isCoach}`)
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      isCoach, // This will be a boolean
      updatedAt: serverTimestamp(),
    })
    console.log(`✅ [UPDATE_COACH_STATUS] Successfully updated user ${userId}`)
  } catch (error) {
    console.error("❌ [UPDATE_COACH_STATUS] Error updating user coach status:", error)
    throw error
  }
}

// User management operations - these will only work with proper Firebase Admin setup
export async function getAllUsersFromFirestore(): Promise<any[]> {
  try {
    console.log("Fetching users from Firestore...")

    // First try to get a limited number of users to test permissions
    const testQuery = query(usersCollection, limit(1))
    const testSnapshot = await getDocs(testQuery)
    console.log(`Test query successful, found ${testSnapshot.size} documents`)

    // If the above doesn't throw, proceed with the full query
    const querySnapshot = await getDocs(usersCollection)
    console.log(`Successfully fetched ${querySnapshot.size} users`)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error: any) {
    console.error("Error getting users:", error)

    // Check if this is a permissions error
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission") ||
      error.message?.includes("insufficient")
    ) {
      throw new Error("Missing or insufficient permissions. You don't have access to view user data.")
    }

    // For other errors, provide a generic message
    throw new Error(`Failed to fetch users: ${error.message || "Unknown error"}`)
  }
}

export async function updateUserRole(userId: string, isAdmin: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      isAdmin,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

export async function updateUserSubscriptionStatus(userId: string, isSubscriber: boolean): Promise<void> {
  try {
    console.log(`🔍 [UPDATE_SUBSCRIPTION] Updating user ${userId} isSubscriber to ${isSubscriber}`)
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      isSubscriber, // This will be a boolean
      updatedAt: serverTimestamp(),
    })
    console.log(`✅ [UPDATE_SUBSCRIPTION] Successfully updated user ${userId}`)
  } catch (error) {
    console.error("❌ [UPDATE_SUBSCRIPTION] Error updating user subscription status:", error)
    throw error
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // On client side, we need to use the current user's auth context
      const { auth } = await import("@/lib/firebase")
      const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore")

      // Only update if the current user is updating their own login time
      if (auth.currentUser && auth.currentUser.uid === userId) {
        const userRef = doc(db, "users", userId)
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
        })
      } else {
        console.warn("Cannot update login time: user mismatch or not authenticated")
        return
      }
    } else {
      // On server side, this would require Firebase Admin SDK
      console.warn("Server-side login time update requires Firebase Admin SDK")
      return
    }
  } catch (error: any) {
    console.error("Error updating user last login:", error)

    // Check if this is a permissions error
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission") ||
      error.message?.includes("insufficient")
    ) {
      console.warn("Insufficient permissions to update login time - this is expected for non-admin users")
      return // Don't throw, just log and return
    }

    // For other errors, just log them without throwing to prevent login issues
    console.warn("Failed to update login time, but continuing with login process")
  }
}

// Initialize Firestore with sample data if empty
export async function initializeFirestoreWithSampleData(): Promise<void> {
  try {
    // Check if videos collection is empty
    const videosSnapshot = await getDocs(videosCollection)
    const usersSnapshot = await getDocs(usersCollection) // Check if users collection is empty

    if (videosSnapshot.empty && usersSnapshot.empty) {
      console.log("Initializing Firestore with sample data...")

      // Add sample users with coach status
      const johnDoeRef = await addDoc(usersCollection, {
        name: "John Doe",
        displayName: "John Doe",
        avatar: "/teacher-with-glasses.png",
        photoURL: "/teacher-with-glasses.png",
        isCoach: true, // Boolean true
        isAdmin: false,
        isSubscriber: true, // Sample subscriber
        createdAt: serverTimestamp(),
      })

      const janeSmithRef = await addDoc(usersCollection, {
        name: "Jane Smith",
        displayName: "Jane Smith",
        avatar: "/smiling-female-teacher.png",
        photoURL: "/smiling-female-teacher.png",
        isCoach: true, // Boolean true
        isAdmin: false,
        isSubscriber: true, // Sample subscriber
        createdAt: serverTimestamp(),
      })

      const alexJohnsonRef = await addDoc(usersCollection, {
        name: "Alex Johnson",
        displayName: "Alex Johnson",
        avatar: "/young-male-teacher.png",
        photoURL: "/young-male-teacher.png",
        isCoach: true, // Boolean true
        isAdmin: false,
        isSubscriber: false, // Sample non-subscriber
        createdAt: serverTimestamp(),
      })

      // Add sample admin users
      await addDoc(usersCollection, {
        name: "Alice",
        displayName: "Alice Admin",
        email: "alice@example.com",
        isAdmin: true,
        isCoach: false,
        isSubscriber: true,
        createdAt: serverTimestamp(),
      })

      await addDoc(usersCollection, {
        name: "Bob",
        displayName: "Bob User",
        email: "bob@example.com",
        isAdmin: false,
        isCoach: false,
        isSubscriber: false,
        createdAt: serverTimestamp(),
      })

      // Add sample videos
      await addDoc(videosCollection, {
        title: "HTML Basics: Structure of a Webpage",
        date: "2023-09-15",
        videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        category: "HTML",
        coachId: johnDoeRef.id,
        description: "Learn the fundamental structure of HTML documents and how to create your first webpage.",
        githubUrl: "https://github.com/letphil/html-basics",
        level: "Level 1",
        tag: "Recommended by Coach",
        createdAt: serverTimestamp(),
      })

      await addDoc(videosCollection, {
        title: "CSS Flexbox Layout",
        date: "2023-10-08",
        videoUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
        category: "CSS",
        coachId: janeSmithRef.id,
        description: "Master the flexible box layout model in CSS.",
        githubUrl: "https://github.com/letphil/css-flexbox",
        level: "Level 2",
        tag: "Live Session",
        createdAt: serverTimestamp(),
      })

      await addDoc(videosCollection, {
        title: "Introduction to React",
        date: "2023-11-01",
        videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
        category: "React",
        coachId: alexJohnsonRef.id,
        description: "Get started with React library for building user interfaces.",
        githubUrl: "https://github.com/letphil/react-intro",
        level: "Level 3",
        tag: "Recommended by Coach",
        createdAt: serverTimestamp(),
      })

      console.log("Sample data initialized successfully!")
    }
  } catch (error) {
    console.error("Error initializing sample data:", error)
  }
}
