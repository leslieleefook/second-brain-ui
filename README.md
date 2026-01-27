# Second Brain UI 🧠

A simple web interface to browse your Second Brain (markdown knowledge base).

## Features

- 📁 File tree navigation with collapsible folders
- 🔍 Full-text search across all markdown files
- 📝 Beautiful markdown rendering with GitHub Flavored Markdown support
- 🔗 Wiki-style `[[link]]` support
- 🌙 Dark theme (Tokyo Night inspired)
- ⚡ Fast — built with Vite + React

## Setup

```bash
# Install dependencies
npm install

# Start development server (runs both frontend and API)
npm run dev
```

Open http://localhost:5173 to view the app.

## Configuration

By default, the app serves files from `P:\Clawdbot\brain`. To change this, edit `server.js`:

```javascript
const BRAIN_PATH = 'P:\\Clawdbot\\brain';
```

## Architecture

- **Frontend:** React 18 + Vite
- **Backend:** Express.js API server
- **Rendering:** react-markdown with remark-gfm

The frontend runs on port 5173, and the API server runs on port 3001. Vite proxies `/api` requests to the backend.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/tree` | Get file tree structure |
| `GET /api/file/:path` | Get file content |
| `GET /api/search?q=query` | Search files |

## License

MIT
