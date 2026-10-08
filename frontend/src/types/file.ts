export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "archive"
  | "code"
  | "generic";

export interface FileItem {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  folderId: string | null;
  telegramMessageId?: number;
  telegramFileId?: string;
  telegramFileUniqueId?: string;
  isStarred?: boolean;
  isTrashed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorageCategoryStats {
  count: number;
  size: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  categoryStats: Record<string, StorageCategoryStats>;
}

export interface FileFilterOptions {
  folderId?: string | null;
  search?: string;
  category?: string;
  isStarred?: boolean;
  isTrashed?: boolean;
  sort?: "name" | "size" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
