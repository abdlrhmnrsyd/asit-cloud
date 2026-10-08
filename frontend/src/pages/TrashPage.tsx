import React, { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { useFiles } from "../hooks/useFiles";
import { useToast } from "../components/ui/Toast";
import { AppLayout } from "../components/layout/AppLayout";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { formatFileSize } from "../utils/formatFileSize";
import { formatDate } from "../utils/formatDate";
import { getFileCategoryConfig } from "../utils/fileType";
import { FileItem } from "../types/file";

export const TrashPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const {
    files,
    storageStats,
    isLoading,
    toggleTrash,
    deleteFile,
  } = useFiles({ isTrashed: true });

  const handleRestore = async (file: FileItem) => {
    try {
      await toggleTrash(file.id, true);
      success(`Restored "${file.name}"`);
    } catch (err: any) {
      toastError(err.message || "Failed to restore file");
    }
  };

  const handlePermanentDelete = async (file: FileItem) => {
    if (!window.confirm(`Permanently delete "${file.name}" from Telegram and Firestore? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteFile(file.id);
      success(`Permanently deleted "${file.name}"`);
    } catch (err: any) {
      toastError(err.message || "Failed to delete file");
    }
  };

  return (
    <AppLayout storageStats={storageStats}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Trash</h1>
              <p className="text-xs text-slate-400">Items in trash can be restored or permanently removed</p>
            </div>
          </div>
        </div>

        {/* Warning banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Permanently deleting files here will remove the actual message from your Telegram storage channel.</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : files.length > 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800 overflow-hidden">
            {files.map((file) => {
              const typeConfig = getFileCategoryConfig(file.category);
              const Icon = typeConfig.icon;
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl ${typeConfig.bgColor} border ${typeConfig.borderColor} flex items-center justify-center ${typeConfig.color} shrink-0`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatFileSize(file.size)} • Trashed {formatDate(file.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-indigo-400" />}
                      onClick={() => handleRestore(file)}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handlePermanentDelete(file)}
                    >
                      Delete Forever
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Trash2}
            title="Trash is empty"
            description="No files in trash. When you delete files, they can be inspected and restored here."
          />
        )}
      </div>
    </AppLayout>
  );
};
