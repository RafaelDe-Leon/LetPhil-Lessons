"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addCoachToFirestore, updateCoachInFirestore } from "@/lib/firebase-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Coach } from "@/lib/types"

// Define form schema with Zod
const coachFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().url("Please enter a valid URL").or(z.string().length(0)),
})

type CoachFormValues = z.infer<typeof coachFormSchema>

interface CoachFormProps {
  coachToEdit?: Coach | null
  onSuccess?: () => void
}

export function CoachForm({ coachToEdit = null, onSuccess }: CoachFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!coachToEdit

  // Initialize form
  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachFormSchema),
    defaultValues: {
      name: coachToEdit?.name || "",
      avatar: coachToEdit?.avatar || "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: CoachFormValues) => {
    setIsSubmitting(true)

    try {
      if (isEditing && coachToEdit) {
        // Update existing coach
        console.log(`Updating coach with ID: ${coachToEdit.id}`, data)
        await updateCoachInFirestore(coachToEdit.id, data)
        toast.success("Coach updated successfully!")
      } else {
        // Generate a URL-friendly ID from the name
        const coachId = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        console.log(`Adding new coach with generated ID: ${coachId}`, data)

        // Add new coach with explicit ID
        await addCoachToFirestore({
          ...data,
          id: coachId, // Add the ID to the coach data
        })

        toast.success("Coach added successfully!")
        form.reset({
          name: "",
          avatar: "",
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving coach:", error)
      toast.error(isEditing ? "Failed to update coach" : "Failed to add coach")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coach Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter coach name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.png" {...field} />
                  </FormControl>
                  <FormDescription>URL to the coach's avatar image. Leave blank to use default avatar.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating Coach..." : "Adding Coach..."}
                </>
              ) : isEditing ? (
                "Update Coach"
              ) : (
                "Add Coach"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
