"use client"

import { useState, useEffect } from "react"

interface VideoPlayerProps {
  videoUrl: string
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isYouTube, setIsYouTube] = useState(false)
  const [videoId, setVideoId] = useState("")

  useEffect(() => {
    // Check if the URL is a YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/
    setIsYouTube(youtubeRegex.test(videoUrl))

    // Extract YouTube video ID if it's a YouTube URL
    if (youtubeRegex.test(videoUrl)) {
      let id = ""
      if (videoUrl.includes("youtube.com/watch")) {
        id = new URL(videoUrl).searchParams.get("v") || ""
      } else if (videoUrl.includes("youtu.be")) {
        id = videoUrl.split("/").pop() || ""
      }
      setVideoId(id)
    }
  }, [videoUrl])

  if (isYouTube && videoId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video"
        ></iframe>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md">
      <video controls className="h-full w-full" src={videoUrl}>
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
