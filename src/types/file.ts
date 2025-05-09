export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  upload_date: string;
}

export type SortOption = 'name' | 'date' | 'type' | 'size';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortOption;
  direction: SortDirection;
}