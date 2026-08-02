import React from "react";
import { Download, FileText, Smartphone, Video, Image as ImageIcon, ArrowLeft, FolderDown } from "lucide-react";
import { FileItem } from "../types";

interface ReceivedFilesModalProps {
  receivedFiles: FileItem[];
  onBack: () => void;
}

export const ReceivedFilesModal: React.FC<ReceivedFilesModalProps> = ({
  receivedFiles,
  onBack,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl">
      {/* Header */}
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
              Received Files
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                {receivedFiles.length} items
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Files saved in /storage/emulated/0/Download/Shaukat/
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="p-6 max-h-96 overflow-y-auto flex flex-col gap-3">
        {receivedFiles.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2 font-medium">
            <FolderDown className="w-10 h-10 text-slate-300" />
            <span>No received files yet. Connect a nearby device to start receiving files!</span>
          </div>
        ) : (
          receivedFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-white text-indigo-600 border border-slate-100 shadow-sm">
                  {file.category === "photo" ? (
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  ) : file.category === "video" ? (
                    <Video className="w-5 h-5 text-orange-600" />
                  ) : file.category === "app" ? (
                    <Smartphone className="w-5 h-5 text-pink-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-600" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 max-w-xs truncate">
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {file.sizeFormatted} • Received via Wi-Fi Direct
                  </p>
                </div>
              </div>

              {file.blob ? (
                <a
                  href={URL.createObjectURL(file.blob)}
                  download={file.name}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              ) : (
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  Saved
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
