import { useState, useCallback, useEffect } from "react";
import { FileItem, FileFilterOptions, StorageStats } from "../types/file";
import { filesApi } from "../api/files.api";

export const useFiles = (initialOptions: FileFilterOptions = {}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<FileFilterOptions>(initialOptions);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await filesApi.getFiles(options);
      setFiles(data.files);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const fetchStorageStats = useCallback(async () => {
    try {
      const stats = await filesApi.getStorageStats();
      setStorageStats(stats);
    } catch (err) {
      console.error("Failed to load storage stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchStorageStats();
  }, [fetchStorageStats]);

  const uploadFile = async (
    file: File,
    folderId?: string | null,
    onProgress?: (progress: number) => void
  ) => {
    const newFile = await filesApi.uploadFile(file, folderId, onProgress);
    // If the uploaded file matches the current folder, add it to the state
    const currentFolder = options.folderId || null;
    const targetFolder = folderId || null;
    if (currentFolder === targetFolder) {
      setFiles((prev) => [newFile, ...prev]);
    }
    fetchStorageStats();
    return newFile;
  };

  const renameFile = async (id: string, name: string) => {
    const updated = await filesApi.updateFile(id, { name });
    setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const toggleStar = async (id: string, currentStarred: boolean) => {
    const updated = await filesApi.updateFile(id, { isStarred: !currentStarred });
    setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const toggleTrash = async (id: string, currentTrashed: boolean) => {
    const updated = await filesApi.updateFile(id, { isTrashed: !currentTrashed });
    // If we are currently in normal view, remove it from view
    if (!options.isTrashed) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
    return updated;
  };

  const moveFile = async (id: string, targetFolderId: string | null) => {
    const moved = await filesApi.moveFile(id, targetFolderId);
    // Remove from current folder list if target folder is different
    if (options.folderId !== targetFolderId) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      setFiles((prev) => prev.map((f) => (f.id === id ? moved : f)));
    }
    return moved;
  };

  const deleteFile = async (id: string) => {
    await filesApi.deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    fetchStorageStats();
  };

  const downloadFile = async (file: FileItem) => {
    const { data, filename } = await filesApi.downloadFileBlob(file.id);
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || file.name;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return {
    files,
    storageStats,
    isLoading,
    error,
    options,
    setOptions,
    refreshFiles: fetchFiles,
    refreshStorageStats: fetchStorageStats,
    uploadFile,
    renameFile,
    toggleStar,
    toggleTrash,
    moveFile,
    deleteFile,
    downloadFile,
  };
};
