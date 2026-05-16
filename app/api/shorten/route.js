import { NextResponse } from "next/server"
import { ValidationError } from "@/lib/url-shortener/errors"
import { jsonError } from "@/lib/url-shortener/http"
import { createShortUrl } from "@/lib/url-shortener/service"
import { parseCreateShortUrlInput } from "@/lib/url-shortener/validation"

export const runtime = "nodejs"

export async function POST(request) {
  try {
    let body

    try {
      body = await request.json()
    } catch {
      throw new ValidationError("Request body must be valid JSON")
    }

    const input = parseCreateShortUrlInput(body)
    const urlData = createShortUrl(input)

    return NextResponse.json({
      shortCode: urlData.shortCode,
      shortUrl: `${request.nextUrl.origin}/${urlData.shortCode}`,
      originalUrl: urlData.originalUrl,
      expiresAt: urlData.expiresAt,
      createdAt: urlData.createdAt,
    })
  } catch (error) {
    return jsonError(error)
  }
}
