import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Folder as FolderIcon,
  HardDrive,
  UploadCloud,
  FolderPlus,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useFiles } from "../hooks/useFiles";
import { useFolders } from "../hooks/useFolders";
import { useToast } from "../components/ui/Toast";
import { AppLayout } from "../components/layout/AppLayout";
import { FolderGrid } from "../components/folders/FolderGrid";
import { FileGrid } from "../components/files/FileGrid";
import { CreateFolderModal } from "../components/folders/CreateFolderModal";
import { RenameFolderModal } from "../components/folders/RenameFolderModal";
import { UploadModal } from "../components/upload/UploadModal";
import { FilePreviewModal } from "../components/files/FilePreviewModal";
import { FileRenameModal } from "../components/files/FileRenameModal";
import { FileMoveModal } from "../components/files/FileMoveModal";
import { FileContextMenu } from "../components/files/FileContextMenu";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { formatFileSize } from "../utils/formatFileSize";
import { FILE_CATEGORY_CONFIG } from "../utils/fileType";
import { FileItem, FileCategory } from "../types/file";
import { Folder } from "../types/folder";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  // Files & Folders Hooks
  const {
    files,
    storageStats,
    isLoading: isFilesLoading,
    uploadFile,
    renameFile,
    toggleStar,
    moveFile,
    deleteFile,
    downloadFile,
    refreshFiles,
  } = useFiles({ limit: 8, sort: "createdAt", order: "desc" });

  const {
    folders,
    isLoading: isFoldersLoading,
    createFolder,
    updateFolder,
    deleteFolder,
  } = useFolders(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);

  // File Modals State
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [fileToMove, setFileToMove] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    file: FileItem;
    position: { x: number; y: number };
  } | null>(null);

  const totalSize = storageStats?.totalSize || 0;
  const totalFiles = storageStats?.totalFiles || 0;
  const categoryStats = storageStats?.categoryStats || {};

  // Handlers
  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      success(`Folder "${name}" created`);
    } catch (err: any) {
      toastError(err.message || "Failed to create folder");
    }
  };

  const handleRenameFolder = async (id: string, name: string) => {
    try {
      await updateFolder(id, name);
      success("Folder renamed");
    } catch (err: any) {
      toastError(err.message || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folder.name}" and its contents?`)) {
      return;
    }
    try {
      await deleteFolder(folder.id);
      success("Folder deleted");
      refreshFiles();
    } catch (err: any) {
      toastError(err.message || "Failed to delete folder");
    }
  };

  const handleRenameFile = async (id: string, name: string) => {
    try {
      await renameFile(id, name);
      success("File renamed");
    } catch (err: any) {
      toastError(err.message || "Failed to rename file");
    }
  };

  const handleMoveFile = async (id: string, targetFolderId: string | null) => {
    try {
      await moveFile(id, targetFolderId);
      success("File moved");
    } catch (err: any) {
      toastError(err.message || "Failed to move file");
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!window.confirm(`Permanently delete "${file.name}"?`)) return;
    try {
      await deleteFile(file.id);
      success("File deleted from Telegram & Firestore");
    } catch (err: any) {
      toastError(err.message || "Failed to delete file");
    }
  };

  const handleToggleStar = async (file: FileItem) => {
    try {
      const updated = await toggleStar(file.id, !!file.isStarred);
      success(updated.isStarred ? "Added to Starred" : "Removed from Starred");
    } catch (err: any) {
      toastError(err.message || "Failed to update star");
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    setContextMenu({
      file,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  return (
    <AppLayout
      storageStats={storageStats}
      onUploadClick={() => setIsUploadModalOpen(true)}
      onNewFolderClick={() => setIsCreateFolderOpen(true)}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome & Quick Actions Hero */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900/90 border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Cloud Drive</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Welcome back, {user?.name || "Explorer"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              All your documents, videos, and media stored on infinite Telegram channel storage.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FolderPlus className="w-4 h-4 text-amber-400" />}
              onClick={() => setIsCreateFolderOpen(true)}
            >
              New Folder
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UploadCloud className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Files
            </Button>
          </div>
        </div>

        {/* Storage Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Storage Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Storage Used</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-100">{formatFileSize(totalSize)}</p>
              <p className="text-[11px] text-slate-500">Across {totalFiles} total files</p>
            </div>
          </div>

          {/* Media Categories Quick Breakdown */}
          {["image", "video", "pdf"].map((catKey) => {
            const config = FILE_CATEGORY_CONFIG[catKey as FileCategory];
            const stat = categoryStats[catKey] || { count: 0, size: 0 };
            const Icon = config.icon;
            return (
              <div
                key={catKey}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{config.label}s</span>
                  <div
                    className={`w-8 h-8 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-100">{formatFileSize(stat.size)}</p>
                  <p className="text-[11px] text-slate-500">{stat.count} items</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Folders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-slate-200">Folders</h2>
            </div>
            <Link
              to="/files"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isFoldersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : folders.length > 0 ? (
            <FolderGrid
              folders={folders.slice(0, 4)}
              onRename={(f) => setFolderToRename(f)}
              onDelete={handleDeleteFolder}
            />
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                No folders yet. Create folders to keep your cloud tidy.
              </p>
            </div>
          )}
        </div>

        {/* Recent Files Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-200">Recent Files</h2>
            </div>
            <Link
              to="/files"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>Explore all files</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isFilesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : files.length > 0 ? (
            <FileGrid
              files={files}
              onPreview={(f) => setPreviewFile(f)}
              onDownload={downloadFile}
              onRename={(f) => setFileToRename(f)}
              onMove={(f) => setFileToMove(f)}
              onToggleStar={handleToggleStar}
              onDelete={handleDeleteFile}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <EmptyState
              title="Your cloud storage is empty"
              description="Upload files to store them directly into your Telegram private channel."
              actionLabel="Upload First File"
              onAction={() => setIsUploadModalOpen(true)}
              actionIcon={<UploadCloud className="w-4 h-4" />}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <RenameFolderModal
        isOpen={!!folderToRename}
        folder={folderToRename}
        onClose={() => setFolderToRename(null)}
        onRename={handleRenameFolder}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={uploadFile}
        onComplete={() => {
          refreshFiles();
        }}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={downloadFile}
      />

      <FileRenameModal
        file={fileToRename}
        isOpen={!!fileToRename}
        onClose={() => setFileToRename(null)}
        onRename={handleRenameFile}
      />

      <FileMoveModal
        file={fileToMove}
        isOpen={!!fileToMove}
        onClose={() => setFileToMove(null)}
        onMove={handleMoveFile}
      />

      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onPreview={(f) => setPreviewFile(f)}
          onDownload={downloadFile}
          onRename={(f) => setFileToRename(f)}
          onMove={(f) => setFileToMove(f)}
          onToggleStar={handleToggleStar}
          onDelete={handleDeleteFile}
        />
      )}
    </AppLayout>
  );
};
