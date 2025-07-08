"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addVideoToFirestore, updateVideoInFirestore, getAllCoachesFromFirestore } from "@/lib/firebase-admin"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Coach, Video } from "@/lib/types"

// Define form schema with Zod
const videoFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  videoUrl: z.string().url("Please enter a valid URL"),
  category: z.string().min(1, "Please select a category"),
  coachId: z.string().min(1, "Please select a coach"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  githubUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date in YYYY-MM-DD format"),
  level: z.enum(["Level 1", "Level 2", "Level 3", "Level 4"], {
    required_error: "Please select a level",
  }),
  tag: z.enum(["Recommended by Coach", "Live Session"], {
    required_error: "Please select a tag",
  }),
})

type VideoFormValues = z.infer<typeof videoFormSchema>

interface VideoFormProps {
  videoToEdit?: Video | null
  onSuccess?: () => void
}

export function VideoForm({ videoToEdit = null, onSuccess }: VideoFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(true)
  const isEditing = !!videoToEdit

  // Define categories
  const categories = ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Node.js", "Next.js"]

  // Define levels
  const levels = ["Level 1", "Level 2", "Level 3", "Level 4"]

  // Define tags
  const tags = ["Recommended by Coach", "Live Session"]

  // Load coaches from Firestore (users with isCoach=true)
  useEffect(() => {
    const loadCoaches = async () => {
      try {
        setIsLoadingCoaches(true)
        const coachesData = await getAllCoachesFromFirestore()
        setCoaches(coachesData)
      } catch (error) {
        console.error("Error loading coaches:", error)
        toast.error("Failed to load coaches. Please refresh the page.")
      } finally {
        setIsLoadingCoaches(false)
      }
    }

    loadCoaches()
  }, [])

  // Initialize form
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: videoToEdit?.title || "",
      videoUrl: videoToEdit?.videoUrl || "",
      category: videoToEdit?.category || "",
      coachId: videoToEdit?.coachId || "",
      description: videoToEdit?.description || "",
      githubUrl: videoToEdit?.githubUrl || "",
      date: videoToEdit?.date || new Date().toISOString().split("T")[0],
      level: videoToEdit?.level || "Level 1",
      tag: videoToEdit?.tag || "Recommended by Coach",
    },
  })

  // Handle form submission
  const onSubmit = async (data: VideoFormValues) => {
    if (!user) return

    setIsSubmitting(true)

    try {
      // Ensure coachId is a string and not empty
      if (!data.coachId) {
        toast.error("Please select a coach")
        setIsSubmitting(false)
        return
      }

      // Log the coach ID for debugging
      console.log(`Submitting video with coachId: "${data.coachId}"`)

      // Find the selected coach to confirm it exists
      const selectedCoach = coaches.find((c) => c.id === data.coachId)
      console.log(`Selected coach: ${selectedCoach ? selectedCoach.name : "Not found"}`)

      if (isEditing && videoToEdit) {
        // Update existing video
        await updateVideoInFirestore(videoToEdit.id, {
          ...data,
          coachId: data.coachId.trim(), // Ensure no whitespace
        })
        toast.success("Video updated successfully!")
      } else {
        // Generate a URL-friendly ID from the title
        const id = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        // Add new video with explicit ID
        await addVideoToFirestore({
          ...data,
          id,
          date: data.date,
          coachId: data.coachId.trim(), // Ensure no whitespace
        })
        toast.success("Video added successfully!")
        form.reset({
          title: "",
          videoUrl: "",
          category: "",
          coachId: "",
          description: "",
          githubUrl: "",
          date: new Date().toISOString().split("T")[0],
          level: "Level 1",
          tag: "Recommended by Coach",
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving video:", error)
      toast.error(isEditing ? "Failed to update video" : "Failed to add video")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Video" : "Add New Video"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormDescription>YouTube URL or other video hosting URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCoaches || coaches.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingCoaches
                                ? "Loading coaches..."
                                : coaches.length === 0
                                  ? "No coaches available"
                                  : "Select a coach"
                            }
                          />
                          {isLoadingCoaches && <Loader2 className="h-4 w-4 animate-spin" />}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The coach who created this video.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The difficulty level of this video.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tag" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tags.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The type of content.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description of the video content"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repository URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/username/repo" {...field} />
                  </FormControl>
                  <FormDescription>Link to GitHub repository with code examples (if applicable).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting || isLoadingCoaches} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating Video..." : "Adding Video..."}
                </>
              ) : isEditing ? (
                "Update Video"
              ) : (
                "Add Video"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
