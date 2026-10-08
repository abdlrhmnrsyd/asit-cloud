import { apiClient } from "./client";
import { ApiResponse, Pagination } from "../types/api";
import { FileItem, FileFilterOptions, StorageStats } from "../types/file";

export const filesApi = {
  getFiles: async (
    options: FileFilterOptions = {}
  ): Promise<{ files: FileItem[]; pagination: Pagination }> => {
    const res = await apiClient.get<
      ApiResponse<{ files: FileItem[]; pagination: Pagination }>
    >("/files", { params: options });
    return res.data.data;
  },

  getFileById: async (id: string): Promise<FileItem> => {
    const res = await apiClient.get<ApiResponse<{ file: FileItem }>>(`/files/${id}`);
    return res.data.data.file;
  },

  uploadFile: async (
    file: File,
    folderId?: string | null,
    onProgress?: (percentage: number) => void
  ): Promise<FileItem> => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId && folderId !== "root") {
      formData.append("folderId", folderId);
    }

    const res = await apiClient.post<ApiResponse<{ file: FileItem }>>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return res.data.data.file;
  },

  downloadFileBlob: async (id: string, isInline = false): Promise<{ data: Blob; filename: string }> => {
    const res = await apiClient.get(`/files/${id}/download`, {
      params: isInline ? { preview: "true" } : {},
      responseType: "blob",
    });

    // Extract filename from content-disposition header if available
    let filename = "downloaded_file";
    const disposition = res.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }

    return {
      data: res.data,
      filename,
    };
  },

  getDownloadUrl: (id: string, token: string, preview = false): string => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/files/${id}/download?${preview ? "preview=true&" : ""}token=${encodeURIComponent(token)}`;
  },

  updateFile: async (
    id: string,
    updates: { name?: string; isStarred?: boolean; isTrashed?: boolean }
  ): Promise<FileItem> => {
    const res = await apiClient.patch<ApiResponse<{ file: FileItem }>>(`/files/${id}`, updates);
    return res.data.data.file;
  },

  moveFile: async (id: string, folderId: string | null): Promise<FileItem> => {
    const res = await apiClient.patch<ApiResponse<{ file: FileItem }>>(`/files/${id}/move`, {
      folderId: folderId || null,
    });
    return res.data.data.file;
  },

  deleteFile: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/files/${id}`);
  },

  getStorageStats: async (): Promise<StorageStats> => {
    const res = await apiClient.get<ApiResponse<StorageStats>>("/files/storage");
    return res.data.data;
  },
};
