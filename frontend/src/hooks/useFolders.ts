import { useState, useCallback, useEffect } from "react";
import { Folder, BreadcrumbItem } from "../types/folder";
import { foldersApi } from "../api/folders.api";

export const useFolders = (currentFolderId?: string | null) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const folderList = await foldersApi.getFolders(currentFolderId);
      setFolders(folderList);

      if (currentFolderId && currentFolderId !== "root") {
        const detail = await foldersApi.getFolderById(currentFolderId);
        setCurrentFolder(detail.folder);
        setBreadcrumbs(detail.breadcrumbs);
      } else {
        setCurrentFolder(null);
        setBreadcrumbs([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (name: string) => {
    const newFolder = await foldersApi.createFolder(name, currentFolderId);
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = async (id: string, name: string) => {
    const updated = await foldersApi.updateFolder(id, name);
    setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
    if (currentFolder?.id === id) {
      setCurrentFolder(updated);
    }
    return updated;
  };

  const deleteFolder = async (id: string) => {
    await foldersApi.deleteFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  return {
    folders,
    currentFolder,
    breadcrumbs,
    isLoading,
    error,
    refreshFolders: fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
};
