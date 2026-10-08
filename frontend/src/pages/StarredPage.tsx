import React, { useState } from "react";
import { Star, LayoutGrid, List } from "lucide-react";
import { useFiles } from "../hooks/useFiles";
import { useToast } from "../components/ui/Toast";
import { AppLayout } from "../components/layout/AppLayout";
import { FileGrid } from "../components/files/FileGrid";
import { FileList } from "../components/files/FileList";
import { FilePreviewModal } from "../components/files/FilePreviewModal";
import { FileRenameModal } from "../components/files/FileRenameModal";
import { FileMoveModal } from "../components/files/FileMoveModal";
import { FileContextMenu } from "../components/files/FileContextMenu";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { FileItem } from "../types/file";

export const StarredPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    files,
    storageStats,
    isLoading,
    renameFile,
    toggleStar,
    moveFile,
    deleteFile,
    downloadFile,
  } = useFiles({ isStarred: true });

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [fileToMove, setFileToMove] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    file: FileItem;
    position: { x: number; y: number };
  } | null>(null);

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
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    try {
      await deleteFile(file.id);
      success("File deleted");
    } catch (err: any) {
      toastError(err.message || "Failed to delete file");
    }
  };

  const handleToggleStar = async (file: FileItem) => {
    try {
      await toggleStar(file.id, true);
      success("Removed from Starred");
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
    <AppLayout storageStats={storageStats}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Starred Files</h1>
              <p className="text-xs text-slate-400">Quick access to important files</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-slate-800 text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-slate-800 text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : files.length > 0 ? (
          viewMode === "grid" ? (
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
            <FileList
              files={files}
              onPreview={(f) => setPreviewFile(f)}
              onDownload={downloadFile}
              onRename={(f) => setFileToRename(f)}
              onMove={(f) => setFileToMove(f)}
              onToggleStar={handleToggleStar}
              onDelete={handleDeleteFile}
              onContextMenu={handleContextMenu}
            />
          )
        ) : (
          <EmptyState
            icon={Star}
            title="No starred files"
            description="Star files by clicking the star icon on any file card to easily find them here."
          />
        )}
      </div>

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
