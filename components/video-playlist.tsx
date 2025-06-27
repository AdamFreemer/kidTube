"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Play, List, Trash2 } from "lucide-react"

interface VideoRecommendation {
  title: string
  url: string
  description: string
  thumbnail: string
  channelTitle: string
  duration: string
}

interface VideoPlaylistProps {
  recommendations: VideoRecommendation[]
  onVideoClick: (video: VideoRecommendation) => void
}

export function VideoPlaylist({ recommendations, onVideoClick }: VideoPlaylistProps) {
  const [playlist, setPlaylist] = useState<VideoRecommendation[]>([])
  const [showPlaylist, setShowPlaylist] = useState(false)

  const addToPlaylist = (video: VideoRecommendation) => {
    if (!playlist.find((v) => v.url === video.url)) {
      setPlaylist((prev) => [...prev, video])
    }
  }

  const removeFromPlaylist = (video: VideoRecommendation) => {
    setPlaylist((prev) => prev.filter((v) => v.url !== video.url))
  }

  const isInPlaylist = (video: VideoRecommendation) => {
    return playlist.some((v) => v.url === video.url)
  }

  const clearPlaylist = () => {
    setPlaylist([])
  }

  return (
    <div className="space-y-6">
      {/* Playlist Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <List className="h-4 w-4" />
            My Playlist
            {playlist.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-700">
                {playlist.length}
              </Badge>
            )}
          </Button>
          {playlist.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPlaylist}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Video Grid with Playlist Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((video, index) => (
          <div key={index} className="relative">
            <div className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => onVideoClick(video)}>
                <img
                  src={video.thumbnail || "/placeholder.svg?height=180&width=320"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-gray-900 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-6 w-6 fill-current" />
                  </div>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                {/* Playlist Button */}
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant={isInPlaylist(video) ? "default" : "secondary"}
                    onClick={(e) => {
                      e.stopPropagation()
                      isInPlaylist(video) ? removeFromPlaylist(video) : addToPlaylist(video)
                    }}
                    className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isInPlaylist(video)
                        ? "bg-gray-900 hover:bg-gray-800 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {isInPlaylist(video) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-gray-700 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <span className="truncate">{video.channelTitle}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{video.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist Panel */}
      {showPlaylist && (
        <Card className="mt-6 border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <List className="h-5 w-5" />
              My Playlist ({playlist.length} videos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {playlist.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No videos in playlist. Click the + button on any video to add it!
              </p>
            ) : (
              <div className="space-y-3">
                {playlist.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <img
                      src={video.thumbnail || "/placeholder.svg?height=60&width=80"}
                      alt={video.title}
                      className="w-20 h-15 object-cover rounded cursor-pointer"
                      onClick={() => onVideoClick(video)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">{video.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{video.channelTitle}</p>
                      <p className="text-xs text-gray-400">{video.duration}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onVideoClick(video)}
                        className="h-8 w-8 p-0 hover:bg-gray-200"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromPlaylist(video)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
