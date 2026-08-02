import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Wifi, ShieldCheck, ArrowRight } from "lucide-react";

import appLogo from "../assets/images/shaukat_app_logo_1785651771914.jpg";
import splashBg from "../assets/images/shaukat_splash_bg_1785651790991.jpg";

interface SplashScreenProps {
  onStartApp: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartApp }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-slate-50 text-slate-800 overflow-hidden select-none">
      {/* Background Image Overlay with Light Gradient */}
      <div className="absolute inset-0 z-0 opacity-15">
        <img
          src={splashBg}
          alt="Shaukat Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/90 to-slate-50" />
      </div>

      {/* Top Status Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wide shadow-sm mt-4"
      >
        <Wifi className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
        <span>Wi-Fi Direct P2P Engine Active</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </motion.div>

      {/* Main Center Branding & Logo */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm my-auto py-8">
        {/* Animated Avatar Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative group mb-6"
        >
          {/* Outer Glowing Wave Pulse */}
          <div className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/30 animate-pulse transition duration-1000" />

          {/* Logo Frame */}
          <div className="relative w-36 h-36 rounded-[2rem] p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full rounded-[28px] overflow-hidden bg-white border border-slate-100">
              <img
                src={appLogo}
                alt="Shaukat App Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
              />
            </div>
          </div>

          {/* Badge Icon */}
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2.5 rounded-2xl shadow-lg border-2 border-white text-white">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
        </motion.div>

        {/* Urdu & English Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 font-sans">
              Shaukat
            </h1>
            <span className="text-3xl font-bold text-amber-500 font-serif">
              شوکت
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-500 max-w-xs mt-1">
            Fast Local File Transfer Without Internet
          </p>

          <p className="text-xs text-indigo-600 font-bold mt-1">
            up to 250 MB/s • Local Wi-Fi Direct & Hotspot
          </p>
        </motion.div>

        {/* Loading Animation & Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-8 flex flex-col items-center gap-3"
        >
          <div className="w-64 h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <motion.div
              className="h-full bg-indigo-600 rounded-full shadow-sm"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <div className="flex items-center justify-between w-64 text-xs text-slate-400 font-medium">
            <span>Initializing sockets...</span>
            <span className="text-indigo-600 font-bold">{Math.min(loadingProgress, 100)}%</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Launch Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 w-full max-w-sm mb-4"
      >
        <button
          onClick={onStartApp}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group cursor-pointer"
        >
          <span>Open Shaukat App</span>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Offline P2P Encrypted • Zero Data Usage</span>
        </div>
      </motion.div>
    </div>
  );
};
