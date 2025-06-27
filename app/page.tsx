"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Play, Code, ChevronDown, ChevronUp, LogOut } from "lucide-react"
import { VideoModal } from "@/components/video-modal"
import { VideoPlaylist } from "@/components/video-playlist"
import { AuthModal } from "@/components/auth-modal"

interface VideoRecommendation {
  title: string
  url: string
  description: string
  thumbnail: string
  channelTitle: string
  duration: string
}

interface DebugData {
  openaiRequest?: any
  openaiResponse?: any
  youtubeQueries?: string[]
  youtubeResults?: any[]
  error?: string
}

export default function KidTubePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [age, setAge] = useState<string>("")
  const [sex, setSex] = useState<string>("")
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<VideoRecommendation[]>([])
  const [debugData, setDebugData] = useState<DebugData>({})
  const [showDebug, setShowDebug] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoRecommendation | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("kidtube-authenticated")
      setIsAuthenticated(authStatus === "true")
      setIsCheckingAuth(false)
    }

    // Small delay to prevent flash
    setTimeout(checkAuth, 100)
  }, [])

  // When age or sex changes, filter out interests that are no longer available
  useEffect(() => {
    if (age || sex) {
      const availableInterests = getAvailableInterests()
      setInterests((prev) => prev.filter((interest) => availableInterests.includes(interest)))
    }
  }, [age, sex])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("kidtube-authenticated")
    setIsAuthenticated(false)
    // Reset form data on logout
    setAge("")
    setSex("")
    setInterests([])
    setRecommendations([])
    setDebugData({})
    setSelectedVideo(null)
  }

  // Generate age options from 3 to 15
  const ageOptions = Array.from({ length: 13 }, (_, i) => i + 3)

  // Get interests based on age and sex
  const getAvailableInterests = () => {
    const baseInterests = ["animals", "music", "sports", "art", "science", "cooking"]

    if (!age) return baseInterests

    const ageNum = Number.parseInt(age)
    let interests = [...baseInterests]

    // Age-specific interests
    if (ageNum <= 6) {
      interests = [...interests, "cartoons", "nursery rhymes", "colors", "shapes", "toys"]
    } else if (ageNum <= 10) {
      interests = [...interests, "cartoons", "games", "adventure", "dinosaurs", "space"]
    } else {
      interests = [...interests, "technology", "fashion", "movies", "books", "travel"]
    }

    // Sex-specific interests (optional additions)
    if (sex === "male") {
      interests = [...interests, "cars", "robots", "superheroes"]
    } else if (sex === "female") {
      interests = [...interests, "dance", "makeup", "princesses"]
    }

    return [...new Set(interests)].sort()
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests((prev) => [...prev, interest])
    } else {
      setInterests((prev) => prev.filter((i) => i !== interest))
    }
  }

  const handleSubmit = async () => {
    if (!age || !sex || interests.length === 0) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setDebugData({}) // Clear previous debug data

    try {
      const requestData = {
        age: Number.parseInt(age),
        sex,
        interests,
      }

      console.log("Sending request with:", requestData)

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      // Store debug data
      setDebugData(data.debug || {})

      // Show message if using fallback
      if (data.message) {
        console.log("Info:", data.message)
      }

      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error("Error details:", error)
      setDebugData({ error: error.message })
      alert(`Failed to get recommendations: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoClick = (video: VideoRecommendation) => {
    setSelectedVideo(video)
  }

  const closeModal = () => {
    setSelectedVideo(null)
  }

  const availableInterests = getAvailableInterests()

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  // Show authentication modal if not authenticated
  if (!isAuthenticated) {
    return <AuthModal onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="text-center mb-12 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">KidTube</h1>
          <p className="text-lg text-gray-600 font-normal">Find the perfect videos for your child</p>
        </div>

        {/* Form Card */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-medium text-gray-900 text-center">Tell us about your child</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Age and Sex Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Child's Age</label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map((ageOption) => (
                      <SelectItem key={ageOption} value={ageOption.toString()}>
                        {ageOption} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Child's Gender</label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interests Multi-select */}
            {availableInterests.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Interests (select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableInterests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={interests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                      />
                      <label htmlFor={interest} className="text-sm font-medium text-gray-700 capitalize cursor-pointer">
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !age || !sex || interests.length === 0}
                className="h-11 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Videos...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Get Video Recommendations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Window */}
        {Object.keys(debugData).length > 0 && (
          <Card className="mb-8 border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
                  <Code className="mr-2 h-4 w-4" />
                  Debug Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showDebug && (
              <CardContent className="space-y-4 p-6">
                {debugData.openaiRequest && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-800">OpenAI Request:</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs overflow-x-auto">
                      {JSON.stringify(debugData.openaiRequest, null, 2)}
                    </pre>
                  </div>
                )}

                {debugData.openaiResponse && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-800">OpenAI Response:</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs overflow-x-auto">
                      {JSON.stringify(debugData.openaiResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {debugData.youtubeQueries && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-800">YouTube Search Queries:</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs overflow-x-auto">
                      {JSON.stringify(debugData.youtubeQueries, null, 2)}
                    </pre>
                  </div>
                )}

                {debugData.youtubeResults && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-800">YouTube API Results:</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs overflow-x-auto max-h-64">
                      {JSON.stringify(debugData.youtubeResults, null, 2)}
                    </pre>
                  </div>
                )}

                {debugData.error && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-red-800">Error:</h4>
                    <pre className="bg-red-50 p-3 rounded border border-red-200 text-xs overflow-x-auto text-red-800">
                      {debugData.error}
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Results with Playlist Feature */}
        {recommendations.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-medium text-gray-900 text-center">Recommended Videos</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <VideoPlaylist recommendations={recommendations} onVideoClick={handleVideoClick} />
            </CardContent>
          </Card>
        )}

        {/* Video Modal */}
        <VideoModal video={selectedVideo} onClose={closeModal} />
      </div>
    </div>
  )
}
