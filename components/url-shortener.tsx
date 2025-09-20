"use client"

import type React from "react"
import { QRCodeGenerator } from "@/components/qr-code-generator"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CopyIcon, CheckIcon, ExternalLinkIcon, AlertCircleIcon } from "lucide-react"

interface ShortenedUrl {
  shortCode: string
  shortUrl: string
  originalUrl: string
  expiresAt?: string
  createdAt: string
}

export function UrlShortener() {
  const [url, setUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [useCustomCode, setUseCustomCode] = useState(false)
  const [useExpiry, setUseExpiry] = useState(false)
  const [expiryHours, setExpiryHours] = useState("24")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ShortenedUrl | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const payload: any = { url }

      if (useCustomCode && customCode.trim()) {
        payload.customCode = customCode.trim()
      }

      if (useExpiry && expiryHours) {
        payload.expiryHours = Number.parseInt(expiryHours)
      }

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create short URL")
      }

      setResult(data)
      setUrl("")
      setCustomCode("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Short Link</CardTitle>
          <CardDescription>Enter a long URL to generate a short, trackable link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Long URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="custom-code" checked={useCustomCode} onCheckedChange={setUseCustomCode} />
              <Label htmlFor="custom-code">Use custom short code</Label>
            </div>

            {useCustomCode && (
              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Code</Label>
                <Input
                  id="customCode"
                  placeholder="gdg2025"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Only letters, numbers, hyphens, and underscores allowed"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="expiry" checked={useExpiry} onCheckedChange={setUseExpiry} />
              <Label htmlFor="expiry">Set expiration time</Label>
            </div>

            {useExpiry && (
              <div className="space-y-2">
                <Label htmlFor="expiryHours">Expires in (hours)</Label>
                <Input
                  id="expiryHours"
                  type="number"
                  min="1"
                  max="8760"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                />
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Short Link"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Short Link Created!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono">{result.shortUrl}</code>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0 bg-transparent">
                  {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline" asChild className="shrink-0 bg-transparent">
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Original URL:</Label>
                  <p className="font-mono text-xs break-all">{result.originalUrl}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Short Code:</Label>
                  <p className="font-mono">{result.shortCode}</p>
                </div>
                {result.expiresAt && (
                  <div>
                    <Label className="text-muted-foreground">Expires:</Label>
                    <p>{new Date(result.expiresAt).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Created:</Label>
                  <p>{new Date(result.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <QRCodeGenerator shortUrl={result.shortUrl} />
        </div>
      )}
    </div>
  )
}
