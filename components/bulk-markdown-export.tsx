"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileArchive, Loader2, FileText } from "lucide-react"
import { generateAllPostsMarkdown, generateMarkdownArchive, downloadMarkdownFile } from "@/lib/markdown-generator"
import { getAllJournalPosts } from "@/lib/journal-data"

export function BulkMarkdownExport() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportType, setExportType] = useState<"index" | "archive" | null>(null)

  const handleExportIndex = async () => {
    setIsGenerating(true)
    setExportType("index")

    try {
      const posts = getAllJournalPosts()
      const indexFile = generateAllPostsMarkdown(posts)
      downloadMarkdownFile(indexFile)
    } catch (error) {
      console.error("Failed to export index:", error)
      alert("Failed to generate index file. Please try again.")
    } finally {
      setIsGenerating(false)
      setExportType(null)
    }
  }

  const handleExportArchive = async () => {
    setIsGenerating(true)
    setExportType("archive")

    try {
      const posts = getAllJournalPosts()
      const archiveBlob = await generateMarkdownArchive(posts)

      const url = URL.createObjectURL(archiveBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `journal-archive-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export archive:", error)
      alert("Failed to generate archive file. Please try again.")
    } finally {
      setIsGenerating(false)
      setExportType(null)
    }
  }

  const posts = getAllJournalPosts()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5" />
          Bulk Markdown Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Export all journal entries ({posts.length} posts) as markdown files.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleExportIndex}
            disabled={isGenerating}
            className="flex-1 bg-transparent"
          >
            {isGenerating && exportType === "index" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export Index
          </Button>

          <Button
            variant="outline"
            onClick={handleExportArchive}
            disabled={isGenerating}
            className="flex-1 bg-transparent"
          >
            {isGenerating && exportType === "archive" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export All Posts
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Index:</strong> Creates a table of contents with links to individual posts
          </p>
          <p>
            <strong>All Posts:</strong> Creates a single file containing all posts and metadata
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
