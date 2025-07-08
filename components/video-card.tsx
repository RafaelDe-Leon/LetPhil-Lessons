import type { Video, Coach } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, Calendar, BarChart } from "lucide-react"
import Link from "next/link"

interface VideoCardProps {
  video: Video
  coach?: Coach
  showCoach?: boolean
}

export default function VideoCard({ video, coach, showCoach = false }: VideoCardProps) {
  // Get category color based on the category name
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "html":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-800/70 dark:text-orange-100"
      case "css":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/70 dark:text-blue-100"
      case "javascript":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800/70 dark:text-yellow-100"
      case "react":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-800/70 dark:text-cyan-100"
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100"
    }
  }

  // Get level color based on the level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Level 1":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/70 dark:text-green-100"
      case "Level 2":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/70 dark:text-blue-100"
      case "Level 3":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800/70 dark:text-purple-100"
      case "Level 4":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/70 dark:text-red-100"
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100"
    }
  }

  // Get tag color based on the tag
  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Recommended by Coach":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-800/70 dark:text-amber-100"
      case "Live Session":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-800/70 dark:text-emerald-100"
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100"
    }
  }

  // Check if the URL is a YouTube URL
  const isYouTube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(video.videoUrl)

  // Get YouTube thumbnail if it's a YouTube video
  const getYouTubeThumbnail = () => {
    let videoId = ""
    if (video.videoUrl.includes("youtube.com/watch")) {
      videoId = new URL(video.videoUrl).searchParams.get("v") || ""
    } else if (video.videoUrl.includes("youtu.be")) {
      videoId = video.videoUrl.split("/").pop() || ""
    }
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }

  // Get the coach ID (support both coachId and teacherId for backward compatibility)
  const coachId = video.coachId || video.teacherId

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {isYouTube ? (
          <img
            src={getYouTubeThumbnail() || "/placeholder.svg"}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700">
            <PlayCircle className="h-16 w-16 text-slate-400 dark:text-slate-500" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          <Badge className={`${getCategoryColor(video.category)}`}>{video.category}</Badge>
          {video.level && (
            <Badge className={`${getLevelColor(video.level)}`}>
              <BarChart className="h-3 w-3 mr-1" />
              {video.level}
            </Badge>
          )}
        </div>
        {video.tag && <Badge className={`absolute bottom-2 right-2 ${getTagColor(video.tag)}`}>{video.tag}</Badge>}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
          <div className="flex items-center gap-2">
            {video.githubUrl && (
              <Link href={video.githubUrl} target="_blank" aria-label="View code on GitHub">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-github"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </Button>
              </Link>
            )}
            {showCoach && coach && (
              <Link href={`/coaches/${coach.id}`}>
                <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                  <AvatarImage src={coach.avatar || "/placeholder.svg"} alt={coach.name} />
                  <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Calendar className="mr-1 h-3 w-3" />
          {formatDate(video.date)}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {video.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{video.description}</p>
        )}
      </CardContent>

      <CardFooter className="mt-auto pt-4">
        <Button asChild className="flex-1 gap-2">
          <Link href={video.videoUrl} target="_blank">
            <PlayCircle className="h-4 w-4" />
            Watch Video
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
