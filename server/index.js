#!/usr/bin/env node
/**
 * Second Brain API Server
 * Provides read/write access to the brain folder
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const BRAIN_PATH = process.env.BRAIN_PATH || 'C:/Users/LeslieLeeFook/clawd/brain';

app.use(cors());
app.use(express.json());

// Validate path to prevent directory traversal
function validatePath(relativePath) {
  const normalizedPath = path.normalize(relativePath);
  if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
    throw new Error('Invalid path');
  }
  return path.join(BRAIN_PATH, normalizedPath);
}

// Get all files
app.get('/api/files', async (req, res) => {
  try {
    const files = await walkDir(BRAIN_PATH);
    res.json({ files, brainPath: BRAIN_PATH });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single file
app.get('/api/file/*', async (req, res) => {
  try {
    const relativePath = req.params[0];
    const fullPath = validatePath(relativePath);
    
    const content = await fs.readFile(fullPath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);
    
    res.json({
      path: relativePath,
      content: body,
      frontmatter,
      rawContent: content
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Save file
app.put('/api/file/*', async (req, res) => {
  try {
    const relativePath = req.params[0];
    const fullPath = validatePath(relativePath);
    const { content, frontmatter } = req.body;
    
    // Reconstruct file with frontmatter if provided
    let fileContent = content;
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      fileContent = matter.stringify(content, frontmatter);
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileContent, 'utf-8');
    
    res.json({ success: true, path: relativePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new file
app.post('/api/file', async (req, res) => {
  try {
    const { path: relativePath, content = '', frontmatter = {} } = req.body;
    
    if (!relativePath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const fullPath = validatePath(relativePath);
    
    // Check if file already exists
    try {
      await fs.access(fullPath);
      return res.status(409).json({ error: 'File already exists' });
    } catch {
      // File doesn't exist, continue
    }
    
    // Create content with frontmatter
    let fileContent = content;
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      fileContent = matter.stringify(content, frontmatter);
    }
    
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileContent, 'utf-8');
    
    res.json({ success: true, path: relativePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
app.delete('/api/file/*', async (req, res) => {
  try {
    const relativePath = req.params[0];
    const fullPath = validatePath(relativePath);
    
    await fs.unlink(fullPath);
    res.json({ success: true, path: relativePath });
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Get folders
app.get('/api/folders', async (req, res) => {
  try {
    const folders = await getFolders(BRAIN_PATH);
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recursive directory walk
async function walkDir(dir, baseDir = dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) {
        files.push(...await walkDir(fullPath, baseDir));
      }
    } else if (entry.name.endsWith('.md')) {
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data: frontmatter } = matter(content);
      const stats = await fs.stat(fullPath);
      
      files.push({
        path: relativePath,
        name: entry.name.replace(/\.md$/, ''),
        folder: path.dirname(relativePath),
        frontmatter,
        modified: stats.mtime.toISOString(),
        size: stats.size
      });
    }
  }
  
  return files;
}

// Get folder structure
async function getFolders(dir, baseDir = dir) {
  const folders = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      folders.push(relativePath);
      folders.push(...await getFolders(fullPath, baseDir));
    }
  }
  
  return folders;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brainPath: BRAIN_PATH });
});

app.listen(PORT, () => {
  console.log(`🧠 Second Brain API running on http://localhost:${PORT}`);
  console.log(`📁 Brain path: ${BRAIN_PATH}`);
});
