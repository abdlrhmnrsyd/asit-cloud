import React, { useState, useRef, useEffect } from "react";
import { Search, Menu, LogOut, User as UserIcon, Plus, Upload, FolderPlus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenMobileMenu: () => void;
  onUploadClick?: () => void;
  onNewFolderClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOpenMobileMenu,
  onUploadClick,
  onNewFolderClick,
}) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files across your cloud..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl outline-none transition-all"
          />
        </div>
      </div>

      {/* Action Buttons & User Menu */}
      <div className="flex items-center gap-2.5">
        {/* Quick New Action (Desktop & Mobile Dropdown) */}
        {(onUploadClick || onNewFolderClick) && (
          <div className="relative" ref={actionMenuRef}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsActionsOpen((prev) => !prev)}
              className="hidden sm:inline-flex"
            >
              New
            </Button>

            {/* Mobile upload button */}
            <button
              onClick={() => setIsActionsOpen((prev) => !prev)}
              className="sm:hidden p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-5 h-5" />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 animate-scale-in">
                {onUploadClick && (
                  <button
                    onClick={() => {
                      setIsActionsOpen(false);
                      onUploadClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload File</span>
                  </button>
                )}
                {onNewFolderClick && (
                  <button
                    onClick={() => {
                      setIsActionsOpen(false);
                      onNewFolderClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 text-amber-400" />
                    <span>New Folder</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-semibold flex items-center justify-center text-xs shadow-md shadow-indigo-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {user?.email || ""}
              </p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Account
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Personal Cloud</span>
              </div>

              <div className="border-t border-slate-800 my-1 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
