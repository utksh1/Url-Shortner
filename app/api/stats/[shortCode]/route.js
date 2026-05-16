import { NextResponse } from "next/server"
import { jsonError } from "@/lib/url-shortener/http"
import { getUrlStats } from "@/lib/url-shortener/service"

export const runtime = "nodejs"

export async function GET(request, { params }) {
  try {
    const { shortCode } = await params
    return NextResponse.json(getUrlStats(shortCode))
  } catch (error) {
    return jsonError(error)
  }
}
