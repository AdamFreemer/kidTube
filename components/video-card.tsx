"use client"

import { Play, ExternalLink, User } from "lucide-react"
import Image from "next/image"

interface VideoRecommendation {
  title: string
  url: string
  description: string
  thumbnail: string
  channelTitle: string
  duration: string
}

interface VideoCardProps {
  video: VideoRecommendation
  onVideoClick: (video: VideoRecommendation) => void
}

export function VideoCard({ video, onVideoClick }: VideoCardProps) {
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => onVideoClick(video)}>
        <Image
          src={video.thumbnail || "/placeholder.svg?height=180&width=320"}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {video.title}
        </h3>

        {/* Channel Info */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <User className="h-3 w-3 mr-1" />
          <span className="truncate">{video.channelTitle}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{video.description}</p>

        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          onClick={(e) => e.stopPropagation()} // Prevent triggering the modal when clicking the link
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          Watch on YouTube
        </a>
      </div>
    </div>
  )
}
