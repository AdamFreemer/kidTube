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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-2 border-2 border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-blue-700 font-semibold"
          >
            <List className="h-4 w-4" />
            My Playlist 📋
            {playlist.length > 0 && (
              <Badge className="ml-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                {playlist.length}
              </Badge>
            )}
          </Button>
          {playlist.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPlaylist}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Video Grid with Playlist Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((video, index) => (
          <div key={index} className="relative">
            <div className="group bg-white rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
              {/* Video Thumbnail */}
              <div
                className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100 cursor-pointer"
                onClick={() => onVideoClick(video)}
              >
                <img
                  src={video.thumbnail || "/placeholder.svg?height=180&width=320"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/50 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                    <Play className="h-8 w-8 fill-current" />
                  </div>
                </div>
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                  {video.duration}
                </div>
                {/* Playlist Button */}
                <div className="absolute top-3 right-3">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      isInPlaylist(video) ? removeFromPlaylist(video) : addToPlaylist(video)
                    }}
                    className={`h-10 w-10 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg ${
                      isInPlaylist(video)
                        ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        : "bg-white/90 hover:bg-white text-purple-600 border-2 border-purple-300"
                    }`}
                  >
                    {isInPlaylist(video) ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5 bg-gradient-to-br from-white to-blue-50">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 text-purple-800 group-hover:text-pink-600 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center text-blue-600 text-sm mb-2 font-medium">
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
        <Card className="mt-8 border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="border-b border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-800">
              <List className="h-6 w-6" />
              My Playlist ({playlist.length} videos) 🎵
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {playlist.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-blue-600 font-semibold text-lg">No videos in playlist yet!</p>
                <p className="text-blue-500 mt-2">Click the + button on any video to add it! ✨</p>
              </div>
            ) : (
              <div className="space-y-4">
                {playlist.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border-2 border-blue-100 shadow-md"
                  >
                    <img
                      src={video.thumbnail || "/placeholder.svg?height=60&width=80"}
                      alt={video.title}
                      className="w-24 h-18 object-cover rounded-lg cursor-pointer shadow-md"
                      onClick={() => onVideoClick(video)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base truncate text-purple-800">{video.title}</h4>
                      <p className="text-sm text-blue-600 truncate font-medium">{video.channelTitle}</p>
                      <p className="text-sm text-blue-500">{video.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onVideoClick(video)}
                        className="h-10 w-10 p-0 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => removeFromPlaylist(video)}
                        className="h-10 w-10 p-0 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg"
                      >
                        <Minus className="h-4 w-4" />
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
