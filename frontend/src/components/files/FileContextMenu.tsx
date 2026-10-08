import React, { useEffect, useRef } from "react";
import {
  Eye,
  Download,
  Edit2,
  FolderInput,
  Star,
  Trash2,
} from "lucide-react";
import { FileItem } from "../../types/file";

interface FileContextMenuProps {
  file: FileItem;
  position: { x: number; y: number };
  onClose: () => void;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onToggleStar: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  file,
  position,
  onClose,
  onPreview,
  onDownload,
  onRename,
  onMove,
  onToggleStar,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(position.x, window.innerWidth - 200);
  const adjustedY = Math.min(position.y, window.innerHeight - 260);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 animate-scale-in text-xs"
    >
      <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 truncate">
        {file.name}
      </div>

      <div className="py-1 space-y-0.5">
        <button
          onClick={() => {
            onClose();
            onPreview(file);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Preview</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onDownload(file);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Download</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onToggleStar(file);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Star className={`w-3.5 h-3.5 ${file.isStarred ? "text-amber-400 fill-amber-400" : "text-slate-400"}`} />
          <span>{file.isStarred ? "Remove Star" : "Add to Starred"}</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onRename(file);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Rename</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onMove(file);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FolderInput className="w-3.5 h-3.5 text-amber-400" />
          <span>Move to...</span>
        </button>

        <div className="border-t border-slate-800 my-1" />

        <button
          onClick={() => {
            onClose();
            onDelete(file);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
