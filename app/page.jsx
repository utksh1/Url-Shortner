"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UrlShortener } from "@/components/url-shortener"
import { Analytics } from "@/components/analytics"
import { LinkIcon, BarChart3Icon, ClockIcon, MousePointerClickIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LinkIcon className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-balance">URL Shortener</h1>
          </div>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Transform long URLs into short, trackable links with detailed analytics and custom options.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="shorten" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="shorten" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Create Short Link
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shorten">
            <UrlShortener />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClickIcon className="h-5 w-5 text-accent" />
                Click Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor every click on your short links with detailed analytics and timestamps.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-accent" />
                Expiry Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Set expiration times for your links to automatically disable them after a set period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-accent" />
                Custom Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create memorable custom short codes like /gdg2025 for your branded links.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
