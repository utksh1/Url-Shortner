import { type NextRequest, NextResponse } from "next/server"
import { urlStore } from "@/lib/url-store"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Overview stats API called")

    // Get all URLs for overview stats
    const allUrls = urlStore.getAllUrls()
    console.log("[v0] Found URLs count:", allUrls.length)

    const stats = {
      totalUrls: allUrls.length,
      totalClicks: allUrls.reduce((sum, url) => sum + url.clicks, 0),
      activeUrls: allUrls.filter((url) => !url.expiresAt || url.expiresAt > new Date()).length,
      expiredUrls: allUrls.filter((url) => url.expiresAt && url.expiresAt <= new Date()).length,
      customUrls: allUrls.filter((url) => url.customCode).length,
      recentUrls: allUrls
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map((url) => ({
          shortCode: url.shortCode,
          originalUrl: url.originalUrl,
          clicks: url.clicks,
          createdAt: url.createdAt,
          lastAccessed: url.lastAccessed,
          isCustomCode: url.customCode || false,
        })),
    }

    console.log("[v0] Returning stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching overview stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
