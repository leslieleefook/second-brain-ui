import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TreeNode } from '../types';

interface FileTreeProps {
  tree: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface TreeItemProps {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  level: number;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  path: string;
  filterQuery: string;
}

// Get file/folder icon based on name and type
function getIcon(node: TreeNode, isOpen: boolean): string {
  if (node.type === 'folder') {
    const folderName = node.name.toLowerCase();
    
    // Special folder icons
    if (folderName === 'projects') return isOpen ? '📂' : '💼';
    if (folderName === 'archive' || folderName === 'archives') return isOpen ? '📂' : '📦';
    if (folderName === 'daily' || folderName === 'journal') return isOpen ? '📂' : '📅';
    if (folderName === 'notes') return isOpen ? '📂' : '📝';
    if (folderName === 'ideas') return isOpen ? '📂' : '💡';
    if (folderName === 'reference' || folderName === 'references') return isOpen ? '📂' : '📚';
    if (folderName === 'people') return isOpen ? '📂' : '👥';
    if (folderName === 'meetings') return isOpen ? '📂' : '🤝';
    if (folderName === 'templates') return isOpen ? '📂' : '📋';
    if (folderName === 'attachments' || folderName === 'assets') return isOpen ? '📂' : '📎';
    
    return isOpen ? '📂' : '📁';
  }
  
  // File icons based on name
  const fileName = node.name.toLowerCase();
  if (fileName === 'index.md' || fileName === 'readme.md') return '🏠';
  if (fileName.includes('todo') || fileName.includes('task')) return '✅';
  if (fileName.includes('meeting')) return '🗓️';
  if (fileName.includes('note')) return '📝';
  
  return '📄';
}

// Count files in a folder recursively
function countFiles(node: TreeNode): number {
  if (node.type === 'file') return 1;
  if (!node.children) return 0;
  return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

// Check if node or any descendant matches filter
function matchesFilter(node: TreeNode, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  
  if (node.name.toLowerCase().includes(q)) return true;
  
  if (node.type === 'folder' && node.children) {
    return node.children.some(child => matchesFilter(child, q));
  }
  
  return false;
}

function TreeItem({ 
  node, 
  selectedId, 
  onSelect, 
  level, 
  expandedFolders,
  toggleFolder,
  path,
  filterQuery
}: TreeItemProps) {
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isOpen = expandedFolders.has(fullPath);
  const icon = getIcon(node, isOpen);
  
  // Check if this node matches the filter
  const matches = matchesFilter(node, filterQuery);
  if (!matches) return null;
  
  if (node.type === 'folder') {
    const fileCount = countFiles(node);
    
    // If filtering and folder doesn't directly match but has matching children,
    // expand it automatically
    const shouldForceExpand = Boolean(
      filterQuery && 
      !node.name.toLowerCase().includes(filterQuery.toLowerCase()) &&
      node.children?.some(child => matchesFilter(child, filterQuery))
    );
    
    const effectiveIsOpen = isOpen || shouldForceExpand;
    
    return (
      <div className="tree-folder">
        <div 
          className="tree-folder-header"
          onClick={() => toggleFolder(fullPath)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <span className={`tree-chevron ${effectiveIsOpen ? 'open' : ''}`}>▶</span>
          <span className="tree-icon">{getIcon(node, effectiveIsOpen)}</span>
          <span className="tree-name">{node.name}</span>
          <span className="tree-count">{fileCount}</span>
        </div>
        {effectiveIsOpen && node.children && (
          <div className="tree-folder-children">
            {node.children
              .sort((a, b) => {
                // Folders first, then files
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                // Alphabetical within each type
                return a.name.localeCompare(b.name);
              })
              .map((child) => (
                <TreeItem 
                  key={`${fullPath}/${child.name}`}
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  level={level + 1}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  path={fullPath}
                  filterQuery={filterQuery}
                />
              ))}
          </div>
        )}
      </div>
    );
  }
  
  const isSelected = node.id === selectedId;
  const displayName = node.name.replace(/\.md$/, '');
  
  return (
    <div 
      className={`tree-file ${isSelected ? 'selected' : ''}`}
      onClick={() => node.id && onSelect(node.id)}
      style={{ paddingLeft: `${level * 16 + 28}px` }}
      title={node.name}
    >
      <span className="tree-icon">{icon}</span>
      <span className="tree-name">
        {filterQuery ? highlightMatch(displayName, filterQuery) : displayName}
      </span>
    </div>
  );
}

// Highlight filter match in text
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Storage key for expanded folders
const EXPANDED_FOLDERS_KEY = 'second-brain-expanded-folders';

export function FileTree({ tree, selectedId, onSelect }: FileTreeProps) {
  const [filterQuery, setFilterQuery] = useState('');
  
  // Load expanded folders from localStorage
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(EXPANDED_FOLDERS_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load expanded folders', e);
    }
    // Default: expand first level
    return new Set(tree.children?.map(c => c.name) || []);
  });
  
  // Save expanded folders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_FOLDERS_KEY, JSON.stringify([...expandedFolders]));
    } catch (e) {
      console.warn('Failed to save expanded folders', e);
    }
  }, [expandedFolders]);
  
  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);
  
  const expandAll = useCallback(() => {
    const allFolders = new Set<string>();
    
    function collectFolders(node: TreeNode, path: string) {
      if (node.type === 'folder') {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        allFolders.add(fullPath);
        node.children?.forEach(child => collectFolders(child, fullPath));
      }
    }
    
    tree.children?.forEach(child => collectFolders(child, ''));
    setExpandedFolders(allFolders);
  }, [tree]);
  
  const collapseAll = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);
  
  // Calculate file count
  const totalFiles = useMemo(() => countFiles(tree), [tree]);
  
  // Scroll to selected file when it changes
  useEffect(() => {
    if (selectedId) {
      const selectedEl = document.querySelector('.tree-file.selected');
      selectedEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedId]);
  
  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span className="tree-icon">🧠</span>
        <span>Second Brain</span>
        <span className="tree-count">{totalFiles}</span>
      </div>
      
      <div className="file-tree-toolbar">
        <div className="file-tree-filter">
          <input
            type="text"
            placeholder="Filter..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="filter-input"
          />
          {filterQuery && (
            <button 
              className="filter-clear"
              onClick={() => setFilterQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        <div className="file-tree-actions">
          <button 
            className="tree-action-btn" 
            onClick={expandAll}
            title="Expand all folders"
          >
            +
          </button>
          <button 
            className="tree-action-btn" 
            onClick={collapseAll}
            title="Collapse all folders"
          >
            −
          </button>
        </div>
      </div>
      
      <div className="file-tree-content">
        {tree.children?.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        }).map((child) => (
          <TreeItem 
            key={child.name}
            node={child}
            selectedId={selectedId}
            onSelect={onSelect}
            level={0}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            path=""
            filterQuery={filterQuery}
          />
        ))}
        
        {filterQuery && !tree.children?.some(child => matchesFilter(child, filterQuery)) && (
          <div className="file-tree-empty">
            No files match "{filterQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
