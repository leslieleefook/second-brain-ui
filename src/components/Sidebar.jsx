import { useState } from 'react'
import './Sidebar.css'

function FileTree({ items, selectedFile, onSelectFile, level = 0 }) {
  return (
    <ul className="file-tree" style={{ paddingLeft: level * 12 }}>
      {items.map(item => (
        <FileTreeItem 
          key={item.path} 
          item={item} 
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          level={level}
        />
      ))}
    </ul>
  )
}

function FileTreeItem({ item, selectedFile, onSelectFile, level }) {
  const [expanded, setExpanded] = useState(level === 0)
  
  if (item.type === 'folder') {
    return (
      <li className="tree-folder">
        <div 
          className="tree-folder-header" 
          onClick={() => setExpanded(!expanded)}
        >
          <span className="tree-icon">{expanded ? '📂' : '📁'}</span>
          <span className="tree-name">{item.name}</span>
        </div>
        {expanded && item.children?.length > 0 && (
          <FileTree 
            items={item.children} 
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            level={level + 1}
          />
        )}
      </li>
    )
  }
  
  const isSelected = selectedFile === item.path
  return (
    <li 
      className={`tree-file ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectFile(item.path)}
    >
      <span className="tree-icon">📄</span>
      <span className="tree-name">{item.name.replace('.md', '')}</span>
    </li>
  )
}

function SearchResults({ results, onSelectFile }) {
  if (results.length === 0) return null
  
  return (
    <div className="search-results">
      <div className="search-results-header">
        Found {results.length} result{results.length !== 1 ? 's' : ''}
      </div>
      <ul>
        {results.map(r => (
          <li 
            key={r.path} 
            className="search-result"
            onClick={() => onSelectFile(r.path)}
          >
            <span className="result-name">{r.name.replace('.md', '')}</span>
            <span className="result-path">{r.path}</span>
            {r.snippet && (
              <span className="result-snippet">...{r.snippet}...</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Sidebar({ 
  tree, 
  loading, 
  selectedFile, 
  onSelectFile,
  searchQuery,
  onSearchChange,
  searchResults
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>🧠 Second Brain</h1>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="sidebar-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : searchQuery ? (
          <SearchResults 
            results={searchResults} 
            onSelectFile={(path) => {
              onSelectFile(path)
              onSearchChange('')
            }}
          />
        ) : (
          <FileTree 
            items={tree} 
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
          />
        )}
      </div>
    </aside>
  )
}
