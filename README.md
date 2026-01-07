# Javelin Sentry

A real-time API & website monitoring dashboard that keeps an eye on your endpoints so you don't have to.

![Javelin Sentry Dashboard](https://img.shields.io/badge/status-stable-green) ![Version](https://img.shields.io/badge/version-1.0.0-blue)

## What is this?

Javelin Sentry is a lightweight, browser-based monitoring tool that continuously checks if your APIs and websites are up and running. When something goes down, it screams at you through Telegram, Discord, Slack, or good old browser sounds.

Built for developers who want a quick, no-nonsense way to monitor their services without setting up complex infrastructure.

## Features

- **Real-time Monitoring** – Checks your endpoints at configurable intervals
- **Multi-channel Alerts** – Get notified via Telegram, Discord, Slack, or audio alerts
- **Visual Dashboard** – See all your services at a glance with latency and uptime stats
- **History Tracking** – View response time trends over time
- **Bulk Import** – Add multiple endpoints at once
- **Export/Import** – Backup and restore your configuration
- **Dark/Light Mode** – Because your eyes matter
- **Zero Backend Required** – Runs entirely in your browser (data stored in localStorage)

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  /api/proxy  │────▶│  Target Server  │
│  (Frontend) │◀────│   (Vercel)   │◀────│  (Your API)     │
└─────────────┘     └──────────────┘     └─────────────────┘
```

1. **Frontend** runs in your browser and stores all configuration locally
2. **Proxy** (Vercel serverless function) forwards requests to bypass CORS restrictions
3. **Target** is checked and the response status is returned to the dashboard

The proxy is necessary because browsers block direct cross-origin requests. The serverless function acts as a middleman, making the actual HTTP request and returning just the status.

## Quick Start

### Use the Hosted Version

Just go to **[javelin-sentry.vercel.app](https://javelin-sentry.vercel.app)** and start adding your endpoints.

### Run Locally

```bash
# Clone the repo
git clone https://github.com/basarballioz/javelin-sentry.git
cd javelin-sentry

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:3000` and you're good to go.

## Configuration

### Adding Endpoints

1. Paste your API URL in the input field
2. Click "Add Target"
3. That's it. Monitoring starts immediately.

### Setting Up Notifications

Click the gear icon to open settings:

| Service | What You Need |
|---------|---------------|
| **Telegram** | Bot Token + Chat ID |
| **Discord** | Webhook URL |
| **Slack** | Webhook URL |
| **Sound** | Just enable it |

### Check Intervals

Default is 60 seconds. You can change this globally in settings or per-endpoint by editing individual targets.

## Project Structure

```
javelin-sentry/
├── api/
│   └── proxy.js          # Serverless proxy function
├── components/
│   ├── controls/         # Toolbar, filters
│   ├── dashboard/        # Main grid, status cards, logs
│   ├── layout/           # Header, footer
│   └── modals/           # Config, edit, history modals
├── hooks/
│   └── useMonitoring.ts  # Core monitoring logic
├── services/
│   ├── audio.ts          # Sound notifications
│   ├── monitor.ts        # API check logic
│   └── notifier.ts       # Telegram/Discord/Slack
├── types/
│   └── index.ts          # TypeScript interfaces
├── App.tsx               # Main app component
└── vite.config.ts        # Vite config with local proxy
```

## Tech Stack

- **React 19** – UI framework
- **TypeScript** – Type safety
- **Vite** – Build tool & dev server
- **Recharts** – Latency charts
- **Lucide** – Icons
- **Vercel** – Hosting & serverless functions

## Deployment

Push to GitHub and connect to Vercel. That's literally it.

```bash
git push origin main
# Vercel auto-deploys on push
```

The `api/proxy.js` file is automatically picked up as a serverless function.

## Limitations

- **No persistent storage** – Everything lives in localStorage. Clear your browser data and it's gone.
- **WAF/Bot Protection** – Some sites (CloudFlare, etc.) may block requests and return 403
- **Rate Limits** – Don't set intervals too low or target servers might not appreciate it

## Contributing

Found a bug? Want a feature? Open an issue or PR. Keep it simple.

## License

MIT – Do whatever you want with it.

---

Built with ☕ and mild frustration by [@basarballioz](https://github.com/basarballioz)