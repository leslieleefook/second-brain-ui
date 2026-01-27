// Demo data for static GitHub Pages deployment
// This replaces API calls when running in demo mode

export const demoTree = [
  {
    name: "Getting Started",
    path: "Getting Started",
    type: "folder",
    children: [
      { name: "Welcome.md", path: "Getting Started/Welcome.md", type: "file" },
      { name: "How to Use.md", path: "Getting Started/How to Use.md", type: "file" }
    ]
  },
  {
    name: "Concepts",
    path: "Concepts",
    type: "folder",
    children: [
      { name: "Second Brain.md", path: "Concepts/Second Brain.md", type: "file" },
      { name: "PKM.md", path: "Concepts/PKM.md", type: "file" },
      { name: "Zettelkasten.md", path: "Concepts/Zettelkasten.md", type: "file" }
    ]
  },
  {
    name: "Projects",
    path: "Projects",
    type: "folder",
    children: [
      { name: "Example Project.md", path: "Projects/Example Project.md", type: "file" }
    ]
  },
  { name: "README.md", path: "README.md", type: "file" }
];

export const demoFiles = {
  "Getting Started/Welcome.md": {
    path: "Getting Started/Welcome.md",
    content: `# Welcome to Second Brain UI 🧠

This is a **demo** of the Second Brain UI - a beautiful markdown knowledge base viewer.

## Features

- 📁 **File Tree Navigation** - Browse your notes with collapsible folders
- 🔍 **Full-text Search** - Find anything instantly
- 📝 **Markdown Rendering** - GitHub Flavored Markdown support
- 🔗 **Wiki Links** - Link notes with \`[[double brackets]]\`
- 🌙 **Dark Theme** - Easy on the eyes

## Try It Out

1. Click on files in the sidebar to view them
2. Use the search box to find content
3. Click on [[Concepts/Second Brain|Second Brain]] to learn more

---

> "Your mind is for having ideas, not holding them." — David Allen
`,
    modified: new Date().toISOString()
  },
  "Getting Started/How to Use.md": {
    path: "Getting Started/How to Use.md",
    content: `# How to Use Second Brain UI

## Navigation

### File Tree
The sidebar shows your knowledge base structure:
- 📁 **Folders** - Click to expand/collapse
- 📄 **Files** - Click to view content

### Search
Type in the search box to find notes:
- Searches file names and content
- Results show matching snippets
- Click a result to open the file

## Markdown Support

This viewer supports **GitHub Flavored Markdown**:

### Text Formatting
- **Bold** with \`**text**\`
- *Italic* with \`*text*\`
- ~~Strikethrough~~ with \`~~text~~\`
- \`inline code\` with backticks

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

### Tables

| Feature | Status |
|---------|--------|
| File Tree | ✅ |
| Search | ✅ |
| Wiki Links | ✅ |
| Dark Theme | ✅ |

### Task Lists

- [x] Install dependencies
- [x] Start the app
- [ ] Build your knowledge base

## Wiki Links

Link to other notes using double brackets:
- \`[[Note Name]]\` - Link to a note
- \`[[Path/Note|Display Text]]\` - Link with custom text

Example: [[Concepts/PKM|Learn about PKM]]
`,
    modified: new Date().toISOString()
  },
  "Concepts/Second Brain.md": {
    path: "Concepts/Second Brain.md",
    content: `# Second Brain 🧠

A **Second Brain** is a personal knowledge management system that extends your biological memory.

## The Concept

Coined by Tiago Forte, the Second Brain methodology helps you:

1. **Capture** - Save ideas, insights, and information
2. **Organize** - Structure knowledge for easy retrieval
3. **Distill** - Extract the essence of what you learn
4. **Express** - Create and share your ideas

## Why Build a Second Brain?

> "We only know what we make." — Giambattista Vico

- 🧠 **Free Your Mind** - Stop trying to remember everything
- 💡 **Connect Ideas** - Find unexpected connections
- 🚀 **Boost Creativity** - Build on past insights
- 📈 **Compound Knowledge** - Ideas grow over time

## Related Concepts

- [[Concepts/PKM|Personal Knowledge Management]]
- [[Concepts/Zettelkasten|Zettelkasten Method]]

## Resources

- [Building a Second Brain](https://www.buildingasecondbrain.com/) by Tiago Forte
- [PARA Method](https://fortelabs.co/blog/para/) - Organizational system
`,
    modified: new Date().toISOString()
  },
  "Concepts/PKM.md": {
    path: "Concepts/PKM.md",
    content: `# Personal Knowledge Management (PKM)

**PKM** is the practice of collecting, organizing, and using information for personal growth and productivity.

## Core Principles

### 1. Capture Everything
Don't rely on memory. Write it down:
- Ideas and insights
- Quotes and references
- Meeting notes
- Learnings

### 2. Organize for Retrieval
Structure your notes so you can find them:
- Use consistent naming
- Create folders/categories
- Tag related concepts
- Build connections

### 3. Review Regularly
Knowledge needs maintenance:
- Weekly reviews
- Spaced repetition
- Refine and update

## Popular PKM Systems

| System | Focus |
|--------|-------|
| [[Concepts/Zettelkasten]] | Atomic notes, connections |
| PARA | Projects, Areas, Resources, Archives |
| Johnny Decimal | Numbered organization |
| [[Concepts/Second Brain]] | Digital extension of memory |

## Tools

Popular tools for PKM:
- **Obsidian** - Local-first, markdown
- **Notion** - All-in-one workspace
- **Roam Research** - Networked thought
- **Logseq** - Outliner + wiki
`,
    modified: new Date().toISOString()
  },
  "Concepts/Zettelkasten.md": {
    path: "Concepts/Zettelkasten.md",
    content: `# Zettelkasten Method

The **Zettelkasten** ("slip box" in German) is a note-taking system developed by sociologist Niklas Luhmann.

## How It Works

### Atomic Notes
Each note contains **one idea**:
- Small and focused
- Self-contained
- Easy to link

### Linking
Notes connect to form a knowledge network:
\`\`\`
[Note A] ←→ [Note B]
    ↓
[Note C] ←→ [Note D]
\`\`\`

### Emergence
Over time, clusters of ideas emerge:
- Unexpected connections
- New insights
- Building blocks for creation

## Luhmann's System

Niklas Luhmann wrote:
- 70+ books
- 400+ scholarly articles
- Using ~90,000 index cards

> "I don't think everything on my own. It happens in my Zettelkasten."

## Key Practices

1. **Write in your own words** - Don't copy, understand
2. **One idea per note** - Atomic = powerful
3. **Link liberally** - More connections = more value
4. **Add context** - Why is this important?
5. **Review and revise** - Notes evolve

## Related

- [[Concepts/PKM|Personal Knowledge Management]]
- [[Concepts/Second Brain|Second Brain]]
`,
    modified: new Date().toISOString()
  },
  "Projects/Example Project.md": {
    path: "Projects/Example Project.md",
    content: `# Example Project 📋

This is an example project note showing how you might track a project in your Second Brain.

## Overview

**Status:** 🟢 Active  
**Started:** 2024-01-01  
**Goal:** Demonstrate project tracking

## Tasks

- [x] Define project scope
- [x] Create initial structure
- [ ] Add more features
- [ ] Document everything

## Notes

### Meeting 2024-01-15
- Discussed timeline
- Agreed on milestones
- Next steps defined

### Ideas
- Could add tagging system
- Consider mobile view
- Integration with other tools

## Resources

- [[Getting Started/Welcome|Getting Started Guide]]
- [[Concepts/Second Brain|About Second Brain]]

## Log

| Date | Update |
|------|--------|
| Jan 1 | Project created |
| Jan 15 | First meeting |
| Jan 20 | Demo ready |

---

*This note is part of the [[Projects]] folder.*
`,
    modified: new Date().toISOString()
  },
  "README.md": {
    path: "README.md",
    content: `# My Knowledge Base 📚

Welcome to this demo knowledge base!

## Structure

- **Getting Started/** - New here? Start here!
- **Concepts/** - Core ideas and methodologies
- **Projects/** - Active and archived projects

## Quick Links

- [[Getting Started/Welcome|Welcome Guide]]
- [[Concepts/Second Brain|What is a Second Brain?]]
- [[Concepts/PKM|Personal Knowledge Management]]

## About This Demo

This is a demo of **Second Brain UI**, a markdown knowledge base viewer.

The full version connects to your local markdown files via an API server.
This demo uses bundled sample content to showcase the features.

### Features Shown

✅ File tree navigation  
✅ Markdown rendering  
✅ Wiki-style links  
✅ Code blocks  
✅ Tables  
✅ Task lists  
✅ Search functionality  

---

Made with 💜 by [Clawdbot](https://github.com/leslieleefook)
`,
    modified: new Date().toISOString()
  }
};

// Simple search implementation for demo mode
export function demoSearch(query) {
  const q = query.toLowerCase();
  const results = [];
  
  for (const [path, file] of Object.entries(demoFiles)) {
    const nameMatch = path.toLowerCase().includes(q);
    const contentMatch = file.content.toLowerCase().includes(q);
    
    if (nameMatch || contentMatch) {
      let snippet = '';
      if (contentMatch) {
        const idx = file.content.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 40);
        const end = Math.min(file.content.length, idx + 60);
        snippet = file.content.slice(start, end).replace(/\n/g, ' ');
      }
      
      results.push({
        path,
        name: path.split('/').pop(),
        snippet
      });
    }
  }
  
  return results;
}
