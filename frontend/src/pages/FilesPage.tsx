import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  LayoutGrid,
  List,
  FolderPlus,
  UploadCloud,
  ArrowUpDown,
  Filter,
  Folder as FolderIcon,
  FileText,
} from "lucide-react";
import { useFiles } from "../hooks/useFiles";
import { useFolders } from "../hooks/useFolders";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../components/ui/Toast";
import { AppLayout } from "../components/layout/AppLayout";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { FolderGrid } from "../components/folders/FolderGrid";
import { FileGrid } from "../components/files/FileGrid";
import { FileList } from "../components/files/FileList";
import { UploadDropzone } from "../components/upload/UploadDropzone";
import { UploadModal } from "../components/upload/UploadModal";
import { CreateFolderModal } from "../components/folders/CreateFolderModal";
import { RenameFolderModal } from "../components/folders/RenameFolderModal";
import { FilePreviewModal } from "../components/files/FilePreviewModal";
import { FileRenameModal } from "../components/files/FileRenameModal";
import { FileMoveModal } from "../components/files/FileMoveModal";
import { FileContextMenu } from "../components/files/FileContextMenu";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { FileItem } from "../types/file";
import { Folder } from "../types/folder";

export const FilesPage: React.FC = () => {
  const { folderId } = useParams<{ folderId?: string }>();
  const activeFolderId = folderId || null;

  const { success, error: toastError } = useToast();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "size">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Files & Folders Hooks
  const {
    files,
    storageStats,
    isLoading: isFilesLoading,
    options,
    setOptions,
    uploadFile,
    renameFile,
    toggleStar,
    moveFile,
    deleteFile,
    downloadFile,
    refreshFiles,
  } = useFiles({
    folderId: activeFolderId,
    search: debouncedSearch,
    category: categoryFilter,
    sort: sortBy,
    order: sortOrder,
  });

  const {
    folders,
    currentFolder,
    breadcrumbs,
    isLoading: isFoldersLoading,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshFolders,
  } = useFolders(activeFolderId);

  // Sync options when folder/search/filter changes
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      folderId: activeFolderId,
      search: debouncedSearch,
      category: categoryFilter,
      sort: sortBy,
      order: sortOrder,
    }));
  }, [activeFolderId, debouncedSearch, categoryFilter, sortBy, sortOrder, setOptions]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [fileToMove, setFileToMove] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    file: FileItem;
    position: { x: number; y: number };
  } | null>(null);

  // Handlers
  const handleDropzoneUpload = async (droppedFiles: File[]) => {
    for (const file of droppedFiles) {
      try {
        await uploadFile(file, activeFolderId);
        success(`Uploaded ${file.name}`);
      } catch (err: any) {
        toastError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
  };

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
    if (!window.confirm(`Are you sure you want to delete "${folder.name}" and all its contents?`)) {
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
      success("File deleted");
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

  const categories = [
    { value: "", label: "All Types" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "pdf", label: "PDFs" },
    { value: "word", label: "Documents" },
    { value: "archive", label: "Archives" },
    { value: "code", label: "Code" },
  ];

  return (
    <AppLayout
      storageStats={storageStats}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onUploadClick={() => setIsUploadModalOpen(true)}
      onNewFolderClick={() => setIsCreateFolderOpen(true)}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs & Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbs} currentTitle={currentFolder?.name} />

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Toggle */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split("-") as [any, any];
                  setSortBy(s);
                  setSortOrder(o);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="size-desc">Largest First</option>
                <option value="size-asc">Smallest First</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-800 text-indigo-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-slate-800 text-indigo-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UploadCloud className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload
            </Button>
          </div>
        </div>

        {/* Dropzone Area for instant drag & drop */}
        <UploadDropzone
          onFilesSelected={handleDropzoneUpload}
          folderName={currentFolder?.name}
        />

        {/* Folders Section (Only shown if root or folders exist) */}
        {!debouncedSearch && folders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FolderIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Folders ({folders.length})</span>
            </div>
            {isFoldersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <FolderGrid
                folders={folders}
                onRename={(f) => setFolderToRename(f)}
                onDelete={handleDeleteFolder}
              />
            )}
          </div>
        )}

        {/* Files Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Files ({files.length})
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </span>
            </div>
          </div>

          {isFilesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              title={debouncedSearch ? "No files match your search" : "No files in this folder"}
              description={
                debouncedSearch
                  ? "Try adjusting your search keywords or filter criteria."
                  : "Upload files or drag and drop them here to get started."
              }
              actionLabel={debouncedSearch ? undefined : "Upload Files"}
              onAction={debouncedSearch ? undefined : () => setIsUploadModalOpen(true)}
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
        folderId={activeFolderId}
        folderName={currentFolder?.name}
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
