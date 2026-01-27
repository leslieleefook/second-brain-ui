/**
 * Second Brain API Client
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface FileInfo {
  path: string;
  name: string;
  folder: string;
  frontmatter: Record<string, unknown>;
  modified: string;
  size: number;
}

export interface FileContent {
  path: string;
  content: string;
  frontmatter: Record<string, unknown>;
  rawContent: string;
}

class BrainAPI {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }
  
  async getFiles(): Promise<{ files: FileInfo[]; brainPath: string }> {
    const res = await fetch(`${this.baseUrl}/files`);
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  }
  
  async getFile(path: string): Promise<FileContent> {
    const res = await fetch(`${this.baseUrl}/file/${encodeURIComponent(path)}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error('File not found');
      throw new Error('Failed to fetch file');
    }
    return res.json();
  }
  
  async saveFile(path: string, content: string, frontmatter?: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/file/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, frontmatter })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save file');
    }
  }
  
  async createFile(path: string, content: string, frontmatter?: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, frontmatter })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create file');
    }
  }
  
  async deleteFile(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/file/${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete file');
    }
  }
  
  async getFolders(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/folders`);
    if (!res.ok) throw new Error('Failed to fetch folders');
    const data = await res.json();
    return data.folders;
  }
  
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new BrainAPI();
export default api;
