export interface BrainFile {
  id: string;
  relativePath: string;
  fileName: string;
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
  wikiLinks: string[];
  tags: string[];
  backlinks: string[];
}

export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  id?: string;
  children?: TreeNode[];
}

export interface BrainData {
  generatedAt: string;
  sourcePath: string;
  fileCount: number;
  files: Record<string, BrainFile>;
  tree: TreeNode;
  linkIndex: Record<string, string>;
}
