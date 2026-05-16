import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import { GoogleAnalytics } from "@/components/google-analytics"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"

export const metadata = {
  title: "URL Shortener - Create Short Links with Analytics",
  description:
    "Transform long URLs into short, trackable links with detailed analytics, custom codes, and QR code generation.",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
        <CookieConsent />
      </body>
    </html>
  )
}
