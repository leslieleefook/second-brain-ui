import { useState, useEffect, useCallback } from 'react';
import { FileTree } from './components/FileTree';
import { Search } from './components/Search';
import { NoteViewer } from './components/NoteViewer';
import { NoteEditor } from './components/NoteEditor';
import { CreateNoteModal } from './components/CreateNoteModal';
import { api } from './api';
import type { BrainData } from './types';
import './App.css';

type Mode = 'view' | 'edit';

function App() {
  const [brain, setBrain] = useState<BrainData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('view');
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  
  // Check if API server is running
  useEffect(() => {
    api.checkHealth().then(setApiAvailable);
  }, []);
  
  // Load brain data
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
  
  // Load folders for create modal
  useEffect(() => {
    if (apiAvailable) {
      api.getFolders().then(setFolders).catch(console.error);
    }
  }, [apiAvailable]);
  
  // Handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      if (hash && brain?.files[hash]) {
        setSelectedId(hash);
        setMode('view');
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
  
  const handleSelect = useCallback((id: string) => {
    if (mode === 'edit') {
      if (!confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }
    setSelectedId(id);
    setMode('view');
    window.history.pushState(null, '', `#${id}`);
  }, [mode]);
  
  const handleEdit = () => {
    if (!apiAvailable) {
      alert('Edit mode requires the API server. Run: npm run server');
      return;
    }
    setMode('edit');
  };
  
  const handleSave = useCallback(async (content: string) => {
    if (!selectedId || !brain) return;
    
    const file = brain.files[selectedId];
    await api.saveFile(file.relativePath, content, file.frontmatter);
    
    // Update local state
    setBrain(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        files: {
          ...prev.files,
          [selectedId]: {
            ...prev.files[selectedId],
            content
          }
        }
      };
    });
    
    setMode('view');
  }, [selectedId, brain]);
  
  const handleCreate = useCallback(async (path: string, title: string) => {
    const content = `# ${title}\n\n`;
    await api.createFile(path, content, { title, created: new Date().toISOString() });
    
    // Reload brain data
    const res = await fetch('./brain.json');
    const data = await res.json();
    setBrain(data);
    
    // Select the new file
    const id = path.replace(/\.md$/, '').replace(/\//g, '--');
    if (data.files[id]) {
      setSelectedId(id);
      setMode('edit');
    }
  }, []);
  
  const handleDelete = useCallback(async () => {
    if (!selectedId || !brain) return;
    
    const file = brain.files[selectedId];
    if (!confirm(`Delete "${file.title}"? This cannot be undone.`)) {
      return;
    }
    
    await api.deleteFile(file.relativePath);
    
    // Remove from local state
    setBrain(prev => {
      if (!prev) return prev;
      const { [selectedId]: _, ...rest } = prev.files;
      return {
        ...prev,
        files: rest,
        fileCount: prev.fileCount - 1
      };
    });
    
    setSelectedId(null);
    setMode('view');
  }, [selectedId, brain]);
  
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
        <div className="header-actions">
          {apiAvailable && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateModal(true)}
              title="Create new note"
            >
              + New
            </button>
          )}
          {selectedFile && mode === 'view' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleEdit}
              title={apiAvailable ? 'Edit note' : 'API server not running'}
            >
              ✏️ Edit
            </button>
          )}
          {selectedFile && apiAvailable && mode === 'view' && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              title="Delete note"
            >
              🗑️
            </button>
          )}
        </div>
        <div className="header-stats">
          <span className={`api-status ${apiAvailable ? 'online' : 'offline'}`}>
            {apiAvailable ? '🟢' : '🔴'}
          </span>
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
          {mode === 'edit' && selectedFile ? (
            <NoteEditor
              file={selectedFile}
              onSave={handleSave}
              onCancel={() => setMode('view')}
            />
          ) : (
            <NoteViewer 
              file={selectedFile}
              files={brain.files}
              linkIndex={brain.linkIndex}
              onNavigate={handleSelect}
            />
          )}
        </main>
      </div>
      
      {showCreateModal && (
        <CreateNoteModal
          folders={folders}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default App;
