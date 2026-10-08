import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "../../types/folder";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentTitle?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, currentTitle }) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs sm:text-sm text-slate-400 overflow-x-auto py-1 whitespace-nowrap">
      <Link
        to="/files"
        className="flex items-center gap-1.5 hover:text-slate-100 transition-colors px-1.5 py-1 rounded-md hover:bg-slate-800/50"
      >
        <Home className="w-4 h-4 text-indigo-400" />
        <span className="font-medium">My Drive</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1 && !currentTitle;
        return (
          <React.Fragment key={item.id}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-200 font-semibold px-1.5 py-1 truncate max-w-[150px]">
                {item.name}
              </span>
            ) : (
              <Link
                to={`/files/${item.id}`}
                className="hover:text-slate-100 transition-colors px-1.5 py-1 rounded-md hover:bg-slate-800/50 truncate max-w-[150px]"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}

      {currentTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-200 font-semibold px-1.5 py-1 truncate max-w-[180px]">
            {currentTitle}
          </span>
        </>
      )}
    </nav>
  );
};
