<p align="center">
  <img src="https://img.shields.io/badge/Javelin-Sentry-5865F2?style=for-the-badge&logo=target&logoColor=white" alt="Javelin Sentry" />
</p>

<h1 align="center">Javelin Sentry</h1>

<p align="center">
  <strong>Real-time API & Website Monitoring Dashboard</strong><br>
  Keep an eye on your endpoints so you don't have to.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.5.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/status-stable-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/react-19.x-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/deployed%20on-vercel-black?style=flat-square&logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#validation-strategies">Validation</a> •
  <a href="#notifications">Notifications</a>
</p>

---

## What is Javelin Sentry?

Javelin Sentry is a lightweight, browser-based monitoring tool that continuously checks if your APIs and websites are up and running. When something goes down, it alerts you through Telegram, Discord, Slack, or audio notifications.

**Built for developers who want a quick, no-nonsense way to monitor their services without setting up complex infrastructure.**

![Dashboard Preview](https://github.com/user-attachments/assets/c6cad95a-4cdc-475a-b9c8-54e309ee469c)

---

## Features

| Feature | Description |
|---------|-------------|
| **Real-time Monitoring** | Check endpoints at configurable intervals (5-300 seconds) |
| **Smart Validation** | HTTP status, JSON field matching, or keyword detection |
| **Visual Dashboard** | Latency graphs, uptime percentages, and status at a glance |
| **Multi-channel Alerts** | Telegram, Discord, Slack, and audio notifications |
| **WAF Bypass** | Multiple User-Agent options to avoid bot detection |
| **Bulk Import** | Add multiple endpoints at once |
| **Save Slots** | Save and restore configurations with 5 save slots |
| **Export/Import** | Backup configuration as JSON file |
| **Modern UI** | Clean dark interface with responsive design |
| **Zero Backend** | Runs entirely in browser (localStorage) |

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│     Browser     │─────▶│   Vercel Proxy   │─────▶│  Target Server  │
│   (Dashboard)   │◀─────│  /api/proxy.js   │◀─────│   (Your API)    │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                                                   
        ▼                                                   
┌─────────────────┐                                         
│  localStorage   │  ◀── Configuration & History            
└─────────────────┘                                         
```

The proxy is necessary because browsers block direct cross-origin requests. The serverless function acts as a middleman, making the actual HTTP request and returning the response.

---

## Quick Start

### Option 1: Use Hosted Version (Recommended)

Just go to **[javelin-sentry.vercel.app](https://javelin-sentry.vercel.app)** and start adding your endpoints!

### Option 2: Self-Host

```bash
# Clone the repository
git clone https://github.com/basarballioz/javelin-sentry.git
cd javelin-sentry

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` and start monitoring!

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# The api/proxy.js is automatically picked up as a serverless function
```

---

## 🎯 Validation Strategies

Javelin Sentry supports three validation strategies to determine if your endpoint is healthy:

### 1. Status Only (Default)

Simply checks if the HTTP response status is 2xx or 3xx.

```
✅ 200 OK → UP
✅ 301 Redirect → UP
❌ 500 Internal Error → DOWN
❌ 404 Not Found → DOWN
```

### 2. JSON Match

Validates a specific field in the JSON response. Supports nested keys and array indexing.

**Examples:**

| JSON Response | Key | Value | Result |
|--------------|-----|-------|--------|
| `{"status": "healthy"}` | `status` | `healthy` | ✅ UP |
| `{"data": {"online": true}}` | `data.online` | `true` | ✅ UP |
| `{"users": [{"name": "John"}]}` | `users.0.name` | `John` | ✅ UP |
| `{"page": 1, "items": [...]}` | `page` | `1` | ✅ UP |

**Nested Key Notation:**
```
data.user.profile.status    → Access deeply nested objects
items.0.id                  → Access first array element
response.data.2.name        → Access third array element's name
```

### 3. Keyword Match

Searches for a specific keyword in the response body.

| Mode | Keyword | Found in Response | Result |
|------|---------|-------------------|--------|
| **Must contain** | `"success"` | `{"message": "success"}` | ✅ UP |
| **Must contain** | `"success"` | `{"message": "failed"}` | ❌ DOWN |
| **Must NOT contain** | `"error"` | `{"status": "ok"}` | ✅ UP |
| **Must NOT contain** | `"error"` | `{"error": "timeout"}` | ❌ DOWN |

---

## 🕵️ User-Agent Options (WAF Bypass)

Some websites block requests that appear to come from bots. Javelin Sentry offers multiple User-Agent options:

| Option | Description | Best For |
|--------|-------------|----------|
| **Smart/Auto** | Chrome Windows UA | Most APIs |
| **Chrome Win** | Desktop Chrome | Standard websites |
| **Safari iOS** | iPhone Safari | CloudFlare-protected sites |
| **Firefox Win** | Desktop Firefox | Alternative testing |
| **Google Bot** | Googlebot UA | SEO-focused endpoints |

> 💡 **Tip:** Safari iOS is often the best choice for CloudFlare and other WAF-protected sites.

---

## 🔔 Notifications

### Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your Chat ID from [@userinfobot](https://t.me/userinfobot)
3. Enter Bot Token and Chat ID in settings

```
Bot Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
Chat ID: 987654321
```

### Discord

1. Go to your Discord server → Settings → Integrations
2. Create a new Webhook
3. Copy the Webhook URL

```
https://discord.com/api/webhooks/123456789/abcdefg...
```

### Slack

1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create a new app → Incoming Webhooks
3. Activate and copy the Webhook URL

```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX
```

### Audio Alerts

Choose from 5 sound themes:
- 🎵 **Classic** – Traditional beeps
- 🎮 **Retro** – 8-bit style
- 🔊 **Modern** – Soft notifications
- 🚀 **Sci-Fi** – Futuristic tones
- 🔇 **Subtle** – Minimal sounds

---

## ⚙️ Configuration Examples

### Monitoring a REST API

```yaml
URL: https://api.example.com/health
Interval: 30 seconds
Validation: JSON Match
  Key: status
  Value: healthy
User-Agent: Smart/Auto
```

### Monitoring a Website

```yaml
URL: https://example.com
Interval: 60 seconds
Validation: Keyword Match
  Keyword: "Welcome"
  Mode: Must contain
User-Agent: Chrome Win
```

### Monitoring a Database API

```yaml
URL: https://api.example.com/db/status
Interval: 15 seconds
Validation: JSON Match
  Key: connections.active
  Value: true
User-Agent: Smart/Auto
```

### Monitoring for Errors

```yaml
URL: https://api.example.com/logs
Interval: 60 seconds
Validation: Keyword Match
  Keyword: "CRITICAL"
  Mode: Must NOT contain
User-Agent: Smart/Auto
```

---

## 📁 Project Structure

```
javelin-sentry/
├── api/
│   └── proxy.js              # Vercel serverless proxy
├── components/
│   ├── controls/
│   │   └── ActionToolbar.tsx # Toolbar with actions
│   ├── dashboard/
│   │   ├── LogPanel.tsx      # Activity log
│   │   ├── MonitorGrid.tsx   # Main grid layout
│   │   └── StatusCard.tsx    # Individual endpoint card
│   ├── layout/
│   │   ├── Footer.tsx        # App footer
│   │   └── Header.tsx        # App header
│   └── modals/
│       ├── AddApiConfirmModal.tsx  # Add endpoint modal
│       ├── BulkAddModal.tsx        # Bulk import modal
│       ├── ConfigModal.tsx         # Settings modal
│       ├── EditApiModal.tsx        # Edit endpoint modal
│       └── HistoryModal.tsx        # History/charts modal
├── hooks/
│   └── useMonitoring.ts      # Core monitoring logic
├── services/
│   ├── audio.ts              # Sound notifications
│   ├── monitor.ts            # API check logic
│   └── notifier.ts           # Telegram/Discord/Slack
├── types/
│   └── index.ts              # TypeScript interfaces
├── App.tsx                   # Main app component
├── index.tsx                 # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json               # Vercel configuration
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Recharts** | Latency visualization |
| **Lucide React** | Beautiful icons |
| **Vercel** | Hosting & serverless |

---

## ⚠️ Limitations

| Limitation | Description |
|------------|-------------|
| **No persistent storage** | Data lives in localStorage. Clearing browser data removes everything. |
| **WAF/Bot Protection** | Some sites may still block requests despite User-Agent options. |
| **Rate Limits** | Don't set intervals too low – target servers might block you. |
| **Browser Required** | Must keep browser tab open for monitoring to work. |

---

## 🤝 Contributing

Found a bug? Want a feature? Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
