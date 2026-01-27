import { useState, useEffect } from 'react';
import { FileTree } from './components/FileTree';
import { Search } from './components/Search';
import { NoteViewer } from './components/NoteViewer';
import type { BrainData } from './types';
import './App.css';

function App() {
  const [brain, setBrain] = useState<BrainData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('./brain.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load brain data');
        return res.json();
      })
      .then(data => {
        setBrain(data);
        // Auto-select INDEX if it exists
        if (data.files['INDEX']) {
          setSelectedId('INDEX');
        }
      })
      .catch(err => {
        console.error('Failed to load brain:', err);
        setError('Failed to load brain data. Make sure to run the build script first.');
      });
  }, []);
  
  // Handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      if (hash && brain?.files[hash]) {
        setSelectedId(hash);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Check initial hash
    const hash = window.location.hash.slice(1);
    if (hash && brain?.files[hash]) {
      setSelectedId(hash);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [brain]);
  
  const handleSelect = (id: string) => {
    setSelectedId(id);
    window.history.pushState(null, '', `#${id}`);
  };
  
  if (error) {
    return (
      <div className="app error-state">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <h2>Error Loading Brain</h2>
          <p>{error}</p>
          <code>npm run build:brain</code>
        </div>
      </div>
    );
  }
  
  if (!brain) {
    return (
      <div className="app loading-state">
        <div className="loading">
          <span className="loading-icon">🧠</span>
          <p>Loading your Second Brain...</p>
        </div>
      </div>
    );
  }
  
  const selectedFile = selectedId ? brain.files[selectedId] : null;
  
  return (
    <div className="app">
      <header className="app-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        <Search files={brain.files} onSelect={handleSelect} />
        <div className="header-stats">
          <span>{brain.fileCount} notes</span>
        </div>
      </header>
      
      <div className="app-body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <FileTree 
            tree={brain.tree}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </aside>
        
        <main className="main-content">
          <NoteViewer 
            file={selectedFile}
            files={brain.files}
            linkIndex={brain.linkIndex}
            onNavigate={handleSelect}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
