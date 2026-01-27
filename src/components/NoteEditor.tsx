import { useState, useEffect, useCallback, useRef } from 'react';
import type { BrainFile } from '../types';

interface NoteEditorProps {
  file: BrainFile;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

export function NoteEditor({ file, onSave, onCancel }: NoteEditorProps) {
  const [content, setContent] = useState(file.content);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setContent(file.content);
    setHasChanges(false);
  }, [file]);
  
  useEffect(() => {
    // Focus textarea on mount
    textareaRef.current?.focus();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(e.target.value !== file.content);
  };
  
  const handleSave = useCallback(async () => {
    if (!hasChanges || saving) return;
    
    setSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [content, hasChanges, saving, onSave]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Escape to cancel (if no changes)
    if (e.key === 'Escape' && !hasChanges) {
      onCancel();
    }
    // Tab to insert spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setHasChanges(true);
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  // Toolbar actions
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newContent);
    setHasChanges(true);
    
    // Focus and set cursor
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selectedText.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + before.length;
      }
    }, 0);
  };
  
  const insertWikiLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      insertText('[[', ']]');
    } else {
      insertText('[[]]', '');
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  return (
    <div className="note-editor">
      <div className="editor-header">
        <h2>Editing: {file.title}</h2>
        <div className="editor-actions">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            className={`btn btn-primary ${hasChanges ? 'has-changes' : ''}`}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>
      
      <div className="editor-toolbar">
        <button title="Bold (Ctrl+B)" onClick={() => insertText('**', '**')}>
          <strong>B</strong>
        </button>
        <button title="Italic" onClick={() => insertText('_', '_')}>
          <em>I</em>
        </button>
        <button title="Code" onClick={() => insertText('`', '`')}>
          {'</>'}
        </button>
        <span className="toolbar-divider" />
        <button title="Heading 1" onClick={() => insertText('# ')}>
          H1
        </button>
        <button title="Heading 2" onClick={() => insertText('## ')}>
          H2
        </button>
        <button title="Heading 3" onClick={() => insertText('### ')}>
          H3
        </button>
        <span className="toolbar-divider" />
        <button title="Wiki Link [[]]" onClick={insertWikiLink}>
          🔗
        </button>
        <button title="Bullet List" onClick={() => insertText('- ')}>
          •
        </button>
        <button title="Checkbox" onClick={() => insertText('- [ ] ')}>
          ☐
        </button>
        <button title="Code Block" onClick={() => insertText('```\n', '\n```')}>
          {'{ }'}
        </button>
        <span className="toolbar-divider" />
        <button title="Tag" onClick={() => insertText('#')}>
          #
        </button>
        <button title="Quote" onClick={() => insertText('> ')}>
          "
        </button>
      </div>
      
      <div className="editor-body">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Start writing..."
          spellCheck
        />
      </div>
      
      <div className="editor-footer">
        <span className="editor-hint">
          💡 Ctrl+S to save • Tab for indent • [[Link]] for wiki links
        </span>
        <span className="editor-stats">
          {content.length} chars • {content.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}
