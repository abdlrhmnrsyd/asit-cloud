import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Folder } from "../../types/folder";

interface RenameFolderModalProps {
  folder: Folder | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, name: string) => Promise<void>;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  folder,
  isOpen,
  onClose,
  onRename,
}) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setError(null);
    }
  }, [folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a valid folder name");
      return;
    }
    if (!folder) return;

    setIsLoading(true);
    setError(null);
    try {
      await onRename(folder.id, name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to rename folder");
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
      title="Rename Folder"
      description="Enter a new name for this folder"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
          error={error || undefined}
          leftIcon={<Edit2 className="w-4 h-4 text-indigo-400" />}
        />

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
