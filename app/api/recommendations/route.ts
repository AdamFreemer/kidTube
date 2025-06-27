import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

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

interface YouTubeVideo {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    thumbnails: {
      medium: { url: string }
      high: { url: string }
    }
    channelTitle: string
  }
}

interface YouTubeDurationResponse {
  items: Array<{
    contentDetails: {
      duration: string
    }
  }>
}

// Convert YouTube duration format (PT4M13S) to readable format (4:13)
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return "0:00"

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

async function searchYouTubeVideos(query: string, maxResults = 10): Promise<VideoRecommendation[]> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "your_youtube_api_key_here") {
    console.log("YouTube API key not configured, skipping YouTube search")
    return []
  }

  try {
    // Clean the query - remove extra whitespace and special characters
    const cleanQuery = query
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
    console.log(`Searching YouTube for cleaned query: "${cleanQuery}"`)

    // Search for videos with more permissive parameters
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(cleanQuery)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&safeSearch=moderate&order=relevance`

    console.log("YouTube Search URL:", searchUrl)

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    console.log("YouTube API Response Status:", searchResponse.status)

    if (searchData.error) {
      console.error("YouTube API Error:", searchData.error)
      return []
    }

    if (!searchData.items || searchData.items.length === 0) {
      console.log("No videos found for query:", cleanQuery)
      return []
    }

    // Get video IDs for duration lookup
    const videoIds = searchData.items.map((item: YouTubeVideo) => item.id.videoId).join(",")

    // Get video details including duration
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    const detailsResponse = await fetch(detailsUrl)
    const detailsData: YouTubeDurationResponse = await detailsResponse.json()

    // Combine search results with duration data
    const videos: VideoRecommendation[] = searchData.items.map((item: YouTubeVideo, index: number) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description.substring(0, 150) + "...",
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      duration: detailsData.items[index] ? parseDuration(detailsData.items[index].contentDetails.duration) : "0:00",
    }))

    return videos
  } catch (error) {
    console.error("YouTube API error:", error)
    return []
  }
}

const createSmartFallbackRecommendations = (age: number, interests: string[]): VideoRecommendation[] => {
  const recommendations: VideoRecommendation[] = []

  // Create targeted recommendations based on interests
  interests.forEach((interest, index) => {
    if (index < 6) {
      // Limit to 6 interest-based recommendations
      recommendations.push({
        title: `${interest.charAt(0).toUpperCase() + interest.slice(1)} Videos for Kids`,
        description: `Educational ${interest} content perfect for ${age}-year-olds. Safe, fun, and engaging videos.`,
        url: `https://youtube.com/results?search_query=kids+${encodeURIComponent(interest)}+educational+safe+age+${age}`,
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "YouTube Search",
        duration: "Various",
      })
    }
  })

  // Add some general educational content to fill up to 9
  const generalTopics = [
    { topic: "Learning Songs", desc: "Educational songs and music" },
    { topic: "Story Time", desc: "Interactive storytelling videos" },
    { topic: "Fun Learning", desc: "Educational games and activities" },
  ]

  generalTopics.forEach((item, index) => {
    if (recommendations.length < 9) {
      recommendations.push({
        title: `${item.topic} for Kids`,
        description: `${item.desc} for ${age}-year-olds`,
        url: `https://youtube.com/results?search_query=kids+${encodeURIComponent(item.topic.toLowerCase())}+age+${age}`,
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "YouTube Search",
        duration: "Various",
      })
    }
  })

  return recommendations.slice(0, 9)
}

export async function POST(request: NextRequest) {
  const debugData: any = {
    timestamp: new Date().toISOString(),
    step: "starting",
  }

  try {
    // Parse request body with validation
    let body: RequestBody
    try {
      body = await request.json()
      debugData.step = "parsed_request"
      debugData.requestBody = body
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request body",
          debug: { ...debugData, parseError: parseError.message },
        },
        { status: 400 },
      )
    }

    const { age, sex, interests } = body

    // Validate required fields
    if (!age || !sex || !interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: age, sex, and interests are required",
          debug: { ...debugData, validation: "failed" },
        },
        { status: 400 },
      )
    }

    console.log("=== API REQUEST RECEIVED ===")
    console.log("Age:", age)
    console.log("Sex:", sex)
    console.log("Interests:", interests)

    debugData.step = "validated_input"

    // Check API key configuration
    debugData.apiKeyStatus = {
      openai: !!process.env.OPENAI_API_KEY,
      youtube: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== "your_youtube_api_key_here"),
    }

    debugData.step = "checked_api_keys"

    let searchQueries: string[] = []

    // Try OpenAI API call with better error handling
    if (process.env.OPENAI_API_KEY) {
      try {
        debugData.step = "calling_openai"

        const prompt = `Create 3 YouTube search terms for a ${age}-year-old ${sex} child who likes: ${interests.join(", ")}.

Make each search term:
- 2-3 words only
- Include "kids" or "children"
- Focus on the interests: ${interests.join(", ")}

Format: one search term per line, no extra text.

Example:
kids dinosaurs
children princesses
educational science`

        debugData.openaiRequest = {
          model: "gpt-4o-mini",
          prompt: prompt.substring(0, 200) + "...", // Truncate for debug
          system: "Generate simple YouTube search terms.",
          maxTokens: 50,
          userInput: { age, sex, interests },
        }

        console.log("=== CALLING OPENAI ===")

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt,
          system: "Generate simple YouTube search terms.",
          maxTokens: 50,
        })

        debugData.step = "openai_success"
        debugData.openaiResponse = {
          rawText: text,
          timestamp: new Date().toISOString(),
        }

        console.log("=== OPENAI RESPONSE ===")
        console.log("Raw text:", JSON.stringify(text))

        // Clean up the response
        searchQueries = text
          .replace(/\\n/g, "\n")
          .split("\n")
          .map((q) => q.trim())
          .filter((q) => q.length > 0 && !q.includes(":") && !q.includes("Example"))
          .slice(0, 3)

        console.log("=== CLEANED SEARCH QUERIES ===")
        console.log("Search queries:", searchQueries)
      } catch (openaiError: any) {
        console.error("OpenAI API Error:", openaiError)
        debugData.step = "openai_error"
        debugData.openaiError = {
          message: openaiError.message,
          name: openaiError.name,
          stack: openaiError.stack?.substring(0, 500),
        }

        // Continue with fallback queries instead of failing
        searchQueries = interests.slice(0, 3).map((interest) => `kids ${interest}`)
        debugData.openaiResponse = {
          error: "OpenAI API call failed",
          fallbackQueries: searchQueries,
          errorDetails: openaiError.message,
        }
      }
    } else {
      debugData.step = "openai_not_configured"
      searchQueries = interests.slice(0, 3).map((interest) => `kids ${interest}`)
      debugData.openaiResponse = {
        error: "OpenAI API key not configured",
        fallbackQueries: searchQueries,
      }
    }

    // Ensure we have search queries
    if (searchQueries.length === 0) {
      searchQueries = interests.slice(0, 3).map((interest) => `kids ${interest}`)
      debugData.fallbackUsed = true
    }

    debugData.youtubeQueries = searchQueries
    debugData.step = "prepared_youtube_queries"

    // Search YouTube with better error handling
    const allVideos: VideoRecommendation[] = []
    const youtubeResults: any[] = []

    if (debugData.apiKeyStatus.youtube) {
      debugData.step = "calling_youtube"

      for (const query of searchQueries) {
        try {
          console.log(`=== SEARCHING YOUTUBE FOR: "${query}" ===`)
          const videos = await searchYouTubeVideos(query, 4)
          console.log(`Found ${videos.length} videos for query: ${query}`)
          allVideos.push(...videos)
          youtubeResults.push({
            query,
            videoCount: videos.length,
            videos: videos.slice(0, 2),
            success: videos.length > 0,
          })
        } catch (youtubeError: any) {
          console.error(`YouTube search error for query "${query}":`, youtubeError)
          youtubeResults.push({
            query,
            error: youtubeError.message,
            success: false,
          })
        }
      }
      debugData.step = "youtube_complete"
    } else {
      debugData.step = "youtube_not_configured"
      youtubeResults.push({
        error: "YouTube API key not configured",
        message: "Add YOUTUBE_API_KEY to environment variables to get real videos",
      })
    }

    debugData.youtubeResults = youtubeResults

    // Process results
    const uniqueVideos = allVideos
      .filter((video, index, self) => index === self.findIndex((v) => v.url === video.url))
      .slice(0, 9)

    console.log(`=== FINAL RESULTS ===`)
    console.log(`Total unique videos found: ${uniqueVideos.length}`)

    debugData.step = "generating_response"

    if (uniqueVideos.length === 0) {
      debugData.finalResult = "No real videos found, using smart fallback based on interests"
      const fallbackRecommendations = createSmartFallbackRecommendations(age, interests)

      return NextResponse.json({
        recommendations: fallbackRecommendations,
        message: debugData.apiKeyStatus.youtube
          ? "Using targeted search links (YouTube API returned no results)"
          : "Using targeted search links (YouTube API not configured)",
        debug: debugData,
      })
    }

    debugData.finalResult = `Found ${uniqueVideos.length} real videos`

    return NextResponse.json({
      recommendations: uniqueVideos,
      message: uniqueVideos.length < 9 ? "Found some real videos (limited results)" : "Found real YouTube videos!",
      debug: debugData,
    })
  } catch (error: any) {
    console.error("=== CRITICAL API ERROR ===")
    console.error("Error:", error)
    console.error("Stack:", error.stack)

    debugData.step = "critical_error"
    debugData.criticalError = {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 1000),
    }

    // Always return a valid response, even on critical error
    try {
      const fallbackRecommendations = createSmartFallbackRecommendations(5, ["educational", "fun", "learning"])

      return NextResponse.json(
        {
          recommendations: fallbackRecommendations,
          message: "Using fallback recommendations due to system error",
          error: `System error: ${error.message}`,
          debug: debugData,
        },
        { status: 200 },
      ) // Return 200 instead of 500 to avoid frontend error
    } catch (fallbackError) {
      console.error("Even fallback failed:", fallbackError)

      return NextResponse.json(
        {
          error: "Complete system failure",
          recommendations: [],
          debug: {
            ...debugData,
            fallbackError: fallbackError.message,
          },
        },
        { status: 500 },
      )
    }
  }
}
