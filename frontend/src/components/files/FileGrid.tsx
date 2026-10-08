import React from "react";
import { FileItem } from "../../types/file";
import { FileCard } from "./FileCard";

interface FileGridProps {
  files: FileItem[];
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onToggleStar: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
      {files.map((file) => (
        <FileCard
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
  );
};
