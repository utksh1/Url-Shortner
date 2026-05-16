import { randomBytes } from "crypto"
import { mkdirSync, readFileSync, writeFileSync } from "fs"

const STORE_DIR = process.env.URL_STORE_DIR || (process.env.VERCEL ? "/tmp/url-shortener" : ".data")
const STORE_PATH = `${STORE_DIR}/urls.json`
const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function serialize(record) {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    lastAccessed: record.lastAccessed?.toISOString(),
    expiresAt: record.expiresAt?.toISOString(),
  }
}

function deserialize(record) {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    lastAccessed: record.lastAccessed ? new Date(record.lastAccessed) : undefined,
    expiresAt: record.expiresAt ? new Date(record.expiresAt) : undefined,
  }
}

export class UrlRepository {
  urls = new Map()
  loaded = false
  persistenceDisabled = false

  create(record) {
    this.load()
    this.urls.set(record.shortCode, record)
    this.persist()
    return record
  }

  findByCode(shortCode) {
    this.load()
    const record = this.urls.get(shortCode)

    if (!record) {
      return null
    }

    if (this.isExpired(record)) {
      this.urls.delete(shortCode)
      this.persist()
      return null
    }

    return record
  }

  exists(shortCode) {
    return this.findByCode(shortCode) !== null
  }

  list() {
    this.load()
    let removedExpired = false

    for (const [shortCode, record] of this.urls) {
      if (this.isExpired(record)) {
        this.urls.delete(shortCode)
        removedExpired = true
      }
    }

    if (removedExpired) {
      this.persist()
    }

    return Array.from(this.urls.values())
  }

  recordClick(shortCode) {
    const record = this.findByCode(shortCode)

    if (!record) {
      return null
    }

    record.clicks += 1
    record.lastAccessed = new Date()
    this.persist()
    return record
  }

  delete(shortCode) {
    this.load()
    const deleted = this.urls.delete(shortCode)

    if (deleted) {
      this.persist()
    }

    return deleted
  }

  generateCode(length = 7) {
    this.load()

    for (let attempts = 0; attempts < 20; attempts += 1) {
      const code = Array.from(randomBytes(length), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")

      if (!this.urls.has(code)) {
        return code
      }
    }

    throw new Error("Unable to generate a unique short code")
  }

  isExpired(record) {
    return Boolean(record.expiresAt && record.expiresAt <= new Date())
  }

  load() {
    if (this.loaded) {
      return
    }

    this.loaded = true

    try {
      const file = readFileSync(STORE_PATH, "utf8")
      const records = JSON.parse(file)
      this.urls = new Map(records.map((record) => [record.shortCode, deserialize(record)]))
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Unable to load URL store:", error)
      }
    }
  }

  persist() {
    if (this.persistenceDisabled) {
      return
    }

    try {
      mkdirSync(STORE_DIR, { recursive: true })
      writeFileSync(STORE_PATH, JSON.stringify(this.listForPersistence(), null, 2))
    } catch (error) {
      this.persistenceDisabled = true
      console.error("Unable to persist URL store. Continuing with in-memory storage:", error)
    }
  }

  listForPersistence() {
    return Array.from(this.urls.values()).map(serialize)
  }
}

export const urlRepository = (() => {
  if (!global.__urlRepository) {
    global.__urlRepository = new UrlRepository()
  }

  return global.__urlRepository
})()
