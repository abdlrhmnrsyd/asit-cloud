import React, { useState, useEffect } from "react";
import { Folder as FolderIcon, HardDrive, FolderInput } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FileItem } from "../../types/file";
import { Folder } from "../../types/folder";
import { foldersApi } from "../../api/folders.api";

interface FileMoveModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMove: (fileId: string, targetFolderId: string | null) => Promise<void>;
}

export const FileMoveModal: React.FC<FileMoveModalProps> = ({
  file,
  isOpen,
  onClose,
  onMove,
}) => {
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(file?.folderId || null);
      fetchFolders();
    }
  }, [isOpen, file]);

  const fetchFolders = async () => {
    setIsFetching(true);
    try {
      // Fetch all folders
      const folders = await foldersApi.getFolders(null);
      setAllFolders(folders);
    } catch (err: any) {
      setError("Failed to load folders");
    } finally {
      setIsFetching(false);
    }
  };

  const handleMove = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      await onMove(file.id, selectedFolderId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to move file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title="Move File"
      description={`Move "${file?.name}" to another folder`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && <p className="text-xs text-rose-400">{error}</p>}

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {/* Root Option */}
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              selectedFolderId === null
                ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300"
                : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <HardDrive className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">My Drive (Root)</p>
              <p className="text-[10px] text-slate-500">Root directory</p>
            </div>
          </button>

          {/* User Folders */}
          {allFolders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                selectedFolderId === folder.id
                  ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300"
                  : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              <FolderIcon className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{folder.name}</p>
                <p className="text-[10px] text-slate-500">Folder</p>
              </div>
            </button>
          ))}

          {allFolders.length === 0 && !isFetching && (
            <p className="text-xs text-center text-slate-500 py-4">
              No additional folders found.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleMove}
            isLoading={isLoading}
            leftIcon={<FolderInput className="w-4 h-4" />}
          >
            Move Here
          </Button>
        </div>
      </div>
    </Modal>
  );
};
