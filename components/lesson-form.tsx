"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface LessonFormProps {
  courseId: string
  lesson?: {
    id: string
    title: string
    description: string
    content_type: string
    content_url?: string
    content_text?: string
    order_index: number
  }
  onSuccess?: () => void
}

export function LessonForm({ courseId, lesson, onSuccess }: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title || "")
  const [description, setDescription] = useState(lesson?.description || "")
  const [contentType, setContentType] = useState(lesson?.content_type || "video")
  const [contentUrl, setContentUrl] = useState(lesson?.content_url || "")
  const [contentText, setContentText] = useState(lesson?.content_text || "")
  const [orderIndex, setOrderIndex] = useState(lesson?.order_index || 1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const lessonData = {
        course_id: courseId,
        title,
        description,
        content_type: contentType,
        content_url: contentType !== "text" ? contentUrl : null,
        content_text: contentType === "text" ? contentText : null,
        order_index: orderIndex,
      }

      if (lesson) {
        // Update existing lesson
        const { error } = await supabase.from("lessons").update(lessonData).eq("id", lesson.id)
        if (error) throw error
      } else {
        // Create new lesson
        const { error } = await supabase.from("lessons").insert(lessonData)
        if (error) throw error
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/admin/courses/${courseId}`)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lesson ? "Edit Lesson" : "Create New Lesson"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter lesson description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderIndex">Order</Label>
              <Input
                id="orderIndex"
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number.parseInt(e.target.value))}
                min="1"
                required
              />
            </div>
          </div>

          {contentType !== "text" ? (
            <div className="space-y-2">
              <Label htmlFor="contentUrl">{contentType === "video" ? "Video URL" : "PDF URL"}</Label>
              <Input
                id="contentUrl"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder={`Enter ${contentType} URL`}
                type="url"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="contentText">Text Content</Label>
              <Textarea
                id="contentText"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Enter text content"
                rows={6}
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lesson ? "Update Lesson" : "Create Lesson"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
