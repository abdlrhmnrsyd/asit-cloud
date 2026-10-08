import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderTree,
  Star,
  Trash2,
  Cloud,
  HardDrive,
  X,
  ShieldCheck,
} from "lucide-react";
import { formatFileSize } from "../../utils/formatFileSize";
import { StorageStats } from "../../types/file";

interface SidebarProps {
  storageStats?: StorageStats | null;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ storageStats, onCloseMobile }) => {
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/files", icon: FolderTree, label: "My Files" },
    { to: "/starred", icon: Star, label: "Starred" },
    { to: "/trash", icon: Trash2, label: "Trash" },
  ];

  const totalSize = storageStats?.totalSize || 0;
  const totalFiles = storageStats?.totalFiles || 0;
  // Let's set a visual storage indicator (e.g. out of 50GB Telegram cloud quota representation)
  const maxStorage = 50 * 1024 * 1024 * 1024; // 50 GB
  const percentage = Math.min(100, Math.max(1, Math.round((totalSize / maxStorage) * 100)));

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Logo */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-600/10">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-base tracking-tight flex items-center gap-1.5">
                Asit Cloud
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Pro
                </span>
              </span>
            </div>
          </NavLink>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Storage Meter & Security Footer */}
      <div className="p-4 space-y-3 border-t border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Storage Used</span>
            </div>
            <span className="text-indigo-400 font-semibold">{formatFileSize(totalSize)}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{totalFiles} files</span>
            <span>Telegram Channel</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Cloud Storage</span>
        </div>
      </div>
    </aside>
  );
};
