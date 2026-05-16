# URL Shortener

A clean JavaScript/Next.js URL shortener with a Node.js API backend, custom short codes, expiry support, click tracking, QR code generation, and a lightweight analytics dashboard.

## Features

- Shorten any valid `http` or `https` URL
- Use optional custom short codes such as `/launch`
- Reject reserved routes like `/api`, `/stats`, and `/_next`
- Set optional expiry times in hours
- Track total clicks and last accessed time
- View overview and per-link analytics
- Generate QR codes for created links
- Delete links from the dashboard
- Persist links locally in `.data/urls.json`

## Tech Stack

- Next.js 16 App Router
- React 18
- Node.js runtime for API routes
- JavaScript and JSX
- Tailwind CSS
- Minimal Radix UI primitives used only where needed

## Project Structure

```text
app/
  api/
    shorten/route.js
    stats/route.js
    stats/[shortCode]/route.js
    delete/[shortCode]/route.js
  [shortCode]/route.js
  page.jsx
  layout.jsx

components/
  url-shortener.jsx
  analytics.jsx
  qr-code-generator.jsx
  ui/

lib/
  url-shortener/
    errors.js
    http.js
    repository.js
    service.js
    validation.js
  utils.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start the local dev server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Build-check the app
```

## API

### Create Short Link

```http
POST /api/shorten
Content-Type: application/json
```

```json
{
  "url": "https://example.com/very/long/path",
  "customCode": "launch",
  "expiryHours": 24
}
```

Example response:

```json
{
  "shortCode": "launch",
  "shortUrl": "http://localhost:3000/launch",
  "originalUrl": "https://example.com/very/long/path",
  "expiresAt": "2026-05-17T12:00:00.000Z",
  "createdAt": "2026-05-16T12:00:00.000Z"
}
```

### Redirect

```http
GET /launch
```

Redirects to the original URL and records a click.

### Overview Stats

```http
GET /api/stats
```

### Link Stats

```http
GET /api/stats/launch
```

### Delete Link

```http
DELETE /api/delete/launch
```

## Storage

The app stores URL records in:

```text
.data/urls.json
```

That file is ignored by Git. On Vercel, the app uses `/tmp/url-shortener/urls.json` when file storage is available and falls back to in-memory storage if persistence is blocked.

This is good for local/demo usage. For real production links, replace `lib/url-shortener/repository.js` with a database-backed repository such as PostgreSQL, SQLite, MongoDB, or Vercel KV. Serverless file storage is temporary and can be reset between cold starts or deployments.

## Validation Rules

- URLs must use `http` or `https`.
- Custom codes must be 3-64 characters.
- Custom codes can contain letters, numbers, hyphens, and underscores.
- Reserved routes cannot be used as custom codes.
- Expiry must be a whole number from `1` to `8760` hours.

## Deployment Notes

- The project uses `npm` and `package-lock.json`.
- `.next`, `.data`, environment files, logs, and `node_modules` are ignored.
- Vercel Analytics and Speed Insights are enabled in `app/layout.jsx`.
- Serverless deployments should use a real database for durable links.
- Cookiebot may show a localhost authorization warning during local development unless localhost is added in the Cookiebot dashboard.

## Git History Note

The local commit history has been rewritten with professional commit names. If pushing this branch over the existing remote history, use:

```bash
git push --force-with-lease origin main
```
