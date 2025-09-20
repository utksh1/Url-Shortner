import { type NextRequest, NextResponse } from "next/server"
import { urlStore } from "@/lib/url-store"

export async function DELETE(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    const { shortCode } = params

    if (!shortCode) {
      return NextResponse.json({ error: "Short code is required" }, { status: 400 })
    }

    console.log("[v0] Delete API called for:", shortCode)

    // Check if URL exists
    const urlData = urlStore.getUrl(shortCode)
    if (!urlData) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 })
    }

    // Delete the URL
    const deleted = urlStore.deleteUrl(shortCode)

    if (deleted) {
      console.log("[v0] Successfully deleted URL:", shortCode)
      return NextResponse.json({ message: "URL deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete URL" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
