"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  BarChart3Icon,
  LinkIcon,
  MousePointerClickIcon,
  ClockIcon,
  ExternalLinkIcon,
  SearchIcon,
  AlertCircleIcon,
  TrashIcon,
  RefreshCwIcon,
} from "lucide-react"

interface UrlStats {
  shortCode: string
  originalUrl: string
  clicks: number
  createdAt: string
  lastAccessed?: string
  expiresAt?: string
  isCustomCode: boolean
  isExpired: boolean
}

interface OverviewStats {
  totalUrls: number
  totalClicks: number
  activeUrls: number
  expiredUrls: number
  customUrls: number
  recentUrls: Array<{
    shortCode: string
    originalUrl: string
    clicks: number
    createdAt: string
    lastAccessed?: string
    isCustomCode: boolean
  }>
}

export function Analytics() {
  const [searchCode, setSearchCode] = useState("")
  const [urlStats, setUrlStats] = useState<UrlStats | null>(null)
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null)
  const [allUrls, setAllUrls] = useState<OverviewStats["recentUrls"]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Load overview stats on component mount
  useEffect(() => {
    loadOverviewStats()
  }, [])

  const loadOverviewStats = async () => {
    try {
      console.log("[v0] Loading overview stats...")
      const response = await fetch("/api/stats")
      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Overview stats loaded:", data)
        setOverviewStats(data)
        setAllUrls(data.recentUrls || [])
      } else {
        console.error("[v0] Failed to load stats:", data)
        setError("Failed to load analytics data")
      }
    } catch (err) {
      console.error("Failed to load overview stats:", err)
      setError("Failed to connect to analytics service")
    }
  }

  const searchStats = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCode.trim()) return

    setIsLoading(true)
    setError("")
    setUrlStats(null)

    try {
      const response = await fetch(`/api/stats/${encodeURIComponent(searchCode.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats")
      }

      setUrlStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUrl = async (shortCode: string) => {
    if (!confirm(`Are you sure you want to delete the short URL /${shortCode}?`)) {
      return
    }

    setDeleteLoading(shortCode)
    try {
      const response = await fetch(`/api/delete/${shortCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh the data after successful deletion
        await loadOverviewStats()
        // Clear individual stats if it was the deleted URL
        if (urlStats?.shortCode === shortCode) {
          setUrlStats(null)
          setSearchCode("")
        }
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete URL")
      }
    } catch (err) {
      setError("Failed to delete URL")
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.totalUrls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.totalClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active URLs</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overviewStats.activeUrls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired URLs</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overviewStats.expiredUrls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom URLs</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{overviewStats.customUrls}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">URL Management</h2>
        <Button onClick={loadOverviewStats} variant="outline" size="sm">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search for Specific URL Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Search URL Analytics</CardTitle>
          <CardDescription>Enter a short code to view detailed analytics for a specific URL</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchStats} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="searchCode" className="sr-only">
                Short Code
              </Label>
              <Input
                id="searchCode"
                placeholder="Enter short code (e.g., abc123)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
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

      {/* Individual URL Stats */}
      {urlStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Analytics for /{urlStats.shortCode}
              {urlStats.isCustomCode && <Badge variant="secondary">Custom</Badge>}
              {urlStats.isExpired && <Badge variant="destructive">Expired</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Total Clicks</Label>
                <p className="text-2xl font-bold text-accent">{urlStats.clicks}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">{new Date(urlStats.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Last Accessed</Label>
                <p className="text-sm">
                  {urlStats.lastAccessed ? new Date(urlStats.lastAccessed).toLocaleString() : "Never"}
                </p>
              </div>
              {urlStats.expiresAt && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Expires</Label>
                  <p className="text-sm">{new Date(urlStats.expiresAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Original URL</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">{urlStats.originalUrl}</code>
                <Button size="sm" variant="outline" asChild className="shrink-0 bg-transparent">
                  <a href={urlStats.originalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => deleteUrl(urlStats.shortCode)}
                variant="destructive"
                size="sm"
                disabled={deleteLoading === urlStats.shortCode}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {deleteLoading === urlStats.shortCode ? "Deleting..." : "Delete URL"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {allUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Short URLs</CardTitle>
            <CardDescription>
              Complete list of all your short links with analytics and management options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUrls.map((url) => (
                <div key={url.shortCode} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono">/{url.shortCode}</code>
                      {url.isCustomCode && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{url.originalUrl}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(url.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{url.clicks} clicks</p>
                      {url.lastAccessed && (
                        <p className="text-xs text-muted-foreground">
                          Last: {new Date(url.lastAccessed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => deleteUrl(url.shortCode)}
                      variant="outline"
                      size="sm"
                      disabled={deleteLoading === url.shortCode}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
