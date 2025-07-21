"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { generateMarkdownFromPost, downloadMarkdownFile, getStoredMarkdownFile } from "@/lib/markdown-generator"
import type { JournalPost } from "@/lib/journal-data"

interface MarkdownDownloadButtonProps {
  post: JournalPost
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  showIcon?: boolean
  children?: React.ReactNode
}

export function MarkdownDownloadButton({
  post,
  variant = "outline",
  size = "sm",
  showIcon = true,
  children,
}: MarkdownDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      // Try to get stored markdown file first
      let markdownFile = getStoredMarkdownFile(post.id)

      // If not found or outdated, generate new one
      if (!markdownFile || new Date(post.updatedAt) > new Date()) {
        markdownFile = generateMarkdownFromPost(post)
      }

      downloadMarkdownFile(markdownFile)
    } catch (error) {
      console.error("Failed to download markdown file:", error)
      alert("Failed to generate markdown file. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={isGenerating} className="gap-2">
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : showIcon ? <FileText className="h-4 w-4" /> : null}
      {children || (isGenerating ? "Generating..." : "Download .md")}
    </Button>
  )
}
