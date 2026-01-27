# 🧠 Second Brain UI

A beautiful, minimal web interface for browsing your markdown-based knowledge base. Features include:

- 📂 **File tree navigation** - Browse your notes by folder structure
- 🔍 **Full-text search** - Search across all notes by title, content, and tags
- 🔗 **Wiki-style links** - Click `[[links]]` to navigate between notes
- ↩️ **Backlinks** - See which notes link to the current one
- 🏷️ **Tag support** - Hashtags are highlighted and searchable
- 🌙 **Dark mode** - Easy on the eyes, always

## Quick Start

```bash
# Install dependencies
npm install

# Build brain data from your markdown folder
npm run build:brain

# Start development server
npm run dev
```

## Configuration

By default, the build script reads from `P:/Clawdbot/brain`. To use a different folder:

```bash
# Set environment variable before building
$env:BRAIN_PATH = "C:/path/to/your/notes"
npm run build:brain
```

## Deployment to GitHub Pages

### Option 1: Manual Deploy

```bash
# Build everything
npm run build

# The dist/ folder is ready to deploy
# Upload dist/ contents to your GitHub Pages branch
```

### Option 2: Using gh-pages

```bash
# Install gh-pages
npm install -D gh-pages

# Deploy
npm run deploy
```

### Option 3: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - run: npm ci
      - run: npm run build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

## Features

### Wiki Links
Use `[[Note Name]]` syntax to link between notes. The UI will:
- Resolve links to matching files
- Show backlinks at the bottom of each note
- Highlight broken links in red

### Tags
Use `#tag` syntax anywhere in your notes. Tags are:
- Displayed as chips in the note header
- Searchable via the search bar
- Highlighted in the content

### File Structure
The UI preserves your folder structure. Organize your notes however you like:

```
brain/
├── inbox/           # Quick capture
├── projects/        # Active work
├── areas/           # Ongoing responsibilities
├── resources/       # Reference material
└── archive/         # Completed items
```

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Marked** - Markdown parsing
- **Gray Matter** - Frontmatter parsing

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:brain` | Generate brain.json from markdown files |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |

## License

MIT
