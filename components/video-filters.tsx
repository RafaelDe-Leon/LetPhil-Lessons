"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

interface VideoFiltersProps {
  className?: string
}

export function VideoFilters({ className }: VideoFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentTag = searchParams.get("tag") || ""
  const currentLevel = searchParams.get("level") || ""
  const currentSort = searchParams.get("sort") || "newest"

  // Handle tag filter change
  const handleTagFilter = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (tag === "all" || !tag) {
      params.delete("tag")
    } else {
      params.set("tag", tag)
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  // Handle level filter change
  const handleLevelFilter = (level: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (level === "all" || !level) {
      params.delete("level")
    } else {
      params.set("level", level)
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  // Handle sort change
  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Clear all filters but keep sort
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tag")
    params.delete("level")
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Remove specific filter
  const removeTag = () => {
    handleTagFilter("all")
  }

  const removeLevel = () => {
    handleLevelFilter("all")
  }

  // Count active filters
  const activeFilterCount = [currentTag, currentLevel].filter(Boolean).length

  return (
    <div className={`flex flex-col gap-4 p-4 bg-muted/50 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      {/* Filter Controls - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="sort-filter" className="text-sm font-medium">
            Sort:
          </label>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="level-filter" className="text-sm font-medium">
            Level:
          </label>
          <Select value={currentLevel || "all"} onValueChange={handleLevelFilter}>
            <SelectTrigger id="level-filter">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="Level 1">Level 1</SelectItem>
              <SelectItem value="Level 2">Level 2</SelectItem>
              <SelectItem value="Level 3">Level 3</SelectItem>
              <SelectItem value="Level 4">Level 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tag-filter" className="text-sm font-medium">
            Type:
          </label>
          <Select value={currentTag || "all"} onValueChange={handleTagFilter}>
            <SelectTrigger id="tag-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Recommended by Coach">Recommended by Coach</SelectItem>
              <SelectItem value="Live Session">Live Session</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium opacity-0">Clear:</label>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentLevel && (
            <Badge variant="secondary" className="gap-1">
              Level: {currentLevel}
              <X className="h-3 w-3 cursor-pointer" onClick={removeLevel} />
            </Badge>
          )}
          {currentTag && (
            <Badge variant="secondary" className="gap-1">
              Type: {currentTag}
              <X className="h-3 w-3 cursor-pointer" onClick={removeTag} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
