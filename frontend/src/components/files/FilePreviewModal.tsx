import React, { useState, useEffect } from "react";
import {
  Download,
  FileQuestion,
  Loader2,
  Calendar,
  HardDrive,
  FileCode,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FileItem } from "../../types/file";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatFullDate } from "../../utils/formatDate";
import { filesApi } from "../../api/files.api";

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    const loadPreview = async () => {
      if (!file || !isOpen) return;

      setIsLoading(true);
      setError(null);
      setBlobUrl(null);
      setTextContent(null);

      try {
        const { data } = await filesApi.downloadFileBlob(file.id, true);

        if (file.category === "code" || file.category === "generic" && file.mimeType.startsWith("text/")) {
          const text = await data.text();
          setTextContent(text);
        } else {
          activeUrl = window.URL.createObjectURL(data);
          setBlobUrl(activeUrl);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load preview");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
    };
  }, [file, isOpen]);

  if (!file) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={file.name}
      description={`Size: ${formatFileSize(file.size)} • Type: ${file.mimeType}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Preview Container */}
        <div className="min-h-[320px] max-h-[500px] w-full bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden relative p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-medium">Fetching file from Telegram storage...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 text-rose-400 space-y-2">
              <p className="text-sm font-semibold">{error}</p>
              <p className="text-xs text-slate-500">You can still download the file directly.</p>
            </div>
          ) : file.category === "image" && blobUrl ? (
            <img
              src={blobUrl}
              alt={file.name}
              className="max-h-[460px] max-w-full object-contain rounded-lg"
            />
          ) : file.category === "video" && blobUrl ? (
            <video
              src={blobUrl}
              controls
              autoPlay={false}
              className="max-h-[460px] max-w-full rounded-lg"
            />
          ) : file.category === "audio" && blobUrl ? (
            <div className="w-full max-w-md p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-4">
              <p className="text-sm font-medium text-slate-200">{file.name}</p>
              <audio src={blobUrl} controls className="w-full" />
            </div>
          ) : file.category === "pdf" && blobUrl ? (
            <iframe
              src={blobUrl}
              title={file.name}
              className="w-full h-[460px] rounded-lg border-none"
            />
          ) : textContent !== null ? (
            <div className="w-full h-[460px] overflow-auto bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre">
              {textContent}
            </div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <FileQuestion className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Preview not supported for this file type
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please download the file to view its full content on your machine.
              </p>
            </div>
          )}
        </div>

        {/* File Metadata Overview & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Uploaded {formatFullDate(file.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onDownload(file)}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
