# 🧠 Second Brain UI

A beautiful web interface for browsing, searching, and editing your Second Brain knowledge base.

![Dark Theme](https://img.shields.io/badge/theme-dark-1a1a2e)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)

## Features

- 📁 **File Tree Browser** - Navigate your knowledge base with a familiar folder structure
- 🔍 **Full-Text Search** - Find notes by title, content, or tags
- 🔗 **Wiki Links** - Click `[[links]]` to navigate between notes
- ↩️ **Backlinks** - See which notes reference the current note
- ✏️ **Edit Mode** - Edit notes directly in the browser
- ➕ **Create Notes** - Add new notes to any folder
- 🏷️ **Tags Support** - View and search by hashtags
- 🌙 **Dark Theme** - Easy on the eyes

## Quick Start

### Static Mode (Read-Only)

```bash
# Install dependencies
npm install

# Build brain data from markdown files
npm run build:brain

# Start dev server
npm run dev
```

### Full Mode (With Editing)

```bash
# Install dependencies
npm install

# Start both API server and frontend
npm run dev:full
```

Or run them separately:

```bash
# Terminal 1: API Server
npm run server

# Terminal 2: Frontend
npm run dev
```

## Configuration

### Brain Path

By default, the build script reads from `C:/Users/LeslieLeeFook/clawd/brain`.

Override with environment variable:
```bash
BRAIN_PATH=/path/to/your/brain npm run build:brain
```

### API Server

The API server runs on port 3001 by default. The frontend expects it at `http://localhost:3001/api`.

Override with environment variable:
```bash
PORT=3002 npm run server
```

Frontend configuration (create `.env.local`):
```
VITE_API_URL=http://localhost:3002/api
```

## Project Structure

```
second-brain-ui/
├── public/
│   └── brain.json        # Generated from markdown files
├── server/
│   └── index.js          # Express API for editing
├── scripts/
│   └── build-brain.js    # Converts markdown to JSON
├── src/
│   ├── components/
│   │   ├── FileTree.tsx      # Sidebar file browser
│   │   ├── NoteViewer.tsx    # Markdown renderer
│   │   ├── NoteEditor.tsx    # Edit mode
│   │   ├── CreateNoteModal.tsx
│   │   └── Search.tsx        # Full-text search
│   ├── api.ts            # API client
│   ├── types.ts          # TypeScript types
│   ├── App.tsx           # Main app
│   └── App.css           # Styles
└── package.json
```

## Markdown Features

### Wiki Links
```markdown
Link to another note: [[Note Title]]
```

### Tags
```markdown
Add tags anywhere: #project #idea #important
```

### Frontmatter
```markdown
---
title: My Note Title
tags: [project, important]
created: 2026-01-27
---

Note content here...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List all markdown files |
| GET | `/api/file/:path` | Get file content |
| PUT | `/api/file/:path` | Update file |
| POST | `/api/file` | Create new file |
| DELETE | `/api/file/:path` | Delete file |
| GET | `/api/folders` | List all folders |
| GET | `/api/health` | Health check |

## Development

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to GitHub Pages

```bash
npm run deploy
```

Note: GitHub Pages deployment is static (read-only mode). Edit functionality requires running the API server.

## License

MIT
