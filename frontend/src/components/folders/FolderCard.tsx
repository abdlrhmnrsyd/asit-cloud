import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Folder as FolderIcon, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Folder } from "../../types/folder";
import { formatDate } from "../../utils/formatDate";

interface FolderCardProps {
  folder: Folder;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onRename, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="relative group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between gap-3 select-none">
      <Link
        to={`/files/${folder.id}`}
        className="flex items-center gap-3.5 flex-1 min-w-0"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all shrink-0">
          <FolderIcon className="w-5 h-5 fill-amber-500/20" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
            {folder.name}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatDate(folder.createdAt)}
          </p>
        </div>
      </Link>

      {/* Options Menu Button */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-20 animate-scale-in">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onRename(folder);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rename</span>
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(folder);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
