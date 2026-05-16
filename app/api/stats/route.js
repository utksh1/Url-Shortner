import { NextResponse } from "next/server"
import { jsonError } from "@/lib/url-shortener/http"
import { getOverviewStats } from "@/lib/url-shortener/service"

export const runtime = "nodejs"

export async function GET() {
  try {
    return NextResponse.json(getOverviewStats())
  } catch (error) {
    return jsonError(error)
  }
}
