import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface RequestBody {
  age: number
  sex: string
  interests: string[]
}

interface VideoRecommendation {
  title: string
  url: string
  description: string
  thumbnail: string
  channelTitle: string
  duration: string
}

interface DebugData {
  step?: string
  openaiRequest?: any
  openaiResponse?: any
  youtubeQueries?: string[]
  youtubeResults?: any[]
  error?: string
}

// Fallback recommendations when APIs fail
const getFallbackRecommendations = (age: number, interests: string[]): VideoRecommendation[] => {
  const fallbackVideos = [
    {
      title: "Educational Animals for Kids",
      url: "https://www.youtube.com/results?search_query=educational+animals+for+kids",
      description: "Learn about different animals and their habitats in this fun educational video.",
      thumbnail: "/placeholder.svg?height=180&width=320",
      channelTitle: "Educational Kids Channel",
      duration: "10:00",
    },
    {
      title: "Fun Science Experiments for Children",
      url: "https://www.youtube.com/results?search_query=science+experiments+for+kids",
      description: "Simple and safe science experiments that kids can do at home.",
      thumbnail: "/placeholder.svg?height=180&width=320",
      channelTitle: "Science Fun",
      duration: "8:30",
    },
    {
      title: "Kids Music and Songs",
      url: "https://www.youtube.com/results?search_query=kids+music+songs",
      description: "Catchy songs and music that children love to sing along with.",
      thumbnail: "/placeholder.svg?height=180&width=320",
      channelTitle: "Kids Music World",
      duration: "15:20",
    },
    {
      title: "Art and Crafts for Kids",
      url: "https://www.youtube.com/results?search_query=art+crafts+for+kids",
      description: "Creative art projects and crafts that kids can make themselves.",
      thumbnail: "/placeholder.svg?height=180&width=320",
      channelTitle: "Creative Kids",
      duration: "12:45",
    },
    {
      title: "Sports Activities for Children",
      url: "https://www.youtube.com/results?search_query=sports+activities+kids",
      description: "Fun sports activities and games to keep kids active and healthy.",
      thumbnail: "/placeholder.svg?height=180&width=320",
      channelTitle: "Active Kids",
      duration: "9:15",
    },
  ]

  // Add more fallback videos to reach 50
  const extendedFallbacks: VideoRecommendation[] = []
  const interestBasedVideos = interests.map((interest) => ({
    title: `${interest.charAt(0).toUpperCase() + interest.slice(1)} for Kids`,
    url: `https://www.youtube.com/results?search_query=${interest}+for+kids`,
    description: `Educational and fun content about ${interest} designed for children.`,
    thumbnail: "/placeholder.svg?height=180&width=320",
    channelTitle: `${interest.charAt(0).toUpperCase() + interest.slice(1)} Kids Channel`,
    duration: `${Math.floor(Math.random() * 15) + 5}:${Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, "0")}`,
  }))

  extendedFallbacks.push(...fallbackVideos, ...interestBasedVideos)

  // Fill remaining slots to reach 50
  while (extendedFallbacks.length < 50) {
    const randomInterest = interests[Math.floor(Math.random() * interests.length)] || "educational"
    extendedFallbacks.push({
      title: `Fun ${randomInterest} Activities for Age ${age}`,
      url: `https://www.youtube.com/results?search_query=${randomInterest}+activities+age+${age}`,
      description: `Age-appropriate ${randomInterest} content perfect for ${age}-year-olds.`,
      thumbnail: "/placeholder.svg?height=180&width=320",
      channelTitle: "Kids Learning Hub",
      duration: `${Math.floor(Math.random() * 20) + 3}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
    })
  }

  return extendedFallbacks.slice(0, 50)
}

// Function to search YouTube videos
async function searchYouTubeVideos(query: string, maxResults = 20): Promise<any[]> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "your_youtube_api_key_here") {
    console.log("YouTube API key not configured, skipping YouTube search")
    return []
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&safeSearch=strict&videoEmbeddable=true&videoSyndicated=true`,
    )

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("YouTube search error:", error)
    return []
  }
}

// Function to get video details including duration
async function getVideoDetails(videoIds: string[]): Promise<any[]> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "your_youtube_api_key_here" || videoIds.length === 0) {
    return []
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("YouTube video details error:", error)
    return []
  }
}

// Function to convert ISO 8601 duration to readable format
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return "0:00"

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}

export async function POST(request: NextRequest) {
  const debugData: DebugData = {}

  try {
    debugData.step = "Parsing request body"

    // Parse request body
    let body: RequestBody
    try {
      body = await request.json()
    } catch (error) {
      debugData.error = "Invalid JSON in request body"
      return NextResponse.json(
        {
          error: "Invalid request body",
          debug: debugData,
          recommendations: getFallbackRecommendations(8, ["educational"]),
        },
        { status: 200 },
      )
    }

    const { age, sex, interests } = body

    // Validate request body
    if (!age || !sex || !interests || !Array.isArray(interests) || interests.length === 0) {
      debugData.error = "Missing required fields: age, sex, or interests"
      return NextResponse.json(
        {
          error: "Missing required fields",
          debug: debugData,
          recommendations: getFallbackRecommendations(age || 8, interests || ["educational"]),
        },
        { status: 200 },
      )
    }

    debugData.step = "Generating OpenAI recommendations"

    let searchQueries: string[] = []

    // Try to get recommendations from OpenAI
    if (OPENAI_API_KEY && OPENAI_API_KEY !== "your_openai_api_key_here") {
      try {
        const prompt = `Generate 10 specific YouTube search queries for finding educational and entertaining videos suitable for a ${age}-year-old ${sex} child who is interested in: ${interests.join(", ")}.

Each search query should be:
- Age-appropriate and safe for children
- Educational or entertaining
- Specific enough to find quality content
- Related to their interests: ${interests.join(", ")}

Return only the search queries, one per line, without numbers or bullets.`

        debugData.openaiRequest = {
          model: "gpt-4o",
          prompt: prompt,
        }

        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt: prompt,
        })

        debugData.openaiResponse = { text }

        // Parse the response to extract search queries
        searchQueries = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !line.match(/^\d+\.?\s/))
          .slice(0, 10)

        console.log("Generated search queries:", searchQueries)
      } catch (error) {
        console.error("OpenAI API error:", error)
        debugData.error = `OpenAI error: ${error.message}`

        // Continue with fallback queries instead of failing
        searchQueries = interests.map((interest) => `${interest} for kids age ${age}`)
      }
    } else {
      debugData.error = "OpenAI API key not configured"
      // Generate fallback search queries
      searchQueries = interests.map((interest) => `${interest} for kids age ${age}`)
    }

    debugData.step = "Searching YouTube videos"
    debugData.youtubeQueries = searchQueries

    // Search YouTube for videos using the generated queries
    let allVideos: VideoRecommendation[] = []
    const youtubeResults: any[] = []

    if (searchQueries.length > 0) {
      try {
        // Search for videos using each query
        for (const query of searchQueries.slice(0, 5)) {
          // Limit to 5 queries to stay within API limits
          const videos = await searchYouTubeVideos(query, 10) // 10 videos per query
          youtubeResults.push(...videos)
        }

        debugData.youtubeResults = youtubeResults

        if (youtubeResults.length > 0) {
          // Get video IDs for duration lookup
          const videoIds = youtubeResults.map((video) => video.id.videoId).filter(Boolean)
          const videoDetails = await getVideoDetails(videoIds)

          // Create a map of video ID to duration
          const durationMap = new Map()
          videoDetails.forEach((detail) => {
            durationMap.set(detail.id, formatDuration(detail.contentDetails.duration))
          })

          // Convert YouTube results to our format
          allVideos = youtubeResults.map((video) => ({
            title: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            description: video.snippet.description,
            thumbnail:
              video.snippet.thumbnails?.medium?.url ||
              video.snippet.thumbnails?.default?.url ||
              "/placeholder.svg?height=180&width=320",
            channelTitle: video.snippet.channelTitle,
            duration: durationMap.get(video.id.videoId) || "Unknown",
          }))

          // Remove duplicates and limit to 50
          const uniqueVideos = allVideos
            .filter((video, index, self) => index === self.findIndex((v) => v.url === video.url))
            .slice(0, 50)

          allVideos = uniqueVideos
        }
      } catch (error) {
        console.error("YouTube search error:", error)
        debugData.error = `YouTube search error: ${error.message}`
      }
    }

    debugData.step = "Finalizing recommendations"

    // If we don't have enough videos, use fallback recommendations
    if (allVideos.length === 0) {
      console.log("No YouTube videos found, using fallback recommendations")
      allVideos = getFallbackRecommendations(age, interests)

      return NextResponse.json({
        recommendations: allVideos,
        message: "Using fallback recommendations. Add YOUTUBE_API_KEY to environment variables to get real videos.",
        debug: debugData,
      })
    }

    // If we have some but not enough videos, supplement with fallbacks
    if (allVideos.length < 20) {
      const fallbacks = getFallbackRecommendations(age, interests)
      allVideos = [...allVideos, ...fallbacks].slice(0, 50)
    }

    return NextResponse.json({
      recommendations: allVideos,
      debug: debugData,
    })
  } catch (error) {
    console.error("API route error:", error)
    debugData.error = `Server error: ${error.message}`
    debugData.step = debugData.step || "Unknown step"

    // Always return a valid response with fallback recommendations
    return NextResponse.json(
      {
        error: "Internal server error",
        recommendations: getFallbackRecommendations(8, ["educational"]),
        debug: debugData,
      },
      { status: 200 },
    )
  }
}
