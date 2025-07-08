"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SortAsc, SortDesc } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export type SortOrder = "newest" | "oldest"

interface VideoFilterProps {
  defaultSort?: SortOrder
  onSortChange?: (sortOrder: SortOrder) => void
  className?: string
}

export function VideoFilter({ defaultSort = "newest", onSortChange, className }: VideoFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get the sort parameter from URL or use default
  const sortFromUrl = searchParams.get("sort") as SortOrder
  const [sortOrder, setSortOrder] = useState<SortOrder>(sortFromUrl || defaultSort)

  // Toggle sort order and update URL
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "newest" ? "oldest" : "newest"
    setSortOrder(newSortOrder)

    // Update URL with the new sort parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", newSortOrder)

    // Use replace to update URL without adding to history
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })

    // Call the callback if provided
    if (onSortChange) {
      onSortChange(newSortOrder)
    }

    console.log(`Sort order changed to: ${newSortOrder}`)
  }

  // Update local state when URL changes
  useEffect(() => {
    const sortFromUrl = searchParams.get("sort") as SortOrder
    if (sortFromUrl && sortFromUrl !== sortOrder) {
      setSortOrder(sortFromUrl)
    }
  }, [searchParams, sortOrder])

  return (
    <div className={className}>
      <Button variant="outline" size="sm" onClick={toggleSortOrder} className="flex items-center gap-2">
        {sortOrder === "newest" ? (
          <>
            <SortDesc className="h-4 w-4" />
            <span>Newest First</span>
          </>
        ) : (
          <>
            <SortAsc className="h-4 w-4" />
            <span>Oldest First</span>
          </>
        )}
      </Button>
    </div>
  )
}
