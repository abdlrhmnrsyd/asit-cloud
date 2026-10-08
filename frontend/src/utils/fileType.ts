import {
  Image,
  Video,
  Music,
  FileText,
  FileSpreadsheet,
  Presentation,
  Archive,
  Code2,
  File,
  LucideIcon,
} from "lucide-react";
import { FileCategory } from "../types/file";

export interface FileTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

export const FILE_CATEGORY_CONFIG: Record<FileCategory, FileTypeConfig> = {
  image: {
    icon: Image,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    label: "Image",
  },
  video: {
    icon: Video,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    label: "Video",
  },
  audio: {
    icon: Music,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    label: "Audio",
  },
  pdf: {
    icon: FileText,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "PDF",
  },
  word: {
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Word",
  },
  excel: {
    icon: FileSpreadsheet,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    label: "Spreadsheet",
  },
  powerpoint: {
    icon: Presentation,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    label: "Presentation",
  },
  archive: {
    icon: Archive,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    label: "Archive",
  },
  code: {
    icon: Code2,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    label: "Code",
  },
  generic: {
    icon: File,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    label: "Document",
  },
};

export const getFileCategoryConfig = (category?: string): FileTypeConfig => {
  if (category && category in FILE_CATEGORY_CONFIG) {
    return FILE_CATEGORY_CONFIG[category as FileCategory];
  }
  return FILE_CATEGORY_CONFIG.generic;
};
