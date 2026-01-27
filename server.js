import express from 'express';
import cors from 'cors';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Configure brain folder path
const BRAIN_PATH = 'P:\\Clawdbot\\brain';

app.use(cors());
app.use(express.json());

// Get file tree structure
async function getFileTree(dir, basePath = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const items = [];
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      const children = await getFileTree(fullPath, relativePath);
      items.push({
        name: entry.name,
        path: relativePath.replace(/\\/g, '/'),
        type: 'folder',
        children
      });
    } else if (extname(entry.name) === '.md') {
      items.push({
        name: entry.name,
        path: relativePath.replace(/\\/g, '/'),
        type: 'file'
      });
    }
  }
  
  // Sort: folders first, then files, alphabetically
  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  
  return items;
}

// API: Get file tree
app.get('/api/tree', async (req, res) => {
  try {
    const tree = await getFileTree(BRAIN_PATH);
    res.json(tree);
  } catch (error) {
    console.error('Error reading tree:', error);
    res.status(500).json({ error: 'Failed to read brain folder' });
  }
});

// API: Get file content
app.get('/api/file/*', async (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = join(BRAIN_PATH, filePath);
    
    // Security: Ensure path is within BRAIN_PATH
    const resolved = join(BRAIN_PATH, filePath);
    if (!resolved.startsWith(BRAIN_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const content = await readFile(fullPath, 'utf-8');
    const stats = await stat(fullPath);
    
    res.json({
      path: filePath,
      content,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// API: Search files
app.get('/api/search', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.json([]);
  }
  
  async function searchFiles(dir, results = []) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await searchFiles(fullPath, results);
      } else if (extname(entry.name) === '.md') {
        const relativePath = relative(BRAIN_PATH, fullPath).replace(/\\/g, '/');
        
        // Search in filename
        if (entry.name.toLowerCase().includes(query)) {
          results.push({ path: relativePath, name: entry.name, matchType: 'filename' });
        } else {
          // Search in content
          try {
            const content = await readFile(fullPath, 'utf-8');
            if (content.toLowerCase().includes(query)) {
              // Find snippet
              const idx = content.toLowerCase().indexOf(query);
              const start = Math.max(0, idx - 50);
              const end = Math.min(content.length, idx + query.length + 50);
              const snippet = content.slice(start, end);
              results.push({ path: relativePath, name: entry.name, matchType: 'content', snippet });
            }
          } catch (e) {}
        }
      }
    }
    
    return results;
  }
  
  try {
    const results = await searchFiles(BRAIN_PATH);
    res.json(results.slice(0, 20)); // Limit results
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Second Brain API running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${BRAIN_PATH}`);
});
