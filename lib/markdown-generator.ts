import type { JournalPost } from "./journal-data"

export interface MarkdownFile {
  filename: string
  content: string
  createdAt: string
  blob?: Blob
  url?: string
}

export function generateMarkdownFromPost(post: JournalPost): MarkdownFile {
  const frontmatter = `---
title: "${post.title}"
slug: "${post.slug}"
author: "${post.author}"
publishedAt: "${post.publishedAt}"
updatedAt: "${post.updatedAt}"
category: "${post.category}"
tags: [${post.tags.map((tag) => `"${tag}"`).join(", ")}]
featured: ${post.featured}
published: ${post.published}
views: ${post.views}
excerpt: "${post.excerpt}"
---

`

  let content = frontmatter

  // Add media files section if present
  if (post.mediaFiles && post.mediaFiles.length > 0) {
    content += "## Media Files\n\n"
    post.mediaFiles.forEach((media) => {
      if (media.type === "image") {
        content += `![${media.name}](${media.thumbnail || media.url || ""})\n\n`
      } else if (media.type === "audio") {
        content += `**Audio:** [${media.name}](${media.url || ""})\n\n`
      } else if (media.type === "video") {
        content += `**Video:** [${media.name}](${media.url || ""})\n\n`
      }
    })
    content += "---\n\n"
  }

  // Add the main content
  content += post.content

  // Add metadata footer
  content += `\n\n---\n\n**Published:** ${new Date(post.publishedAt).toLocaleDateString()}\n`
  content += `**Category:** ${post.category}\n`
  content += `**Tags:** ${post.tags.join(", ")}\n`
  content += `**Views:** ${post.views}\n`

  return {
    filename: `${post.slug}.md`,
    content,
    createdAt: new Date().toISOString(),
  }
}

export function downloadMarkdownFile(post: JournalPost): void {
  const markdownFile = generateMarkdownFromPost(post)

  const blob = new Blob([markdownFile.content], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = markdownFile.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generateBulkMarkdown(posts: JournalPost[]): string {
  let content = `# Journal Archive\n\nGenerated on ${new Date().toLocaleDateString()}\n\n`
  content += `Total posts: ${posts.length}\n\n---\n\n`

  posts.forEach((post, index) => {
    content += `# ${index + 1}. ${post.title}\n\n`
    content += `**Author:** ${post.author}\n`
    content += `**Published:** ${new Date(post.publishedAt).toLocaleDateString()}\n`
    content += `**Category:** ${post.category}\n`
    content += `**Tags:** ${post.tags.join(", ")}\n\n`
    content += `${post.content}\n\n`
    content += `---\n\n`
  })

  return content
}

export function downloadBulkMarkdown(posts: JournalPost[]): void {
  const content = generateBulkMarkdown(posts)

  const blob = new Blob([content], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `journal-archive-${new Date().toISOString().split("T")[0]}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// Adding the missing exports that were causing the deployment error
export function generateAllPostsMarkdown(posts: JournalPost[]): MarkdownFile {
  const indexContent = `# Journal Posts Index

Generated on: ${new Date().toLocaleDateString()}

Total Posts: ${posts.length}

## Posts

${posts
  .map(
    (post) => `
### [${post.title}](${post.slug}.md)

**Published:** ${new Date(post.publishedAt).toLocaleDateString()}  
**Category:** ${post.category}  
**Tags:** ${post.tags.join(", ")}  

${post.excerpt}

---
`,
  )
  .join("\n")}
`

  const filename = "journal-index.md"
  const blob = new Blob([indexContent], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)

  return {
    filename,
    content: indexContent,
    createdAt: new Date().toISOString(),
    blob,
    url,
  }
}

export function generateMarkdownArchive(posts: JournalPost[]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create a simple text archive of all posts
      const archiveContent = posts
        .map((post) => {
          const markdown = generateMarkdownFromPost(post)
          return `
================================================================================
FILE: ${markdown.filename}
================================================================================

${markdown.content}

`
        })
        .join("\n")

      const indexMarkdown = generateAllPostsMarkdown(posts)
      const fullArchive = `${indexMarkdown.content}\n\n${archiveContent}`

      const blob = new Blob([fullArchive], { type: "text/plain" })
      resolve(blob)
    } catch (error) {
      reject(error)
    }
  })
}

// Storage functions for markdown files
const MARKDOWN_STORAGE_KEY = "markdownFiles"

export function storeMarkdownFile(postId: string, markdownFile: MarkdownFile): void {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(MARKDOWN_STORAGE_KEY)
    const markdownFiles = stored ? JSON.parse(stored) : {}

    markdownFiles[postId] = markdownFile
    localStorage.setItem(MARKDOWN_STORAGE_KEY, JSON.stringify(markdownFiles))
  } catch (error) {
    console.warn("Failed to store markdown file:", error)
  }
}

export function getStoredMarkdownFile(postId: string): MarkdownFile | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(MARKDOWN_STORAGE_KEY)
    if (stored) {
      const markdownFiles = JSON.parse(stored)
      return markdownFiles[postId] || null
    }
  } catch (error) {
    console.warn("Failed to retrieve markdown file:", error)
  }

  return null
}

export function removeStoredMarkdownFile(postId: string): void {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(MARKDOWN_STORAGE_KEY)
    if (stored) {
      const markdownFiles = JSON.parse(stored)
      delete markdownFiles[postId]
      localStorage.setItem(MARKDOWN_STORAGE_KEY, JSON.stringify(markdownFiles))
    }
  } catch (error) {
    console.warn("Failed to remove markdown file:", error)
  }
}
