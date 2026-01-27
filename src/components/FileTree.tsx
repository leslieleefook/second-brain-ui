import { useState } from 'react';
import type { TreeNode } from '../types';

interface FileTreeProps {
  tree: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  level?: number;
}

function TreeItem({ node, selectedId, onSelect, level = 0 }: FileTreeProps & { node: TreeNode }) {
  const [isOpen, setIsOpen] = useState(level < 2);
  
  if (node.type === 'folder') {
    return (
      <div className="tree-folder">
        <div 
          className="tree-folder-header"
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <span className="tree-icon">{isOpen ? '📂' : '📁'}</span>
          <span className="tree-name">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div className="tree-folder-children">
            {node.children.map((child, i) => (
              <TreeItem 
                key={child.name + i} 
                node={child} 
                tree={node}
                selectedId={selectedId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  const isSelected = node.id === selectedId;
  
  return (
    <div 
      className={`tree-file ${isSelected ? 'selected' : ''}`}
      onClick={() => node.id && onSelect(node.id)}
      style={{ paddingLeft: `${level * 16}px` }}
    >
      <span className="tree-icon">📄</span>
      <span className="tree-name">{node.name.replace(/\.md$/, '')}</span>
    </div>
  );
}

export function FileTree({ tree, selectedId, onSelect }: FileTreeProps) {
  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span className="tree-icon">🧠</span>
        <span>Second Brain</span>
      </div>
      <div className="file-tree-content">
        {tree.children?.map((child, i) => (
          <TreeItem 
            key={child.name + i}
            node={child}
            tree={tree}
            selectedId={selectedId}
            onSelect={onSelect}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
