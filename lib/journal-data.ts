import type { MediaFile } from "./media-utils"
import { removeStoredImage, cleanupOrphanedMedia } from "./media-utils"
import { generateMarkdownFromPost, storeMarkdownFile, removeStoredMarkdownFile } from "./markdown-generator"

export interface JournalPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  updatedAt: string
  tags: string[]
  category: string
  featured: boolean
  published: boolean
  views: number
  mediaFiles?: MediaFile[]
}

export interface Comment {
  id: string
  postId: string
  author: string
  email: string
  content: string
  createdAt: string
  approved: boolean
}

// Default journal posts data
const defaultJournalPosts: JournalPost[] = [
  {
    id: "1",
    title: "The Philosophy of Art and Life",
    slug: "philosophy-of-art-and-life",
    excerpt: "Exploring the deep connection between artistic expression and the meaning of existence.",
    content: `# The Philosophy of Art and Life

Art is not merely decoration or entertainment—it is the very essence of human expression and understanding. When we create, we touch something divine within ourselves.

## The Creative Process

The act of creation is both deeply personal and universally human. It connects us to:

- Our innermost thoughts and feelings
- The collective human experience
- The divine spark of creativity
- The eternal quest for meaning

## Art as Life's Purpose

Perhaps the greatest tragedy is not pursuing one's artistic calling. As the saying goes, "pity you didn't dedicate your life to Art"—for in art, we find not just expression, but purpose itself.

The equation LIFE⁴ (ART) = ¹LOVE suggests that life raised to the fourth power through art equals pure love. This mathematical poetry captures the transformative power of creative expression.

## Conclusion

Every moment we don't create is a moment we're not fully alive. Art isn't just what we do—it's who we are.`,
    author: "Eli Cadieux",
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    tags: ["philosophy", "art", "creativity"],
    category: "Philosophy",
    featured: true,
    published: true,
    views: 1247,
    mediaFiles: [],
  },
  {
    id: "2",
    title: "Music as the Universal Language",
    slug: "music-universal-language",
    excerpt: "How music transcends barriers and connects souls across cultures and time.",
    content: `# Music as the Universal Language

Music speaks where words fail. It's the one language that every human heart understands, regardless of culture, age, or background.

## The Power of Melody

A simple melody can:
- Evoke memories from decades past
- Bring strangers together in harmony
- Express emotions too complex for words
- Heal wounds that time cannot touch

## Rhythm of Life

Every heartbeat is a drum, every breath a note. We are all musicians in the grand symphony of existence.

## Request a Song

Music is meant to be shared. If there's a song that speaks to your soul, don't hesitate to request it. Let's create a playlist of human experience together.`,
    author: "Eli Cadieux",
    publishedAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    tags: ["music", "culture", "connection"],
    category: "Music",
    featured: false,
    published: true,
    views: 892,
    mediaFiles: [],
  },
  {
    id: "3",
    title: "The Digital Canvas: Art in the Modern Age",
    slug: "digital-canvas-modern-art",
    excerpt: "Exploring how technology has transformed artistic expression and creativity.",
    content: `# The Digital Canvas: Art in the Modern Age

The digital revolution has not killed traditional art—it has expanded its possibilities infinitely.

## New Mediums, Timeless Expression

Digital tools offer artists:
- Unlimited colors and textures
- The ability to undo and iterate
- Global reach and instant sharing
- Collaborative possibilities

## The Instagram Generation

Social media platforms like Instagram have democratized art sharing. Every post is a potential masterpiece, every story a canvas for creativity.

## Preserving the Human Touch

Despite technological advances, the most powerful art still comes from the human heart. Technology is just the brush—the artist's soul is still the paint.`,
    author: "Eli Cadieux",
    publishedAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z",
    tags: ["digital art", "technology", "social media"],
    category: "Technology",
    featured: false,
    published: true,
    views: 654,
    mediaFiles: [],
  },
]

// Storage key
const STORAGE_KEY = "journalPosts"
const STORAGE_VERSION_KEY = "journalPostsVersion"

// Use localStorage for persistence with fallback and error handling
function getJournalPostsFromStorage(): JournalPost[] {
  if (typeof window === "undefined") return defaultJournalPosts

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const posts = JSON.parse(stored)
      if (Array.isArray(posts) && posts.length > 0) {
        return posts
      }
    }
  } catch (error) {
    console.warn("Failed to load journal posts from storage:", error)
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_VERSION_KEY)
    } catch (e) {
      console.warn("Failed to clear corrupted data:", e)
    }
  }

  // Initialize localStorage with default posts and generate their markdown files
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultJournalPosts))
    localStorage.setItem(STORAGE_VERSION_KEY, Date.now().toString())

    // Generate markdown files for default posts
    defaultJournalPosts.forEach((post) => {
      const markdownFile = generateMarkdownFromPost(post)
      storeMarkdownFile(post.id, markdownFile)
    })
  } catch (error) {
    console.warn("Failed to initialize journal posts in storage:", error)
  }

  return defaultJournalPosts
}

function saveJournalPostsToStorage(posts: JournalPost[]): void {
  if (typeof window === "undefined") return

  try {
    // Create a copy without full image URLs to save space
    const postsToSave = posts.map((post) => ({
      ...post,
      mediaFiles: post.mediaFiles?.map((media) => ({
        ...media,
        // Keep only thumbnail for images, remove full URL to save space
        url: media.type === "image" ? undefined : media.url,
      })),
    }))

    const dataString = JSON.stringify(postsToSave)

    // Check if the data is too large (leave some buffer)
    if (dataString.length > 4.5 * 1024 * 1024) {
      // 4.5MB limit
      throw new Error("Data too large for localStorage")
    }

    localStorage.setItem(STORAGE_KEY, dataString)
    localStorage.setItem(STORAGE_VERSION_KEY, Date.now().toString())

    // Trigger storage event for cross-tab updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: dataString,
        oldValue: null,
        storageArea: localStorage,
      }),
    )

    console.log(`Saved ${posts.length} journal posts to storage`)
  } catch (error) {
    console.error("Failed to save journal posts to storage:", error)

    if (error instanceof Error && error.message.includes("quota")) {
      // Try to free up space by cleaning up orphaned media
      const allMediaIds = posts.flatMap((post) => post.mediaFiles?.map((media) => media.id) || [])
      cleanupOrphanedMedia(allMediaIds)

      // Try saving again
      try {
        const postsToSave = posts.map((post) => ({
          ...post,
          mediaFiles: post.mediaFiles?.map((media) => ({
            ...media,
            url: media.type === "image" ? undefined : media.url,
          })),
        }))
        const dataString = JSON.stringify(postsToSave)
        localStorage.setItem(STORAGE_KEY, dataString)
        localStorage.setItem(STORAGE_VERSION_KEY, Date.now().toString())
      } catch (retryError) {
        alert("Storage quota exceeded. Please remove some media files or entries.")
        throw retryError
      }
    } else {
      throw error
    }
  }
}

export const comments: Comment[] = [
  {
    id: "1",
    postId: "1",
    author: "Sarah Johnson",
    email: "sarah@example.com",
    content: "This really resonates with me. I've been struggling with whether to pursue my art full-time.",
    createdAt: "2024-01-16T08:30:00Z",
    approved: true,
  },
  {
    id: "2",
    postId: "1",
    author: "Mike Chen",
    email: "mike@example.com",
    content: "Beautiful perspective on the relationship between art and life. Thank you for sharing.",
    createdAt: "2024-01-16T12:45:00Z",
    approved: true,
  },
]

// Helper functions - all now call getJournalPostsFromStorage() directly for fresh data
export function getJournalPosts(): JournalPost[] {
  const posts = getJournalPostsFromStorage()
  console.log(`Retrieved ${posts.length} total posts, ${posts.filter((p) => p.published).length} published`)
  return posts.filter((post) => post.published)
}

export function getAllJournalPosts(): JournalPost[] {
  const posts = getJournalPostsFromStorage()
  console.log(`Retrieved all ${posts.length} journal posts`)
  return posts
}

export function getFeaturedJournalPosts(): JournalPost[] {
  return getJournalPostsFromStorage().filter((post) => post.published && post.featured)
}

export function getJournalPostBySlug(slug: string): JournalPost | undefined {
  const posts = getJournalPostsFromStorage()
  const post = posts.find((post) => post.slug === slug && post.published)
  console.log(`Looking for post with slug "${slug}":`, post ? "found" : "not found")
  return post
}

export function getJournalPostById(id: string): JournalPost | undefined {
  const posts = getJournalPostsFromStorage()
  const post = posts.find((post) => post.id === id)
  console.log(`Looking for post with id "${id}":`, post ? "found" : "not found")
  return post
}

export function getJournalPostsByCategory(category: string): JournalPost[] {
  return getJournalPostsFromStorage().filter((post) => post.published && post.category === category)
}

export function getJournalPostsByTag(tag: string): JournalPost[] {
  return getJournalPostsFromStorage().filter((post) => post.published && post.tags.includes(tag))
}

export function searchJournalPosts(query: string): JournalPost[] {
  const lowercaseQuery = query.toLowerCase()
  return getJournalPostsFromStorage().filter(
    (post) =>
      post.published &&
      (post.title.toLowerCase().includes(lowercaseQuery) ||
        post.excerpt.toLowerCase().includes(lowercaseQuery) ||
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))),
  )
}

export function getCommentsByPostId(postId: string): Comment[] {
  return comments.filter((comment) => comment.postId === postId && comment.approved)
}

export function getAllCategories(): string[] {
  const categories = getJournalPostsFromStorage().map((post) => post.category)
  return [...new Set(categories)]
}

export function getAllTags(): string[] {
  const tags = getJournalPostsFromStorage().flatMap((post) => post.tags)
  return [...new Set(tags)]
}

export function addJournalPost(post: Omit<JournalPost, "id" | "publishedAt" | "updatedAt" | "views">): JournalPost {
  const posts = getJournalPostsFromStorage()
  const newPost: JournalPost = {
    ...post,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
  }

  console.log("Adding new journal post:", newPost.title, "ID:", newPost.id)
  posts.unshift(newPost)
  saveJournalPostsToStorage(posts)

  // Generate and store markdown file
  try {
    const markdownFile = generateMarkdownFromPost(newPost)
    storeMarkdownFile(newPost.id, markdownFile)
    console.log(`Generated markdown file: ${markdownFile.filename}`)
  } catch (error) {
    console.warn("Failed to generate markdown file:", error)
  }

  console.log(`Total posts after adding: ${posts.length}`)
  return newPost
}

export function updateJournalPost(id: string, updates: Partial<JournalPost>): JournalPost | null {
  const posts = getJournalPostsFromStorage()
  const index = posts.findIndex((post) => post.id === id)

  console.log(`Updating post with ID: ${id}, found at index: ${index}`)

  if (index !== -1) {
    // Clean up old media files that are no longer used
    const oldMediaFiles = posts[index].mediaFiles || []
    const newMediaFiles = updates.mediaFiles || []
    const removedMediaFiles = oldMediaFiles.filter(
      (oldMedia) => !newMediaFiles.some((newMedia) => newMedia.id === oldMedia.id),
    )

    // Remove stored images for removed media files
    removedMediaFiles.forEach((media) => {
      if (media.type === "image") {
        removeStoredImage(media.id)
      }
    })

    posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() }
    saveJournalPostsToStorage(posts)

    // Regenerate markdown file
    try {
      const markdownFile = generateMarkdownFromPost(posts[index])
      storeMarkdownFile(posts[index].id, markdownFile)
      console.log(`Updated markdown file: ${markdownFile.filename}`)
    } catch (error) {
      console.warn("Failed to update markdown file:", error)
    }

    console.log("Post updated successfully")
    return posts[index]
  }

  console.log("Post not found for update")
  return null
}

export function deleteJournalPost(id: string): void {
  const posts = getJournalPostsFromStorage()
  const postToDelete = posts.find((post) => post.id === id)

  console.log(`Deleting post with ID: ${id}`, postToDelete ? `(${postToDelete.title})` : "(not found)")

  // Clean up associated media files
  if (postToDelete?.mediaFiles) {
    postToDelete.mediaFiles.forEach((media) => {
      if (media.type === "image") {
        removeStoredImage(media.id)
      }
    })
  }

  // Remove stored markdown file
  removeStoredMarkdownFile(id)

  const filtered = posts.filter((post) => post.id !== id)
  console.log(`Posts before delete: ${posts.length}, after delete: ${filtered.length}`)

  saveJournalPostsToStorage(filtered)
}

// Utility function to force refresh data (useful for debugging)
export function refreshJournalData(): JournalPost[] {
  console.log("Force refreshing journal data...")
  return getJournalPostsFromStorage()
}

// Function to check storage version (useful for debugging)
export function getStorageVersion(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_VERSION_KEY)
}
