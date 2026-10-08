import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StorageStats } from "../../types/file";

interface AppLayoutProps {
  children: React.ReactNode;
  storageStats?: StorageStats | null;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onUploadClick?: () => void;
  onNewFolderClick?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  storageStats,
  searchTerm = "",
  onSearchChange = () => {},
  onUploadClick,
  onNewFolderClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar storageStats={storageStats} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 animate-scale-in">
            <Sidebar
              storageStats={storageStats}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onUploadClick={onUploadClick}
          onNewFolderClick={onNewFolderClick}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
