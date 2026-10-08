import React from "react";
import { FileItem } from "../../types/file";
import { FileRow } from "./FileRow";

interface FileListProps {
  files: FileItem[];
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onToggleStar: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onPreview,
  onDownload,
  onRename,
  onMove,
  onToggleStar,
  onDelete,
  onContextMenu,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <div className="flex-1 sm:flex-[2]">Name</div>
        <div className="hidden md:block flex-1">Type</div>
        <div className="hidden sm:block flex-1">Size</div>
        <div className="hidden lg:block flex-1">Modified</div>
        <div className="w-16 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-800/40">
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            onPreview={onPreview}
            onDownload={onDownload}
            onRename={onRename}
            onMove={onMove}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  );
};
