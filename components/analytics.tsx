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
  QrCodeIcon,
  CopyIcon,
  CheckIcon,
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
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  // Load overview stats on component mount
  useEffect(() => {
    loadOverviewStats()
  }, [])

  // Also load stats when component becomes visible (in case it's in an inactive tab)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!overviewStats) {
        loadOverviewStats()
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [overviewStats])

  const loadOverviewStats = async () => {
    try {
      const response = await fetch("/api/stats")
      const data = await response.json()

      if (response.ok) {
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

  const generateQRCode = (shortCode: string, shortUrl: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortUrl)}`
    setQrCodes(prev => ({ ...prev, [shortCode]: qrUrl }))
  }

  const copyToClipboard = async (text: string, shortCode: string, type: string = 'url') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [`${shortCode}-${type}`]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [`${shortCode}-${type}`]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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
      {overviewStats ? (
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
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">URL Management</h2>
        <div className="flex gap-2">
          <Button onClick={loadOverviewStats} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setOverviewStats(null)
            loadOverviewStats()
          }} variant="outline" size="sm">
            Force Reload
          </Button>
        </div>
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
              Complete list of all your short links with analytics, QR codes, and management options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {allUrls.map((url) => {
                const shortUrl = `${window.location.origin}/${url.shortCode}`
                const hasQRCode = qrCodes[url.shortCode]
                const isOriginalCopied = copiedStates[`${url.shortCode}-original`]
                const isShortCopied = copiedStates[`${url.shortCode}-short`]
                const isQRCopied = copiedStates[`${url.shortCode}-qr`]
                
                return (
                  <div key={url.shortCode} className="border rounded-lg p-4 space-y-4">
                    {/* Header with short code and badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-semibold">/{url.shortCode}</code>
                        {url.isCustomCode && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
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

                    {/* Original URL */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Original URL</Label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <code className="flex-1 text-sm font-mono break-all">{url.originalUrl}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(url.originalUrl, url.shortCode, 'original')}
                          className="shrink-0"
                        >
                          {isOriginalCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="shrink-0"
                        >
                          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Short URL with redirect button */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Short URL</Label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <code className="flex-1 text-sm font-mono">{shortUrl}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(shortUrl, url.shortCode, 'short')}
                          className="shrink-0"
                        >
                          {isShortCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          asChild
                          className="shrink-0"
                        >
                          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon className="h-4 w-4 mr-1" />
                            Visit
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Analytics and QR Code Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Analytics */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Analytics</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-muted rounded-md">
                            <p className="text-2xl font-bold text-accent">{url.clicks}</p>
                            <p className="text-xs text-muted-foreground">Total Clicks</p>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Created</p>
                          </div>
                        </div>
                        {url.lastAccessed && (
                          <div className="text-center p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">
                              {new Date(url.lastAccessed).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Last Accessed</p>
                          </div>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">QR Code</Label>
                        {!hasQRCode ? (
                          <Button
                            onClick={() => generateQRCode(url.shortCode, shortUrl)}
                            variant="outline"
                            className="w-full"
                          >
                            <QrCodeIcon className="h-4 w-4 mr-2" />
                            Generate QR Code
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-center">
                              <img 
                                src={hasQRCode} 
                                alt={`QR Code for ${url.shortCode}`} 
                                className="border rounded-lg w-24 h-24"
                              />
                            </div>
                            <Button
                              onClick={() => copyToClipboard(hasQRCode, url.shortCode, 'qr')}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              {isQRCopied ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
                              {isQRCopied ? 'Copied!' : 'Copy QR Image URL'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
