import type { Video, Teacher } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, Calendar, Github } from "lucide-react"
import Link from "next/link"

interface VideoCardProps {
  video: Video
  teacher?: Teacher
  showTeacher?: boolean
}

export default function VideoCard({ video, teacher, showTeacher = false }: VideoCardProps) {
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
        <Badge className={`absolute top-2 right-2 ${getCategoryColor(video.category)}`}>{video.category}</Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
          <div className="flex items-center gap-2">
            {video.githubUrl && (
              <Link href={video.githubUrl} target="_blank" aria-label="View code on GitHub">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {showTeacher && teacher && (
              <Link href={`/teachers/${teacher.id}`}>
                <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                  <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                  <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
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
