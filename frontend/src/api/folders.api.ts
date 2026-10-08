import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { Folder, BreadcrumbItem } from "../types/folder";

export const foldersApi = {
  getFolders: async (parentId?: string | null): Promise<Folder[]> => {
    const params = parentId ? { parentId } : {};
    const res = await apiClient.get<ApiResponse<{ folders: Folder[] }>>("/folders", { params });
    return res.data.data.folders;
  },

  getFolderById: async (id: string): Promise<{ folder: Folder; breadcrumbs: BreadcrumbItem[] }> => {
    const res = await apiClient.get<ApiResponse<{ folder: Folder; breadcrumbs: BreadcrumbItem[] }>>(`/folders/${id}`);
    return res.data.data;
  },

  createFolder: async (name: string, parentId?: string | null): Promise<Folder> => {
    const res = await apiClient.post<ApiResponse<Folder>>("/folders", {
      name,
      parentId: parentId || null,
    });
    return res.data.data;
  },

  updateFolder: async (id: string, name: string): Promise<Folder> => {
    const res = await apiClient.patch<ApiResponse<Folder>>(`/folders/${id}`, { name });
    return res.data.data;
  },

  deleteFolder: async (id: string): Promise<{ deletedFoldersCount: number }> => {
    const res = await apiClient.delete<ApiResponse<{ deletedFoldersCount: number }>>(`/folders/${id}`);
    return res.data.data;
  },
};
