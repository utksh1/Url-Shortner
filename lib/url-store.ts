// In-memory storage for URL mappings and analytics
export interface UrlData {
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: Date
  lastAccessed?: Date
  expiresAt?: Date
  customCode?: boolean
}

class UrlStore {
  private urls: Map<string, UrlData> = new Map()

  // Generate a random short code
  private generateShortCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Create a new short URL
  createShortUrl(originalUrl: string, customCode?: string, expiryHours?: number): UrlData {
    let shortCode = customCode || this.generateShortCode()

    // Check if custom code already exists
    if (customCode && this.urls.has(customCode)) {
      throw new Error("Custom code already exists")
    }

    // Generate new code if random one conflicts
    while (!customCode && this.urls.has(shortCode)) {
      shortCode = this.generateShortCode()
    }

    const expiresAt = expiryHours ? new Date(Date.now() + expiryHours * 60 * 60 * 1000) : undefined

    const urlData: UrlData = {
      originalUrl,
      shortCode,
      clicks: 0,
      createdAt: new Date(),
      expiresAt,
      customCode: !!customCode,
    }

    this.urls.set(shortCode, urlData)
    return urlData
  }

  // Get URL data by short code
  getUrl(shortCode: string): UrlData | null {
    const urlData = this.urls.get(shortCode)

    if (!urlData) return null

    // Check if expired
    if (urlData.expiresAt && urlData.expiresAt < new Date()) {
      this.urls.delete(shortCode)
      return null
    }

    return urlData
  }

  // Track a click
  trackClick(shortCode: string): boolean {
    const urlData = this.urls.get(shortCode)
    if (!urlData) return false

    // Check if expired
    if (urlData.expiresAt && urlData.expiresAt < new Date()) {
      this.urls.delete(shortCode)
      return false
    }

    urlData.clicks++
    urlData.lastAccessed = new Date()
    return true
  }

  // Get all URLs (for admin purposes)
  getAllUrls(): UrlData[] {
    return Array.from(this.urls.values())
  }

  // Delete URL by short code
  deleteUrl(shortCode: string): boolean {
    return this.urls.delete(shortCode)
  }
}

// Singleton instance
export const urlStore = new UrlStore()
