import { ConflictError, NotFoundError } from "./errors"
import { urlRepository } from "./repository"

function toPublicRecord(record) {
  return {
    shortCode: record.shortCode,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
    createdAt: record.createdAt,
    lastAccessed: record.lastAccessed,
    expiresAt: record.expiresAt,
    isCustomCode: record.customCode,
    isExpired: record.expiresAt ? record.expiresAt <= new Date() : false,
  }
}

export function createShortUrl(input) {
  const shortCode = input.customCode || urlRepository.generateCode()

  if (urlRepository.exists(shortCode)) {
    throw new ConflictError("Custom code already exists")
  }

  return urlRepository.create({
    shortCode,
    originalUrl: input.url,
    clicks: 0,
    createdAt: new Date(),
    expiresAt: input.expiryHours ? new Date(Date.now() + input.expiryHours * 60 * 60 * 1000) : undefined,
    customCode: Boolean(input.customCode),
  })
}

export function getUrlStats(shortCode) {
  const record = urlRepository.findByCode(shortCode)

  if (!record) {
    throw new NotFoundError()
  }

  return toPublicRecord(record)
}

export function getRedirectUrl(shortCode) {
  const record = urlRepository.recordClick(shortCode)

  if (!record) {
    throw new NotFoundError()
  }

  return record.originalUrl
}

export function deleteShortUrl(shortCode) {
  const deleted = urlRepository.delete(shortCode)

  if (!deleted) {
    throw new NotFoundError("URL not found")
  }
}

export function getOverviewStats() {
  const urls = urlRepository.list()
  const publicUrls = urls.map(toPublicRecord)
  const activeUrls = publicUrls.filter((url) => !url.isExpired)
  const expiredUrls = publicUrls.filter((url) => url.isExpired)

  return {
    totalUrls: publicUrls.length,
    totalClicks: publicUrls.reduce((sum, url) => sum + url.clicks, 0),
    activeUrls: activeUrls.length,
    expiredUrls: expiredUrls.length,
    customUrls: publicUrls.filter((url) => url.isCustomCode).length,
    recentUrls: publicUrls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 25),
  }
}
