# URL Shortener

A professional Next.js URL shortener with a Node.js API layer, persistent local storage, custom aliases, expiry support, click tracking, QR codes, and an analytics dashboard.

## Features

- Create short links from HTTP or HTTPS URLs
- Optional custom short codes with reserved-route protection
- Optional link expiry in hours
- Redirect tracking with click counts and last-accessed timestamps
- Analytics dashboard for recent links
- Delete links from the dashboard
- Local JSON persistence in `.data/urls.json`

## Tech Stack

- Next.js App Router
- React
- Node.js runtime for API routes
- Tailwind CSS and shadcn/ui components

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## API

Create a short link:

```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/path",
  "customCode": "launch",
  "expiryHours": 24
}
```

Get overview analytics:

```http
GET /api/stats
```

Get one link's analytics:

```http
GET /api/stats/launch
```

Delete a link:

```http
DELETE /api/delete/launch
```
