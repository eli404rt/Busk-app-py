"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { isAuthenticated } from "@/lib/auth"
import { getJournalPostById, updateJournalPost } from "@/lib/journal-data"
import { MediaUploader } from "@/components/media-uploader"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownDownloadButton } from "@/components/markdown-download-button"
import type { MediaFile } from "@/lib/media-utils"
import type { JournalPost } from "@/lib/journal-data"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const [formData, setFormData] = useState<Omit<JournalPost, "id" | "publishedAt" | "updatedAt" | "views"> | null>(null)
  const [originalPost, setOriginalPost] = useState<JournalPost | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin")
      return
    }

    const post = getJournalPostById(id)
    if (post) {
      setOriginalPost(post)
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        tags: post.tags.join(", "),
        category: post.category,
        featured: post.featured,
        published: post.published,
      })
      setMediaFiles(post.mediaFiles || [])
    } else {
      router.push("/admin/dashboard")
    }
    setLoading(false)
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting || !formData) return

    setIsSubmitting(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required")
      }
      if (!formData.excerpt.trim()) {
        throw new Error("Excerpt is required")
      }
      if (!formData.category.trim()) {
        throw new Error("Category is required")
      }

      const slug =
        formData.slug.trim() ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

      const updatedPostData = {
        ...formData,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        slug,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        mediaFiles: [...mediaFiles],
      }

      console.log("Updating journal post:", updatedPostData)

      const updatedPost = updateJournalPost(id, updatedPostData)
      if (!updatedPost) {
        throw new Error("Failed to update journal entry")
      }

      console.log("Journal post updated:", updatedPost)

      // Show success message
      alert(`Journal entry "${updatedPost.title}" updated successfully! Markdown file has been regenerated.`)

      // Navigate back to dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error updating post:", error)
      setError(error instanceof Error ? error.message : "Failed to update journal entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => (prev ? { ...prev, content } : null))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => (prev ? { ...prev, [name]: checked } : null))
  }

  const handleMediaAdd = (media: MediaFile) => {
    console.log("Adding media:", media)
    setMediaFiles((prev) => [...prev, media])
  }

  const handleMediaRemove = (mediaId: string) => {
    console.log("Removing media:", mediaId)
    setMediaFiles((prev) => prev.filter((media) => media.id !== mediaId))
  }

  if (loading || !formData || !originalPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Journal Entry</h1>
              <p className="text-gray-600 mt-1">Markdown file will be updated automatically</p>
            </div>
            <MarkdownDownloadButton post={originalPost} variant="outline" size="default">
              Download Current .md
            </MarkdownDownloadButton>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Journal Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter post title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="auto-generated from title"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Input
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description of the post"
                  required
                />
              </div>

              <div>
                <Label>Content (Markdown)</Label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your post content in Markdown..."
                />
              </div>

              <div>
                <Label>Media Files</Label>
                <MediaUploader onMediaAdd={handleMediaAdd} onMediaRemove={handleMediaRemove} mediaFiles={mediaFiles} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Philosophy, Music, Technology"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., art, creativity, life"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={handleSwitchChange("featured")}
                    />
                    <Label htmlFor="featured">Featured Entry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={handleSwitchChange("published")}
                    />
                    <Label htmlFor="published">Publish Immediately</Label>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Updating..." : "Update Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
