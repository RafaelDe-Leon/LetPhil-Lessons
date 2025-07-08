"use client"

import { useEffect, useState } from "react"
import { getAllVideosFromFirestore, deleteVideoFromFirestore, getAllCoachesFromFirestore } from "@/lib/firebase-admin"
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
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { VideoForm } from "@/components/admin/video-form"
import type { Video, Coach } from "@/lib/types"

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch videos from Firestore
  const fetchVideos = async () => {
    setLoading(true)
    try {
      const [videosData, coachesData] = await Promise.all([getAllVideosFromFirestore(), getAllCoachesFromFirestore()])
      setVideos(videosData)
      setCoaches(coachesData)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast.error("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  // Delete a video
  const handleDelete = async () => {
    if (!videoToDelete) return

    try {
      console.log(`Deleting video with ID: ${videoToDelete}`)
      await deleteVideoFromFirestore(videoToDelete)
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoToDelete))
      toast.success("Video deleted successfully")
      setVideoToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
    }
  }

  // Edit a video
  const handleEdit = (video: Video) => {
    setVideoToEdit(video)
    setIsEditDialogOpen(true)
  }

  // Get coach name by ID
  const getCoachName = (coachId: string) => {
    const coach = coaches.find((c) => c.id === coachId)
    return coach ? coach.name : "Unknown Coach"
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Load videos on component mount or refresh
  useEffect(() => {
    fetchVideos()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Video Lessons</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto w-1000">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No videos found. Add your first video!
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{video.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{video.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{video.level || "Not set"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{video.tag || "Not set"}</Badge>
                  </TableCell>
                  <TableCell>{getCoachName(video.coachId)}</TableCell>
                  <TableCell>{formatDate(video.date)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setVideoToDelete(video.id)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>Make changes to the video information below.</DialogDescription>
          </DialogHeader>
          <VideoForm
            videoToEdit={videoToEdit}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              handleRefresh()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVideoToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
