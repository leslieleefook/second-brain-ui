import { useRef, useEffect, useState, useCallback } from 'react';
import type { BrainFile } from '../types';

interface GraphViewProps {
  files: Record<string, BrainFile>;
  linkIndex: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

interface Node {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number;
}

interface Link {
  source: string;
  target: string;
}

export function GraphView({ files, linkIndex, selectedId, onSelect, onClose }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  // Build graph data - initialize node positions on mount/data change
  useEffect(() => {
    const fileList = Object.values(files);
    const nodeMap: Record<string, Node> = {};
    const linkList: Link[] = [];
    
    // Create nodes with seeded random positions based on id
    fileList.forEach((file, index) => {
      // Use deterministic positioning based on index to avoid Math.random in render
      const angle = (index / fileList.length) * 2 * Math.PI;
      const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
      nodeMap[file.id] = {
        id: file.id,
        title: file.title,
        x: dimensions.width / 2 + Math.cos(angle) * radius * (0.5 + (index % 3) * 0.25),
        y: dimensions.height / 2 + Math.sin(angle) * radius * (0.5 + (index % 5) * 0.15),
        vx: 0,
        vy: 0,
        connections: file.wikiLinks.length + file.backlinks.length,
      };
    });
    
    // Create links
    fileList.forEach(file => {
      file.wikiLinks.forEach(link => {
        const targetId = linkIndex[link.toLowerCase()];
        if (targetId && nodeMap[targetId]) {
          linkList.push({ source: file.id, target: targetId });
        }
      });
    });
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: initializing graph data from props
    setNodes(Object.values(nodeMap));
    setLinks(linkList);
  }, [files, linkIndex, dimensions]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Force-directed simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const repulsionStrength = 5000;
      const attractionStrength = 0.01;
      const centerForce = 0.01;
      const damping = 0.9;
      
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => ({ ...node }));
        
        // Apply forces
        newNodes.forEach((node, i) => {
          let fx = 0, fy = 0;
          
          // Repulsion from other nodes
          newNodes.forEach((other, j) => {
            if (i === j) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsionStrength / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          });
          
          // Attraction along links
          links.forEach(link => {
            let other: typeof node | undefined;
            if (link.source === node.id) {
              other = newNodes.find(n => n.id === link.target);
            } else if (link.target === node.id) {
              other = newNodes.find(n => n.id === link.source);
            }
            if (other) {
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              fx += dx * attractionStrength;
              fy += dy * attractionStrength;
            }
          });
          
          // Center gravity
          fx += (centerX - node.x) * centerForce;
          fy += (centerY - node.y) * centerForce;
          
          // Update velocity and position
          if (!dragNode || dragNode.id !== node.id) {
            node.vx = (node.vx + fx) * damping;
            node.vy = (node.vy + fy) * damping;
            node.x += node.vx;
            node.y += node.vy;
            
            // Keep in bounds
            node.x = Math.max(50, Math.min(dimensions.width - 50, node.x));
            node.y = Math.max(50, Math.min(dimensions.height - 50, node.y));
          }
        });
        
        return newNodes;
      });
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    animationRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [links, dimensions, dragNode, nodes.length]);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Draw links
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    ctx.lineWidth = 1;
    links.forEach(link => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const isSelected = node.id === selectedId;
      const isHovered = hoveredNode?.id === node.id;
      const radius = Math.min(20, 6 + node.connections * 2);
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      
      if (isSelected) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
      } else if (isHovered) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-hover');
      } else {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--tag-text');
      }
      ctx.fill();
      
      // Draw label for selected/hovered nodes
      if (isSelected || isHovered) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.title, node.x, node.y - radius - 8);
      }
    });
  }, [nodes, links, selectedId, hoveredNode, dimensions]);

  // Mouse handlers
  const getNodeAtPosition = useCallback((x: number, y: number): Node | null => {
    for (const node of nodes) {
      const radius = Math.min(20, 6 + node.connections * 2);
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy <= radius * radius) {
        return node;
      }
    }
    return null;
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging && dragNode) {
      setNodes(prev => prev.map(n => 
        n.id === dragNode.id ? { ...n, x, y, vx: 0, vy: 0 } : n
      ));
    } else {
      setHoveredNode(getNodeAtPosition(x, y));
    }
  }, [isDragging, dragNode, getNodeAtPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);
    
    if (node) {
      setIsDragging(true);
      setDragNode(node);
    }
  }, [getNodeAtPosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragNode && !isDragging) {
      onSelect(dragNode.id);
    }
    setIsDragging(false);
    setDragNode(null);
  }, [isDragging, dragNode, onSelect]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);
    
    if (node) {
      onSelect(node.id);
    }
  }, [getNodeAtPosition, onSelect]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="graph-view-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="graph-view-container" ref={containerRef}>
        <div className="graph-view-header">
          <h2>🕸️ Knowledge Graph</h2>
          <div className="graph-stats">
            <span>{nodes.length} notes</span>
            <span>•</span>
            <span>{links.length} connections</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height - 60}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          style={{ cursor: hoveredNode ? 'pointer' : 'default' }}
        />
        <div className="graph-legend">
          <span>💡 Click a node to view • Drag to rearrange • Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
