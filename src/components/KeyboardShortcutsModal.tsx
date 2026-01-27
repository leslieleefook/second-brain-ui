import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open search' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
  { keys: ['⌘', 'E'], description: 'Edit current note' },
  { keys: ['⌘', 'N'], description: 'Create new note' },
  { keys: ['⌘', 'G'], description: 'Toggle graph view' },
  { keys: ['⌘', '\\'], description: 'Toggle dark/light theme' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modal / Cancel editing' },
  { keys: ['↑', '↓'], description: 'Navigate search results' },
  { keys: ['Enter'], description: 'Select search result' },
  { keys: ['⌘', 'S'], description: 'Save note (in edit mode)' },
];

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal keyboard-modal">
        <div className="modal-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="shortcuts-list">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd>{key}</kbd>
                      {keyIndex < shortcut.keys.length - 1 && <span className="key-separator">+</span>}
                    </span>
                  ))}
                </div>
                <span className="shortcut-description">{shortcut.description}</span>
              </div>
            ))}
          </div>
          <div className="shortcuts-tip">
            <span>💡</span> On Windows/Linux, use <kbd>Ctrl</kbd> instead of <kbd>⌘</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
