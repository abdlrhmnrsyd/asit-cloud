import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, X, File as FileIcon } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { formatFileSize } from "../../utils/formatFileSize";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
  folderName?: string;
  onUpload: (file: File, folderId?: string | null, onProgress?: (p: number) => void) => Promise<any>;
  onComplete?: () => void;
}

interface QueuedFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId,
  folderName,
  onUpload,
  onComplete,
}) => {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: QueuedFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      status: "pending",
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStartUpload = async () => {
    if (queue.length === 0 || isUploading) return;

    setIsUploading(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === "completed") continue;

      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q))
      );

      try {
        await onUpload(item.file, folderId, (progress) => {
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, progress } : q))
          );
        });

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "completed", progress: 100 } : q
          )
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: err.message || "Failed" }
              : q
          )
        );
      }
    }

    setIsUploading(false);
    if (onComplete) onComplete();
  };

  const allCompleted = queue.length > 0 && queue.every((q) => q.status === "completed");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isUploading) {
          setQueue([]);
          onClose();
        }
      }}
      title="Upload Files"
      description={`Upload files to ${folderName ? `"${folderName}"` : "My Drive"}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Dropzone trigger */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isUploading
              ? "border-slate-800 bg-slate-900/20 cursor-not-allowed"
              : "border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-900/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
          <p className="text-xs font-semibold text-slate-200">
            Click or drag & drop files to select
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Supports documents, media, archives, and code files
          </p>
        </div>

        {/* Selected files queue */}
        {queue.length > 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "uploading" && (
                    <span className="text-indigo-400 font-semibold text-[11px]">
                      {item.progress}%
                    </span>
                  )}
                  {item.status === "completed" && (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="flex items-center gap-1 text-rose-400 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" /> {item.error}
                    </span>
                  )}
                  {item.status === "pending" && !isUploading && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {queue.length} file{queue.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
            >
              {allCompleted ? "Close" : "Cancel"}
            </Button>
            {!allCompleted && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartUpload}
                disabled={queue.length === 0 || isUploading}
                isLoading={isUploading}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload {queue.length > 0 ? `(${queue.length})` : ""}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
