import { useMemo } from 'react';
import { marked } from 'marked';
import type { BrainFile } from '../types';

interface NoteViewerProps {
  file: BrainFile | null;
  files: Record<string, BrainFile>;
  linkIndex: Record<string, string>;
  onNavigate: (id: string) => void;
}

export function NoteViewer({ file, files, linkIndex, onNavigate }: NoteViewerProps) {
  const renderedContent = useMemo(() => {
    if (!file) return '';
    
    // Convert wiki links to clickable links
    let content = file.content.replace(
      /\[\[([^\]]+)\]\]/g,
      (_, linkText) => {
        const targetId = linkIndex[linkText.toLowerCase()];
        if (targetId) {
          return `<a href="#" class="wiki-link" data-link-id="${targetId}">${linkText}</a>`;
        }
        return `<span class="wiki-link broken">${linkText}</span>`;
      }
    );
    
    // Convert hashtags to styled spans
    content = content.replace(
      /(?<=\s|^)#([a-zA-Z0-9_-]+)/g,
      '<span class="tag">#$1</span>'
    );
    
    return marked.parse(content, { async: false }) as string;
  }, [file, linkIndex]);
  
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('wiki-link') && target.dataset.linkId) {
      e.preventDefault();
      onNavigate(target.dataset.linkId);
    }
  };
  
  if (!file) {
    return (
      <div className="note-viewer empty">
        <div className="empty-state">
          <span className="empty-icon">🧠</span>
          <h2>Welcome to your Second Brain</h2>
          <p>Select a note from the sidebar or use search to get started.</p>
        </div>
      </div>
    );
  }
  
  const backlinkedFiles = file.backlinks
    .map(id => files[id])
    .filter(Boolean);
  
  return (
    <div className="note-viewer">
      <div className="note-header">
        <h1>{file.title}</h1>
        <div className="note-meta">
          <span className="note-path">{file.relativePath}</span>
        </div>
        {file.tags.length > 0 && (
          <div className="note-tags">
            {file.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      <div 
        className="note-content markdown-body"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
        onClick={handleClick}
      />
      
      {backlinkedFiles.length > 0 && (
        <div className="backlinks-section">
          <h3>🔗 Backlinks ({backlinkedFiles.length})</h3>
          <div className="backlinks-list">
            {backlinkedFiles.map(linked => (
              <div 
                key={linked.id}
                className="backlink-item"
                onClick={() => onNavigate(linked.id)}
              >
                <span className="backlink-title">{linked.title}</span>
                <span className="backlink-path">{linked.relativePath}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {file.wikiLinks.length > 0 && (
        <div className="outlinks-section">
          <h3>📤 Links from this note ({file.wikiLinks.length})</h3>
          <div className="outlinks-list">
            {file.wikiLinks.map(link => {
              const targetId = linkIndex[link.toLowerCase()];
              const targetFile = targetId ? files[targetId] : null;
              return (
                <span 
                  key={link}
                  className={`outlink-item ${targetFile ? '' : 'broken'}`}
                  onClick={() => targetFile && onNavigate(targetFile.id)}
                >
                  {link}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
