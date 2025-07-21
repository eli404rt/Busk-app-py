export interface MediaFile {
  id: string
  name: string
  type: "image" | "audio" | "video"
  url?: string // Make optional since we'll store differently
  size: number
  thumbnail?: string // For images, store a smaller thumbnail
}

export function createMediaFile(file: File): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const mediaFile: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: getMediaType(file.type),
          size: file.size,
        }

        // For images, create a thumbnail and store the full image separately
        if (file.type.startsWith("image/")) {
          const { thumbnail, fullImage } = await createImageThumbnail(file)
          mediaFile.thumbnail = thumbnail
          // Store full image in a separate localStorage key
          storeFullImage(mediaFile.id, fullImage)
          mediaFile.url = fullImage // Keep for immediate use
        } else {
          // For non-images, store as before but with size limits
          if (file.size > 10 * 1024 * 1024) {
            // 10MB limit for audio/video
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB for audio/video files.`)
          }
          mediaFile.url = reader.result as string
        }

        resolve(mediaFile)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function createImageThumbnail(file: File): Promise<{ thumbnail: string; fullImage: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = () => {
      try {
        // Create thumbnail (max 200x200)
        const maxThumbnailSize = 200
        let { width, height } = img

        if (width > height) {
          if (width > maxThumbnailSize) {
            height = (height * maxThumbnailSize) / width
            width = maxThumbnailSize
          }
        } else {
          if (height > maxThumbnailSize) {
            width = (width * maxThumbnailSize) / height
            height = maxThumbnailSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        const thumbnail = canvas.toDataURL("image/jpeg", 0.7)

        // Create compressed full image (max 800x800)
        const maxFullSize = 800
        let fullWidth = img.width
        let fullHeight = img.height

        if (fullWidth > fullHeight) {
          if (fullWidth > maxFullSize) {
            fullHeight = (fullHeight * maxFullSize) / fullWidth
            fullWidth = maxFullSize
          }
        } else {
          if (fullHeight > maxFullSize) {
            fullWidth = (fullWidth * maxFullSize) / fullHeight
            fullHeight = maxFullSize
          }
        }

        canvas.width = fullWidth
        canvas.height = fullHeight
        ctx.drawImage(img, 0, 0, fullWidth, fullHeight)
        const fullImage = canvas.toDataURL("image/jpeg", 0.8)

        resolve({ thumbnail, fullImage })
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error("Failed to load image"))

    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function storeFullImage(mediaId: string, imageData: string): void {
  try {
    localStorage.setItem(`media_${mediaId}`, imageData)
  } catch (error) {
    console.warn(`Failed to store full image for ${mediaId}:`, error)
    // If storage fails, we'll just use the thumbnail
  }
}

export function getFullImage(mediaId: string): string | null {
  try {
    return localStorage.getItem(`media_${mediaId}`)
  } catch (error) {
    console.warn(`Failed to retrieve full image for ${mediaId}:`, error)
    return null
  }
}

export function removeStoredImage(mediaId: string): void {
  try {
    localStorage.removeItem(`media_${mediaId}`)
  } catch (error) {
    console.warn(`Failed to remove stored image for ${mediaId}:`, error)
  }
}

function getMediaType(mimeType: string): "image" | "audio" | "video" {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType.startsWith("video/")) return "video"
  return "image" // fallback
}

export function isValidMediaFile(file: File): boolean {
  const validTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Audio
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",
  ]

  const maxImageSize = 5 * 1024 * 1024 // 5MB for images
  const maxOtherSize = 10 * 1024 * 1024 // 10MB for audio/video

  if (!validTypes.includes(file.type)) {
    return false
  }

  if (file.type.startsWith("image/") && file.size > maxImageSize) {
    return false
  }

  if (!file.type.startsWith("image/") && file.size > maxOtherSize) {
    return false
  }

  return true
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Utility to clean up orphaned media files
export function cleanupOrphanedMedia(usedMediaIds: string[]): void {
  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("media_")) {
        const mediaId = key.replace("media_", "")
        if (!usedMediaIds.includes(mediaId)) {
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
    console.log(`Cleaned up ${keysToRemove.length} orphaned media files`)
  } catch (error) {
    console.warn("Failed to cleanup orphaned media:", error)
  }
}
