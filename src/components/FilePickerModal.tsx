import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Image as ImageIcon,
  Video,
  Smartphone,
  FileText,
  Upload,
  CheckCircle2,
  Circle,
  Search,
  ArrowLeft,
  Zap,
  Check,
  Package,
  FileArchive
} from "lucide-react";
import { FileItem } from "../types";
import { SAMPLE_FILES } from "../data/sampleFiles";

interface FilePickerModalProps {
  initialCategory?: FileItem["category"];
  selectedFiles: FileItem[];
  onToggleSelect: (file: FileItem) => void;
  onCustomFileUpload: (files: FileList) => void;
  onProceedToDiscovery: () => void;
  onBack: () => void;
}

export const FilePickerModal: React.FC<FilePickerModalProps> = ({
  initialCategory = "photo",
  selectedFiles,
  onToggleSelect,
  onCustomFileUpload,
  onProceedToDiscovery,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<FileItem["category"]>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [allFiles, setAllFiles] = useState<FileItem[]>(SAMPLE_FILES);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onCustomFileUpload(e.target.files);
      // Convert real browser files to FileItem representation
      const fileListArray: File[] = Array.from(e.target.files);
      const newItems: FileItem[] = fileListArray.map((f: File, i: number) => {
        let cat: FileItem["category"] = "document";
        if (f.type.startsWith("image/")) cat = "photo";
        else if (f.type.startsWith("video/")) cat = "video";
        else if (f.name.endsWith(".apk")) cat = "app";

        const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
        return {
          id: `custom_${Date.now()}_${i}`,
          name: f.name,
          category: cat,
          size: f.size,
          sizeFormatted: `${sizeMB} MB`,
          mimeType: f.type || "application/octet-stream",
          blob: f,
          thumbnailUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        };
      });

      setAllFiles((prev) => [...newItems, ...prev]);
      // Auto-select newly uploaded files
      newItems.forEach((item) => onToggleSelect(item));
    }
  };

  const isSelected = (fileId: string) =>
    selectedFiles.some((f) => f.id === fileId);

  const filteredFiles = allFiles.filter(
    (file) =>
      file.category === activeTab &&
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
  const totalSelectedFormatted = (totalSelectedSize / (1024 * 1024)).toFixed(1) + " MB";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Select Files
              <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {selectedFiles.length} selected
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Pick Photos, Videos, APK Apps, or Documents to transfer
            </p>
          </div>
        </div>

        {/* Custom File Upload Button */}
        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-md">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Add Local File</span>
          <input
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-4 bg-slate-50 p-2 border-b border-slate-100 gap-1.5">
        <button
          onClick={() => setActiveTab("photo")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "photo"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photos</span>
        </button>

        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "video"
              ? "bg-orange-500 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos</span>
        </button>

        <button
          onClick={() => setActiveTab("app")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "app"
              ? "bg-pink-500 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Apps</span>
        </button>

        <button
          onClick={() => setActiveTab("document")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "document"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Files</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* File Items Grid / List */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No files found in this category. Click "Add Local File" to pick from disk.
          </div>
        ) : activeTab === "photo" ? (
          /* Photos Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredFiles.map((file) => {
              const selected = isSelected(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => onToggleSelect(file)}
                  className={`relative group rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                    selected
                      ? "border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="h-28 w-full bg-slate-100 relative">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {selected ? (
                        <CheckCircle2 className="w-6 h-6 text-indigo-600 fill-white" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{file.sizeFormatted}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View for Videos, Apps, Docs */
          <div className="flex flex-col gap-2.5">
            {filteredFiles.map((file) => {
              const selected = isSelected(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => onToggleSelect(file)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white text-indigo-600 border border-slate-100 shadow-sm">
                      {file.category === "app" ? (
                        <Smartphone className="w-5 h-5 text-pink-600" />
                      ) : file.category === "video" ? (
                        <Video className="w-5 h-5 text-orange-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 max-w-xs truncate">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-medium">
                        <span>{file.sizeFormatted}</span>
                        {file.appVersion && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 font-semibold">
                            {file.appVersion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {selected ? (
                      <CheckCircle2 className="w-6 h-6 text-indigo-600 fill-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-slate-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-medium">
          Selected:{" "}
          <strong className="text-indigo-600 font-bold">
            {selectedFiles.length} files
          </strong>{" "}
          ({totalSelectedFormatted})
        </div>

        <button
          disabled={selectedFiles.length === 0}
          onClick={onProceedToDiscovery}
          className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            selectedFiles.length > 0
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:scale-105"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Proceed to Send ({selectedFiles.length})</span>
        </button>
      </div>
    </div>
  );
};
