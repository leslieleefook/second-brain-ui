import { useState, useEffect } from 'react';

interface CreateNoteModalProps {
  folders: string[];
  onClose: () => void;
  onCreate: (path: string, title: string) => Promise<void>;
}

export function CreateNoteModal({ folders, onClose, onCreate }: CreateNoteModalProps) {
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('inbox');
  const [customFolder, setCustomFolder] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // ESC to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setCreating(true);
    setError(null);
    
    try {
      const targetFolder = folder === '__custom__' ? customFolder : folder;
      const fileName = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      const path = targetFolder 
        ? `${targetFolder}/${fileName}.md`
        : `${fileName}.md`;
      
      await onCreate(path, title);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Create New Note</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                ⚠️ {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="My New Note"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="folder">Folder</label>
              <select
                id="folder"
                value={folder}
                onChange={e => setFolder(e.target.value)}
              >
                <option value="">Root</option>
                {folders.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
                <option value="__custom__">+ Custom folder...</option>
              </select>
            </div>
            
            {folder === '__custom__' && (
              <div className="form-group">
                <label htmlFor="customFolder">Custom Folder Path</label>
                <input
                  id="customFolder"
                  type="text"
                  value={customFolder}
                  onChange={e => setCustomFolder(e.target.value)}
                  placeholder="projects/my-project"
                />
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={creating || !title.trim()}
            >
              {creating ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
