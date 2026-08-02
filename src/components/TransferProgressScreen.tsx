import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Sparkles,
  Smartphone,
  HardDrive
} from "lucide-react";
import { FileItem, PeerDevice, TransferTask } from "../types";

interface TransferProgressScreenProps {
  files: FileItem[];
  targetDevice: PeerDevice;
  onFinished: (completedFiles: FileItem[]) => void;
  onCancel: () => void;
}

export const TransferProgressScreen: React.FC<TransferProgressScreenProps> = ({
  files,
  targetDevice,
  onFinished,
  onCancel,
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 - 100%
  const [currentSpeedMBs, setCurrentSpeedMBs] = useState(48.5);
  const [transferredMB, setTransferredMB] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeFile = files[currentFileIndex] || files[0];
  const totalMB = activeFile ? activeFile.size / (1024 * 1024) : 10;

  useEffect(() => {
    if (isPaused || isCompleted || !activeFile) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Vary transfer speed dynamically (35 - 95 MB/s)
        const randomSpeed = (Math.random() * 55 + 40).toFixed(1);
        setCurrentSpeedMBs(parseFloat(randomSpeed));

        const nextProgress = prev + 8;
        const currentMB = ((nextProgress / 100) * totalMB).toFixed(1);
        setTransferredMB(parseFloat(currentMB));

        if (nextProgress >= 100) {
          if (currentFileIndex + 1 < files.length) {
            // Move to next file
            setCurrentFileIndex((idx) => idx + 1);
            return 0;
          } else {
            // All files completed!
            setIsCompleted(true);
            clearInterval(interval);
            return 100;
          }
        }
        return nextProgress;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [currentFileIndex, files, isPaused, isCompleted, totalMB]);

  const remainingSeconds = Math.max(
    0,
    Math.ceil(((100 - progress) / 100 * totalMB) / (currentSpeedMBs || 50))
  );

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isCompleted ? "Transfer Complete!" : "Transferring Files..."}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Sending to <strong className="text-indigo-600 font-bold">{targetDevice.name}</strong>
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
          File {currentFileIndex + 1} of {files.length}
        </span>
      </div>

      {/* Active File Box */}
      {activeFile && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 max-w-xs truncate">
                {activeFile.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {transferredMB} MB of {totalMB.toFixed(1)} MB
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600 font-sans">
              {progress}%
            </span>
          </div>
        </div>
      )}

      {/* Speed & ETA Meters */}
      {!isCompleted ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Transfer Speed
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-indigo-600 font-sans">
                {currentSpeedMBs}
              </span>
              <span className="text-xs font-bold text-indigo-600">MB/s</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1">
              64KB TCP Socket Stream
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Remaining
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-800 font-sans">
                00:0{remainingSeconds}
              </span>
              <span className="text-xs font-bold text-slate-500">sec</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">ETA Remaining</span>
          </div>
        </div>
      ) : (
        /* Completion State */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center flex flex-col items-center gap-3 mb-6"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800">
            All Files Sent Successfully!
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Received by {targetDevice.name} over Wi-Fi Direct. Average speed: 56.4 MB/s
          </p>
        </motion.div>
      )}

      {/* Progress Bar Container */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Controls Footer */}
      <div className="flex items-center justify-between gap-4">
        {!isCompleted ? (
          <>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <button
              onClick={onCancel}
              className="p-3 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
              title="Cancel Transfer"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onFinished(files)}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg hover:bg-indigo-700 hover:scale-[1.01] transition-all cursor-pointer"
          >
            Done & Return to Home
          </button>
        )}
      </div>
    </div>
  );
};
