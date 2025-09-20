import { type NextRequest, NextResponse } from "next/server"
import { urlStore } from "@/lib/url-store"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    const { shortCode } = params

    console.log("[v0] Individual stats API called for:", shortCode)

    // Get URL data
    const urlData = urlStore.getUrl(shortCode)

    if (!urlData) {
      console.log("[v0] URL data not found for shortCode:", shortCode)
      return NextResponse.json({ error: "Short code not found" }, { status: 404 })
    }

    console.log("[v0] Found URL data:", urlData)

    // Return analytics data
    return NextResponse.json({
      shortCode: urlData.shortCode,
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks,
      createdAt: urlData.createdAt,
      lastAccessed: urlData.lastAccessed,
      expiresAt: urlData.expiresAt,
      isCustomCode: urlData.customCode || false,
      isExpired: urlData.expiresAt ? urlData.expiresAt < new Date() : false,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
