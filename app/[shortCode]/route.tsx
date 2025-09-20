import { type NextRequest, NextResponse } from "next/server"
import { urlStore } from "@/lib/url-store"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    const { shortCode } = params

    console.log("[v0] Redirect request for shortCode:", shortCode)

    // Get URL data
    const urlData = urlStore.getUrl(shortCode)

    if (!urlData) {
      console.log("[v0] URL not found for shortCode:", shortCode)
      // Return a 404 page for invalid/expired short codes
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0; 
                background: #f8fafc;
                color: #334155;
              }
              .container { 
                text-align: center; 
                max-width: 400px; 
                padding: 2rem;
              }
              h1 { 
                font-size: 2rem; 
                margin-bottom: 1rem; 
                color: #ef4444;
              }
              p { 
                margin-bottom: 1.5rem; 
                line-height: 1.6;
              }
              a { 
                color: #3b82f6; 
                text-decoration: none; 
                font-weight: 500;
              }
              a:hover { 
                text-decoration: underline; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Not Found</h1>
              <p>The short link you're looking for doesn't exist or has expired.</p>
              <a href="/">← Go back to homepage</a>
            </div>
          </body>
        </html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    console.log("[v0] Found URL, tracking click and redirecting to:", urlData.originalUrl)

    // Track the click
    const tracked = urlStore.trackClick(shortCode)
    console.log("[v0] Click tracked successfully:", tracked)

    // Redirect to the original URL
    return NextResponse.redirect(urlData.originalUrl, 302)
  } catch (error) {
    console.error("Error handling redirect:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
