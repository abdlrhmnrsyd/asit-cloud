import React from "react";
import { Folder } from "../../types/folder";
import { FolderCard } from "./FolderCard";

interface FolderGridProps {
  folders: Folder[];
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({ folders, onRename, onDelete }) => {
  if (folders.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
