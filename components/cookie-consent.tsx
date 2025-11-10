'use client'

import Script from 'next/script'

export function CookieConsent() {
  return (
    <Script
      id="Cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid="82ac73de-2ac4-4ad2-8faf-738c671dfafa"
      strategy="beforeInteractive"
    />
  )
}