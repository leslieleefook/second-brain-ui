import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { FuseResultMatch } from 'fuse.js';
import type { BrainFile } from '../types';

interface SearchProps {
  files: Record<string, BrainFile>;
  onSelect: (id: string) => void;
}

interface SearchResult {
  item: BrainFile;
  score: number;
  matches?: readonly FuseResultMatch[];
}

export function Search({ files, onSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Create Fuse instance with optimized settings for note search
  const fuse = useMemo(() => {
    const fileList = Object.values(files);
    return new Fuse(fileList, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'tags', weight: 0.3 },
        { name: 'content', weight: 0.2 },
        { name: 'fileName', weight: 0.1 },
      ],
      threshold: 0.4, // Fuzzy matching tolerance (0 = exact, 1 = match anything)
      distance: 100, // How far to search within content
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true, // Search entire content, not just beginning
      minMatchCharLength: 2,
      useExtendedSearch: true, // Enable extended search operators
    });
  }, [files]);
  
  // Perform search with Fuse.js
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    
    // Use extended search syntax: prefix with ' for exact match, ^ for starts with
    const searchResults = fuse.search(query, { limit: 15 });
    
    return searchResults.map(result => ({
      item: result.item,
      score: result.score ?? 0,
      matches: result.matches,
    }));
  }, [query, fuse]);
  
  // Reset selection when results change
  useEffect(() => {
    // This is intentional - reset selection when search results change
    // eslint-disable-next-line react-hooks/set-state-in-effect -- necessary for UX
    setSelectedIndex(0);
  }, [results]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex].item.id);
          setQuery('');
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, onSelect]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && isOpen) {
      const selectedEl = resultsRef.current.querySelector('.search-result.selected');
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);
  
  // Global keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
  
  // Get snippet with highlighted match
  const getSnippet = (result: SearchResult): string => {
    const contentMatch = result.matches?.find(m => m.key === 'content');
    if (!contentMatch || !contentMatch.indices?.length) {
      // No content match, return beginning of content
      return result.item.content.slice(0, 100).replace(/\n/g, ' ') + '...';
    }
    
    // Get the first match position
    const [start] = contentMatch.indices[0];
    const snippetStart = Math.max(0, start - 40);
    const snippetEnd = Math.min(result.item.content.length, start + 100);
    let snippet = result.item.content.slice(snippetStart, snippetEnd).replace(/\n/g, ' ');
    
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < result.item.content.length) snippet = snippet + '...';
    
    return snippet;
  };
  
  // Highlight matched text
  const highlightMatches = (text: string, matchKey: string, result: SearchResult) => {
    const match = result.matches?.find(m => m.key === matchKey);
    if (!match?.indices?.length) return text;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    match.indices.forEach((indices: readonly [number, number], i: number) => {
      const [start, end] = indices;
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      parts.push(
        <mark key={i}>{text.slice(start, end + 1)}</mark>
      );
      lastIndex = end + 1;
    });
    
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts;
  };
  
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search notes... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button 
            className="search-clear" 
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {isOpen && query.trim() && (
        <div className="search-results" ref={resultsRef}>
          {results.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                <span className="search-hint">↑↓ Navigate • Enter Select • Esc Close</span>
              </div>
              {results.map((result, index) => (
                <div 
                  key={result.item.id}
                  className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => {
                    onSelect(result.item.id);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="search-result-header">
                    <div className="search-result-title">
                      {highlightMatches(result.item.title, 'title', result)}
                    </div>
                    <div className="search-result-score">
                      {((1 - (result.score || 0)) * 100).toFixed(0)}%
                    </div>
                  </div>
                  {result.item.tags.length > 0 && (
                    <div className="search-result-tags">
                      {result.item.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="search-result-snippet">
                    {getSnippet(result)}
                  </div>
                  <div className="search-result-path">
                    {result.item.relativePath}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="search-no-results">
              <span className="search-no-results-icon">🔎</span>
              <span>No notes found for "{query}"</span>
              <span className="search-tip">Try different keywords or check spelling</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
