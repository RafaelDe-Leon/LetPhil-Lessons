"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { getAllTeachers } from "@/lib/data"
import type { Video } from "@/lib/types"

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const teachers = getAllTeachers()

  // Fetch videos from Firestore
  const fetchVideos = async () => {
    setLoading(true)
    try {
      const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(videosQuery)

      const videosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[]

      setVideos(videosData)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast.error("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  // Delete a video
  const handleDelete = async (videoId: string) => {
    try {
      await deleteDoc(doc(db, "videos", videoId))
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId))
      toast.success("Video deleted successfully")
    } catch (error) {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
    }
  }

  // Get teacher name by ID
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher ? teacher.name : "Unknown Teacher"
  }

  // Load videos on component mount
  useEffect(() => {
    fetchVideos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No videos found. Add your first video!
              </TableCell>
            </TableRow>
          ) : (
            videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium max-w-[300px] truncate">{video.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{video.category}</Badge>
                </TableCell>
                <TableCell>{getTeacherName(video.teacherId)}</TableCell>
                <TableCell>{formatDate(video.date)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the video.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(video.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
