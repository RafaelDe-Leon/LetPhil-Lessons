import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

// This endpoint allows you to manually revalidate pages
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path") || "/"

  try {
    // Revalidate the specified path
    revalidatePath(path)
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    })
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      error: (err as Error).message,
    })
  }
}
