"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, ImageIcon, Music, Video, File } from "lucide-react"
import { createMediaFile, isValidMediaFile, formatFileSize, getFullImage, type MediaFile } from "@/lib/media-utils"

interface MediaUploaderProps {
  onMediaAdd: (media: MediaFile) => void
  onMediaRemove: (mediaId: string) => void
  mediaFiles: MediaFile[]
}

export function MediaUploader({ onMediaAdd, onMediaRemove, mediaFiles }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress("Processing files...")

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Processing ${file.name} (${i + 1}/${files.length})...`)

        if (!isValidMediaFile(file)) {
          alert(`Invalid file: ${file.name}. Please upload images (max 5MB), audio, or video files (max 10MB).`)
          continue
        }

        try {
          const mediaFile = await createMediaFile(file)
          onMediaAdd(mediaFile)
        } catch (error) {
          console.error("Error processing file:", error)
          if (error instanceof Error && error.message.includes("too large")) {
            alert(error.message)
          } else {
            alert(`Error processing ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        }
      }
    } catch (error) {
      console.error("Error handling files:", error)
      alert("An error occurred while processing files. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getMediaIcon = (type: MediaFile["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getImageSrc = (media: MediaFile): string => {
    if (media.type === "image") {
      // Try to get full image first, fallback to thumbnail
      return (
        getFullImage(media.id) || media.thumbnail || media.url || "/placeholder.svg?height=128&width=200&text=Image"
      )
    }
    return media.url || "/placeholder.svg?height=128&width=200&text=Media"
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop media files here, or{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Images: max 5MB (JPEG, PNG, GIF, WebP)
          <br />
          Audio/Video: max 10MB (MP3, WAV, MP4, WebM)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="text-center text-gray-600">
          <div className="animate-pulse">{uploadProgress}</div>
        </div>
      )}

      {mediaFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Media ({mediaFiles.length})</h4>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {mediaFiles.map((media) => (
              <Card key={media.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getMediaIcon(media.type)}
                    <div>
                      <p className="font-medium text-sm truncate max-w-48">{media.name}</p>
                      <p className="text-xs text-gray-500">
                        {media.type} • {formatFileSize(media.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onMediaRemove(media.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview */}
                <div className="mt-3">
                  {media.type === "image" && (
                    <img
                      src={getImageSrc(media) || "/placeholder.svg"}
                      alt={media.name}
                      className="max-w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=128&width=200&text=Image+Error"
                      }}
                    />
                  )}
                  {media.type === "audio" && media.url && (
                    <audio controls className="w-full">
                      <source src={media.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {media.type === "video" && media.url && (
                    <video controls className="w-full max-h-48">
                      <source src={media.url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
