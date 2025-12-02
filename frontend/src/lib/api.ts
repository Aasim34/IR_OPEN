const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export interface SearchResult {
  filename: string;
  score: number;
  summary: string;
  snippet: string;
  key_points: string[];
  images: Array<string | { data: string; page: number }>;
  file_type: string;
  file_size?: string;
  modified_date?: string;
  method: string;
  tfidf_score?: number;
  bm25_score?: number;
  semantic_score?: number;
}

export interface SearchResponse {
  query: string;
  search_type: string;
  filter_files: string[];
  results: SearchResult[];
  total: number;
}

export interface FileInfo {
  folders: string[];
  files: string[];
}

export async function searchDocuments(
  query: string,
  searchType: 'hybrid' | 'bm25' | 'tfidf' | 'semantic',
  filterFiles: string[] = []
): Promise<SearchResponse> {
  const response = await fetch(`${API_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      search_type: searchType,
      filter_files: filterFiles,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  return response.json();
}

export async function getFiles(): Promise<FileInfo> {
  const response = await fetch(`${API_URL}/get_files`);
  if (!response.ok) throw new Error('Failed to fetch files');
  return response.json();
}

export async function reloadDocuments(): Promise<{ message: string; doc_count: number }> {
  const response = await fetch(`${API_URL}/reload`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to reload documents');
  return response.json();
}
