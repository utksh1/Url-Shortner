import { ValidationError } from "./errors"

const SHORT_CODE_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/
const RESERVED_CODES = new Set(["api", "_next", "favicon.ico", "robots.txt", "sitemap.xml", "admin", "stats"])
const MAX_EXPIRY_HOURS = 24 * 365

export function normalizeShortCode(shortCode) {
  return shortCode.trim()
}

export function validateShortCode(shortCode) {
  const normalizedCode = normalizeShortCode(shortCode)

  if (!SHORT_CODE_PATTERN.test(normalizedCode)) {
    throw new ValidationError("Custom code must be 3-64 characters and use only letters, numbers, hyphens, or underscores")
  }

  if (RESERVED_CODES.has(normalizedCode.toLowerCase())) {
    throw new ValidationError("That custom code is reserved")
  }

  return normalizedCode
}

export function validateOriginalUrl(url) {
  if (!url || typeof url !== "string") {
    throw new ValidationError("URL is required")
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    throw new ValidationError("Invalid URL format")
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new ValidationError("Only HTTP and HTTPS URLs are supported")
  }

  if (!parsedUrl.hostname.includes(".") && parsedUrl.hostname !== "localhost") {
    throw new ValidationError("URL must include a valid hostname")
  }

  return parsedUrl.toString()
}

export function validateExpiryHours(expiryHours) {
  if (expiryHours === undefined || expiryHours === null || expiryHours === "") {
    return undefined
  }

  if (typeof expiryHours !== "number" || !Number.isFinite(expiryHours)) {
    throw new ValidationError("Expiry hours must be a number")
  }

  if (!Number.isInteger(expiryHours) || expiryHours < 1 || expiryHours > MAX_EXPIRY_HOURS) {
    throw new ValidationError(`Expiry hours must be a whole number between 1 and ${MAX_EXPIRY_HOURS}`)
  }

  return expiryHours
}

export function parseCreateShortUrlInput(body) {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a JSON object")
  }

  const input = body
  const url = validateOriginalUrl(input.url)
  const customCode = input.customCode ? validateShortCode(String(input.customCode)) : undefined
  const expiryHours = validateExpiryHours(input.expiryHours)

  return { url, customCode, expiryHours }
}
