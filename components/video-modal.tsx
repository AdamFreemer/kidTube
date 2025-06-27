"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"

interface VideoRecommendation {
  title: string
  url: string
  description: string
  thumbnail: string
  channelTitle: string
  duration: string
}

interface VideoModalProps {
  video: VideoRecommendation | null
  onClose: () => void
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (video) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [video, onClose])

  if (!video) return null

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const videoId = getVideoId(video.url)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-orange-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-xl font-bold text-purple-800 truncate pr-4">{video.title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(video.url, "_blank")}
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              YouTube
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Video Content */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          {videoId ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-gray-500 font-medium">Unable to load video preview</p>
            </div>
          )}

          {/* Video Info */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-600 font-semibold">
                <span className="text-purple-600">Channel:</span> {video.channelTitle}
              </p>
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {video.duration}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{video.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
