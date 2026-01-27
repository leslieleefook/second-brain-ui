#!/usr/bin/env node
/**
 * Build script that reads markdown files from the brain folder
 * and generates a JSON file with all content, metadata, and links
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const BRAIN_PATH = process.env.BRAIN_PATH || 'P:/Clawdbot/brain';
const OUTPUT_PATH = './public/brain.json';

// Extract wiki-style links [[Link Name]]
function extractWikiLinks(content) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)];
}

// Extract hashtags #tag
function extractTags(content) {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g;
  const tags = [];
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    // Ignore common markdown patterns like headers
    if (!['', ' '].includes(content[match.index - 1] || '')) continue;
    tags.push(match[1].toLowerCase());
  }
  return [...new Set(tags)];
}

// Build file tree structure
function buildTree(files) {
  const tree = { name: 'brain', type: 'folder', children: {} };
  
  for (const file of files) {
    const parts = file.relativePath.split('/');
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: isFile ? 'file' : 'folder',
          ...(isFile ? { id: file.id } : { children: {} })
        };
      }
      
      if (!isFile) {
        current = current.children[part];
      }
    }
  }
  
  // Convert children objects to arrays recursively
  function convertToArray(node) {
    if (node.children) {
      node.children = Object.values(node.children)
        .map(convertToArray)
        .sort((a, b) => {
          // Folders first, then alphabetically
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
    }
    return node;
  }
  
  return convertToArray(tree);
}

async function build() {
  console.log(`📚 Building brain from: ${BRAIN_PATH}`);
  
  // Find all markdown files
  const pattern = path.join(BRAIN_PATH, '**/*.md').replace(/\\/g, '/');
  const mdFiles = await glob(pattern);
  
  console.log(`📄 Found ${mdFiles.length} markdown files`);
  
  const files = [];
  const linkIndex = {}; // Map of title -> file id for backlinks
  
  // First pass: read all files
  for (const filePath of mdFiles) {
    const relativePath = path.relative(BRAIN_PATH, filePath).replace(/\\/g, '/');
    const id = relativePath.replace(/\.md$/, '').replace(/\//g, '--');
    const fileName = path.basename(filePath, '.md');
    
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(rawContent);
    
    const wikiLinks = extractWikiLinks(content);
    const tags = extractTags(content);
    
    const file = {
      id,
      relativePath,
      fileName,
      title: frontmatter.title || fileName,
      content,
      frontmatter,
      wikiLinks,
      tags,
      backlinks: [] // Will be populated in second pass
    };
    
    files.push(file);
    
    // Index by various names for link resolution
    linkIndex[fileName.toLowerCase()] = id;
    linkIndex[file.title.toLowerCase()] = id;
  }
  
  // Second pass: resolve backlinks
  for (const file of files) {
    for (const link of file.wikiLinks) {
      const targetId = linkIndex[link.toLowerCase()];
      if (targetId) {
        const targetFile = files.find(f => f.id === targetId);
        if (targetFile && !targetFile.backlinks.includes(file.id)) {
          targetFile.backlinks.push(file.id);
        }
      }
    }
  }
  
  // Build file tree
  const tree = buildTree(files);
  
  // Create output
  const output = {
    generatedAt: new Date().toISOString(),
    sourcePath: BRAIN_PATH,
    fileCount: files.length,
    files: files.reduce((acc, f) => {
      acc[f.id] = f;
      return acc;
    }, {}),
    tree,
    linkIndex
  };
  
  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  
  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  
  console.log(`✅ Brain built successfully!`);
  console.log(`   📁 Files: ${files.length}`);
  console.log(`   🔗 Links indexed: ${Object.keys(linkIndex).length}`);
  console.log(`   📦 Output: ${OUTPUT_PATH}`);
}

build().catch(console.error);
