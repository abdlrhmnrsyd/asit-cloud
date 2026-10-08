import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Star,
  Download,
  Eye,
  Edit2,
  FolderInput,
  Trash2,
} from "lucide-react";
import { FileItem } from "../../types/file";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatDate } from "../../utils/formatDate";
import { getFileCategoryConfig } from "../../utils/fileType";

interface FileCardProps {
  file: FileItem;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onToggleStar: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onDownload,
  onRename,
  onMove,
  onToggleStar,
  onDelete,
  onContextMenu,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeConfig = getFileCategoryConfig(file.category);
  const Icon = typeConfig.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, file);
      }}
      className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between select-none cursor-pointer"
      onClick={() => onPreview(file)}
    >
      {/* Top Bar: Icon & Star/Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className={`w-11 h-11 rounded-xl ${typeConfig.bgColor} border ${typeConfig.borderColor} flex items-center justify-center ${typeConfig.color} group-hover:scale-105 transition-transform shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleStar(file)}
            className={`p-1.5 rounded-lg transition-colors ${
              file.isStarred
                ? "text-amber-400 fill-amber-400 opacity-100"
                : "text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100"
            }`}
          >
            <Star className={`w-4 h-4 ${file.isStarred ? "fill-amber-400" : ""}`} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-20 animate-scale-in text-xs">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onPreview(file);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDownload(file);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRename(file);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMove(file);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                  <span>Move</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(file);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Details */}
      <div className="min-w-0">
        <p
          className="text-sm font-semibold text-slate-200 group-hover:text-white truncate"
          title={file.name}
        >
          {file.name}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
