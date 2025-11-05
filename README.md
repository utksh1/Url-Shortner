
🚀 Project Name

# Url-Shortner

💡 Project Idea

A web app that lets users convert long URLs into short, branded ones using their own custom domain or custom alias.
Example:

Original: https://www.linkedin.com/in/utkarsh-singh-dev-projects-long-link
Shortened: https://utkarsh.link/profile

⚙️ Key Features

Shorten URLs

Input: Long URL

Optional custom alias: /myproject

Output: Short link (https://yourdomain.com/myproject)

Custom Domain Integration

Users can connect their own domain (like go.utkarsh.link).

Link Management Dashboard

Users can view, edit, and delete their short links.

Analytics

Count clicks per link.

Show date/time and country of visitors.

Optional Expiration

Auto-disable links after certain dates or click limits.

API Access

Provide an API endpoint for shortening via code.

QR Code Generation

Each link can generate a QR code.

🧩 Tech Stack
Layer	Technology	Description
Frontend	TypeScript + Vanilla JS + CSS	Dynamic UI, simple dashboard
Backend	Node.js + Express (TypeScript)	Handle URL shortening, redirects, API
Database	MongoDB or SQLite	Store links, domains, analytics
Hosting	Vercel or Render	Deploy frontend + backend easily
DNS/Domain	Cloudflare / Freenom	Connect custom domains/subdomains
🗂️ Folder Structure
shortlinker/
│
├── backend/
│   ├── src/
│   │   ├── index.ts        // Express server entry
│   │   ├── routes/
│   │   │   ├── shorten.ts  // POST /shorten
│   │   │   ├── redirect.ts // GET /:alias
│   │   ├── db.ts           // Database setup
│   │   ├── models/
│   │   │   └── Link.ts     // Link schema/interface
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── main.ts
│   ├── dashboard.ts
│
└── README.md

🧠 Basic Flow

User submits a URL

JS/TS sends it to /api/shorten

Server generates a unique code (or uses custom alias)

Server stores it in DB along with domain and metadata

When someone visits that short link, Express automatically redirects them to the original URL

Analytics updated in real-time

🧪 Example API
POST /api/shorten
{
  "originalUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "alias": "music",
  "domain": "utkarsh.link"
}


Response:

{
  "shortUrl": "https://utkarsh.link/music"
}

🌈 Nice Add-ons

A small analytics dashboard showing graphs using Chart.js

LocalStorage caching for user’s last few links

Custom themes (CSS) – dark/light

Click tracking endpoint with middleware
