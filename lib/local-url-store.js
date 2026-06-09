const STORAGE_KEY = "url-shortener-links"
const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/
const RESERVED_CODES = new Set(["api", "_next", "favicon.ico", "robots.txt", "sitemap.xml", "admin", "stats"])
const MAX_EXPIRY_HOURS = 24 * 365

function ensureBrowserStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("Browser local storage is not available")
  }
}

function getStorageValue() {
  ensureBrowserStorage()
  return window.localStorage.getItem(STORAGE_KEY)
}

function setStorageValue(records) {
  ensureBrowserStorage()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function parseStoredRecords() {
  const value = getStorageValue()

  if (!value) {
    return []
  }

  const parsed = JSON.parse(value)
  return Array.isArray(parsed) ? parsed : []
}

function isExpired(record) {
  return Boolean(record.expiresAt && new Date(record.expiresAt) <= new Date())
}

function toPublicRecord(record) {
  return {
    ...record,
    clicks: Number.isFinite(record.clicks) ? record.clicks : 0,
    isCustomCode: Boolean(record.isCustomCode),
    isExpired: isExpired(record),
  }
}

function validateOriginalUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("URL is required")
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    throw new Error("Invalid URL format")
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported")
  }

  if (!parsedUrl.hostname.includes(".") && parsedUrl.hostname !== "localhost") {
    throw new Error("URL must include a valid hostname")
  }

  return parsedUrl.toString()
}

function validateShortCode(shortCode) {
  const normalizedCode = shortCode.trim()

  if (!SHORT_CODE_PATTERN.test(normalizedCode)) {
    throw new Error("Custom code must be 3-64 characters and use only letters, numbers, hyphens, or underscores")
  }

  if (RESERVED_CODES.has(normalizedCode.toLowerCase())) {
    throw new Error("That custom code is reserved")
  }

  return normalizedCode
}

function validateExpiryHours(expiryHours) {
  if (expiryHours === undefined || expiryHours === null || expiryHours === "") {
    return undefined
  }

  const parsedExpiryHours = Number(expiryHours)

  if (!Number.isInteger(parsedExpiryHours) || parsedExpiryHours < 1 || parsedExpiryHours > MAX_EXPIRY_HOURS) {
    throw new Error(`Expiry hours must be a whole number between 1 and ${MAX_EXPIRY_HOURS}`)
  }

  return parsedExpiryHours
}

function getRandomIndex(max) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const randomValues = new Uint32Array(1)
    window.crypto.getRandomValues(randomValues)
    return randomValues[0] % max
  }

  return Math.floor(Math.random() * max)
}

function generateCode(existingCodes, length = 7) {
  for (let attempts = 0; attempts < 20; attempts += 1) {
    const code = Array.from({ length }, () => CODE_ALPHABET[getRandomIndex(CODE_ALPHABET.length)]).join("")

    if (!existingCodes.has(code)) {
      return code
    }
  }

  throw new Error("Unable to generate a unique short code")
}

export function getLocalUrls() {
  try {
    return parseStoredRecords().map(toPublicRecord)
  } catch (error) {
    console.error("Unable to load URLs from local storage:", error)
    return []
  }
}

export function getLocalUrl(shortCode) {
  return getLocalUrls().find((record) => record.shortCode === shortCode) || null
}

export function getLocalOverviewStats() {
  const urls = getLocalUrls()
  const activeUrls = urls.filter((url) => !url.isExpired)
  const expiredUrls = urls.filter((url) => url.isExpired)

  return {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
    activeUrls: activeUrls.length,
    expiredUrls: expiredUrls.length,
    customUrls: urls.filter((url) => url.isCustomCode).length,
    recentUrls: [...urls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 25),
  }
}

export function createLocalShortUrl({ url, customCode, expiryHours, origin }) {
  const originalUrl = validateOriginalUrl(url)
  const urls = getLocalUrls()
  const existingCodes = new Set(urls.map((record) => record.shortCode))
  const shortCode = customCode ? validateShortCode(customCode) : generateCode(existingCodes)
  const parsedExpiryHours = validateExpiryHours(expiryHours)

  if (existingCodes.has(shortCode)) {
    throw new Error("Custom code already exists in this browser")
  }

  const record = toPublicRecord({
    shortCode,
    originalUrl,
    clicks: 0,
    createdAt: new Date().toISOString(),
    lastAccessed: undefined,
    expiresAt: parsedExpiryHours ? new Date(Date.now() + parsedExpiryHours * 60 * 60 * 1000).toISOString() : undefined,
    isCustomCode: Boolean(customCode),
  })

  setStorageValue([record, ...urls])

  return {
    ...record,
    shortUrl: `${origin}/${shortCode}`,
  }
}

export function deleteLocalUrl(shortCode) {
  const urls = getLocalUrls()
  const nextUrls = urls.filter((record) => record.shortCode !== shortCode)

  if (nextUrls.length === urls.length) {
    throw new Error("URL not found")
  }

  setStorageValue(nextUrls)
}
