import React from "react";
import { motion } from "motion/react";
import {
  Send,
  Download,
  Image as ImageIcon,
  Video,
  Smartphone,
  FileText,
  Radio,
  Zap,
  HardDrive,
  ShieldCheck,
  ChevronRight,
  FolderPlus
} from "lucide-react";
import { FileItem } from "../types";

interface HomeScreenProps {
  onSendClick: () => void;
  onReceiveClick: () => void;
  onOpenCategory: (category: FileItem["category"]) => void;
  selectedFilesCount: number;
  selectedFilesTotalSize: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSendClick,
  onReceiveClick,
  onOpenCategory,
  selectedFilesCount,
  selectedFilesTotalSize,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-4 px-2 sm:px-0">
      {/* Jetpack Compose / P2P Channel Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
              <Radio className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                SHAUKAT P2P Share
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                  Wi-Fi Direct
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Ultra-fast offline P2P data transfer without Internet
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Ready</span>
          </div>
        </div>

        {/* Selected Files Bar if any */}
        {selectedFilesCount > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-xs text-indigo-900 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span>
                <strong>{selectedFilesCount}</strong> files selected (
                {selectedFilesTotalSize})
              </span>
            </div>
            <button
              onClick={onSendClick}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Continue Send →
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* TWO BIG PROMINENT HERO BUTTONS: SEND (بھیجیں) and RECEIVE (حاصل کریں) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* SEND BUTTON CARD (Amber to Orange Gradient) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSendClick}
          className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-[2rem] shadow-xl p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group min-h-[210px]"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform"></div>
          <div className="z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
              <Send className="w-8 h-8 text-white transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </div>
            <h2 className="text-4xl font-black text-white">Send</h2>
            <p className="text-white/80 text-2xl font-medium mt-1 font-serif">بھیجیں</p>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider relative z-10">Select files to share</p>
        </motion.div>

        {/* RECEIVE BUTTON CARD (Emerald to Teal Gradient) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReceiveClick}
          className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[2rem] shadow-xl p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group min-h-[210px]"
        >
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-black/5 rounded-full group-hover:scale-125 transition-transform"></div>
          <div className="z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
              <Download className="w-8 h-8 text-white transform group-hover:translate-y-1 transition-transform" />
            </div>
            <h2 className="text-4xl font-black text-white">Receive</h2>
            <p className="text-white/80 text-2xl font-medium mt-1 font-serif">حاصل کریں</p>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider relative z-10">Wait for incoming data</p>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-700">File Categories</h3>
          <span className="text-xs text-slate-400 font-medium">Browse & Pick</span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Photos (Blue) */}
          <div
            onClick={() => onOpenCategory("photo")}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 cursor-pointer transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase text-slate-500">Photos</span>
          </div>

          {/* Files (Purple) */}
          <div
            onClick={() => onOpenCategory("document")}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 cursor-pointer transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase text-slate-500">Files</span>
          </div>

          {/* Apps (Pink) */}
          <div
            onClick={() => onOpenCategory("app")}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 cursor-pointer transition-colors group"
          >
            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase text-slate-500">Apps</span>
          </div>

          {/* Videos (Orange) */}
          <div
            onClick={() => onOpenCategory("video")}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 cursor-pointer transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase text-slate-500">Videos</span>
          </div>
        </div>
      </div>

      {/* Hardware & Transfer Metrics */}
      <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">
              Wi-Fi Direct Socket Buffer
            </span>
            <span>TCP 64KB Chunk Stream • Speed up to 250 MB/s</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Mobile Data</span>
        </div>
      </div>
    </div>
  );
};
