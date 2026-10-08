import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { formatFileSize } from "../../utils/formatFileSize";
import { Button } from "../ui/Button";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  folderName?: string;
  isUploading?: boolean;
  uploadProgress?: { fileName: string; progress: number }[];
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  folderName,
  isUploading = false,
  uploadProgress = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files);
        onFilesSelected(filesArray);
      }
    },
    [onFilesSelected]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 text-center flex flex-col items-center justify-center ${
        isDragOver
          ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
          : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
        <UploadCloud className="w-7 h-7 stroke-[1.5]" />
      </div>

      <h4 className="text-sm font-semibold text-slate-200 mb-1">
        Drag & drop your files here
      </h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4">
        Files will be stored securely on Telegram channel{" "}
        {folderName ? `inside "${folderName}"` : "in Root Drive"}
      </p>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        Browse Files
      </Button>

      {/* Upload Progress List */}
      {uploadProgress.length > 0 && (
        <div className="w-full max-w-md mt-6 space-y-2.5 text-left border-t border-slate-800/80 pt-4">
          <p className="text-xs font-semibold text-slate-300">Active Uploads</p>
          {uploadProgress.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200 truncate max-w-[200px]">
                  {item.fileName}
                </span>
                <span className="text-indigo-400 font-semibold">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
