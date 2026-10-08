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

interface FileRowProps {
  file: FileItem;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onToggleStar: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
}

export const FileRow: React.FC<FileRowProps> = ({
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
      onClick={() => onPreview(file)}
      className="group flex items-center justify-between px-4 py-3 bg-slate-900/60 hover:bg-slate-800/80 border-b border-slate-800/70 transition-colors cursor-pointer select-none text-xs"
    >
      {/* Name and Icon */}
      <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-[2]">
        <div
          className={`w-8 h-8 rounded-lg ${typeConfig.bgColor} border ${typeConfig.borderColor} flex items-center justify-center ${typeConfig.color} shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span
          className="font-medium text-slate-200 group-hover:text-white truncate"
          title={file.name}
        >
          {file.name}
        </span>
      </div>

      {/* Category / Type */}
      <div className="hidden md:block flex-1 text-slate-400 capitalize">
        {typeConfig.label}
      </div>

      {/* Size */}
      <div className="hidden sm:block flex-1 text-slate-400">
        {formatFileSize(file.size)}
      </div>

      {/* Modified Date */}
      <div className="hidden lg:block flex-1 text-slate-500">
        {formatDate(file.createdAt)}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleStar(file)}
          className={`p-1.5 rounded-lg transition-colors ${
            file.isStarred
              ? "text-amber-400 fill-amber-400"
              : "text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Star className={`w-4 h-4 ${file.isStarred ? "fill-amber-400" : ""}`} />
        </button>

        <button
          onClick={() => onDownload(file)}
          className="hidden sm:block p-1.5 text-slate-500 hover:text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="w-4 h-4" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-700/60 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-20 animate-scale-in">
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
  );
};
