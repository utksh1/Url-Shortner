import { type NextRequest, NextResponse } from "next/server"
import { urlStore } from "@/lib/url-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, customCode, expiryHours } = body

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Validate custom code if provided
    if (customCode && (typeof customCode !== "string" || !/^[a-zA-Z0-9_-]+$/.test(customCode))) {
      return NextResponse.json(
        { error: "Custom code can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 },
      )
    }

    // Validate expiry hours
    if (expiryHours && (typeof expiryHours !== "number" || expiryHours <= 0)) {
      return NextResponse.json({ error: "Expiry hours must be a positive number" }, { status: 400 })
    }

    const urlData = urlStore.createShortUrl(url, customCode, expiryHours)

    return NextResponse.json({
      shortCode: urlData.shortCode,
      shortUrl: `${request.nextUrl.origin}/${urlData.shortCode}`,
      originalUrl: urlData.originalUrl,
      expiresAt: urlData.expiresAt,
      createdAt: urlData.createdAt,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Custom code already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    console.error("Error creating short URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
