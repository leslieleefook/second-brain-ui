# Second Brain UI 🧠

A beautiful web interface to browse your markdown knowledge base (Second Brain).

## 🚀 Live Demo

**[View Live Demo →](https://leslieleefook.github.io/second-brain-ui/)**

The demo runs with sample content to showcase the features. Clone and run locally to connect your own markdown files.

## ✨ Features

- 📁 **File Tree Navigation** — Collapsible folders and files
- 🔍 **Full-text Search** — Find anything instantly
- 📝 **Markdown Rendering** — GitHub Flavored Markdown support
- 🔗 **Wiki Links** — Support for `[[double bracket]]` links
- 🌙 **Dark Theme** — Tokyo Night inspired aesthetics
- ⚡ **Fast** — Built with Vite + React

## 🛠️ Setup

### Local Development (with API Server)

Connect to your actual markdown files:

```bash
# Clone the repo
git clone https://github.com/leslieleefook/second-brain-ui.git
cd second-brain-ui

# Install dependencies
npm install

# Edit server.js to point to your markdown folder
# Default: P:\Clawdbot\brain

# Start development server (frontend + API)
npm run dev
```

Open http://localhost:5173 to view the app.

### Demo Mode

Run the frontend-only demo with sample content:

```bash
npm run client
```

## ⚙️ Configuration

Edit `server.js` to point to your markdown folder:

```javascript
const BRAIN_PATH = 'P:\\Clawdbot\\brain';  // Change this!
```

## 🏗️ Architecture

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React 18 + Vite | 5173 |
| Backend | Express.js | 3001 |
| Rendering | react-markdown + remark-gfm | — |

The frontend proxies `/api` requests to the backend during development.

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/tree` | Get file tree structure |
| `GET /api/file/:path` | Get file content |
| `GET /api/search?q=query` | Search files |

## 🚀 Deployment

### GitHub Pages (Demo Mode)

This repo auto-deploys to GitHub Pages on push to `main`. The demo mode uses bundled sample content since the API server can't run on static hosting.

### Self-Hosted (Full Mode)

For full functionality with your own files:

```bash
# Build the frontend
npm run build

# Serve with the API server
npm run server

# Or use PM2, Docker, etc.
```

## 📄 License

MIT

---

Made with 💜 by [Leslie Lee Fook](https://github.com/leslieleefook)
