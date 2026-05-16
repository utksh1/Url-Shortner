import { NextResponse } from "next/server"
import { jsonError } from "@/lib/url-shortener/http"
import { deleteShortUrl } from "@/lib/url-shortener/service"

export const runtime = "nodejs"

export async function DELETE(request, { params }) {
  try {
    const { shortCode } = await params
    deleteShortUrl(shortCode)
    return NextResponse.json({ message: "URL deleted successfully" })
  } catch (error) {
    return jsonError(error)
  }
}
