import { useState, useMemo } from 'react';
import type { BrainFile } from '../types';

interface SearchProps {
  files: Record<string, BrainFile>;
  onSelect: (id: string) => void;
}

export function Search({ files, onSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const fileList = Object.values(files);
    
    return fileList
      .map(file => {
        let score = 0;
        const titleMatch = file.title.toLowerCase().includes(q);
        const contentMatch = file.content.toLowerCase().includes(q);
        const tagMatch = file.tags.some(t => t.includes(q));
        
        if (titleMatch) score += 10;
        if (tagMatch) score += 5;
        if (contentMatch) score += 1;
        
        // Find snippet
        let snippet = '';
        if (contentMatch) {
          const idx = file.content.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 40);
          const end = Math.min(file.content.length, idx + q.length + 60);
          snippet = '...' + file.content.slice(start, end).replace(/\n/g, ' ') + '...';
        }
        
        return { file, score, snippet, titleMatch, tagMatch };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [query, files]);
  
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map(({ file, snippet, titleMatch, tagMatch }) => (
            <div 
              key={file.id}
              className="search-result"
              onClick={() => {
                onSelect(file.id);
                setQuery('');
              }}
            >
              <div className="search-result-title">
                {titleMatch ? highlightMatch(file.title, query) : file.title}
              </div>
              {file.tags.length > 0 && (
                <div className="search-result-tags">
                  {file.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={`tag ${tagMatch && tag.includes(query.toLowerCase()) ? 'highlight' : ''}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {snippet && (
                <div className="search-result-snippet">
                  {highlightMatch(snippet, query)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <mark key={i}>{part}</mark> 
      : part
  );
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
