import { NextResponse } from "next/server"
import { NotFoundError } from "@/lib/url-shortener/errors"
import { getRedirectUrl } from "@/lib/url-shortener/service"

export const runtime = "nodejs"

const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Checking Browser Link</title>
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
        color: #dc2626;
      }
      p {
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }
      a {
        color: #2563eb;
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
      <h1 id="title">Checking Link</h1>
      <p id="message">Looking for this short link in your browser local storage...</p>
      <a href="/">Go back to homepage</a>
    </div>
    <script>
      (function () {
        var storageKey = "url-shortener-links";
        var shortCode = decodeURIComponent(window.location.pathname.split("/").filter(Boolean)[0] || "");
        var title = document.getElementById("title");
        var message = document.getElementById("message");

        try {
          var records = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
          var record = Array.isArray(records) ? records.find(function (item) {
            return item && item.shortCode === shortCode;
          }) : null;

          if (!record) {
            throw new Error("missing");
          }

          if (record.expiresAt && new Date(record.expiresAt) <= new Date()) {
            throw new Error("expired");
          }

          record.clicks = (Number.isFinite(record.clicks) ? record.clicks : 0) + 1;
          record.lastAccessed = new Date().toISOString();
          window.localStorage.setItem(storageKey, JSON.stringify(records));
          window.location.replace(record.originalUrl);
        } catch (error) {
          title.textContent = "Link Not Found";
          message.textContent = "The short link you are looking for does not exist in this browser or has expired.";
        }
      })();
    </script>
  </body>
</html>`

export async function GET(request, { params }) {
  try {
    const { shortCode } = await params
    return NextResponse.redirect(getRedirectUrl(shortCode), 302)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return new NextResponse(notFoundHtml, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      })
    }

    console.error("Error handling redirect:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
