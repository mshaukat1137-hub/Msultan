import React from "react";
import { Zap, Wifi, Code2, DownloadCloud, Radio, RefreshCw } from "lucide-react";
import appLogo from "../assets/images/shaukat_app_logo_1785651771914.jpg";

interface NavbarProps {
  activeTab: "app" | "code_exporter" | "history";
  setActiveTab: (tab: "app" | "code_exporter" | "history") => void;
  onOpenSplash: () => void;
  receivedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSplash,
  receivedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-indigo-600 text-white shadow-lg px-4 sm:px-8 py-3.5 border-b border-indigo-700/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left App Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSplash}
            className="flex items-center gap-3 group cursor-pointer focus:outline-none"
            title="Click to view App Splash Screen"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 group-hover:scale-105 transition-transform">
              <img
                src={appLogo}
                alt="Shaukat"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  SHAUKAT
                </span>
                <span className="text-indigo-200 text-xs font-semibold uppercase tracking-widest hidden sm:inline">
                  v1.0.4
                </span>
                <span className="text-indigo-200 text-sm font-bold ml-1 font-serif">
                  شوکت
                </span>
              </div>
              <span className="text-[10px] text-indigo-200/90 font-medium">
                Wi-Fi Direct P2P Share
              </span>
            </div>
          </button>

          {/* Wi-Fi Direct Signal Strength Badge */}
          <div className="hidden md:flex items-center space-x-2 ml-4 pl-4 border-l border-white/20">
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider">Signal</span>
              <div className="flex space-x-1 mt-0.5">
                <div className="w-1 h-2 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-4 bg-white rounded-full"></div>
                <div className="w-1 h-5 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Navigation Tabs & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main App Tab */}
          <button
            onClick={() => setActiveTab("app")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "app"
                ? "bg-white text-indigo-600 shadow-md scale-105"
                : "text-indigo-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Transfer App</span>
          </button>

          {/* History / Received Files */}
          <button
            onClick={() => setActiveTab("history")}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-indigo-600 shadow-md scale-105"
                : "text-indigo-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Received Files</span>
            <span className="sm:hidden">Received</span>
            {receivedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-black">
                {receivedCount}
              </span>
            )}
          </button>

          {/* Android Kotlin Source Code Exporter */}
          <button
            onClick={() => setActiveTab("code_exporter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "code_exporter"
                ? "bg-white text-indigo-600 shadow-md scale-105"
                : "text-indigo-100 bg-white/10 hover:bg-white/20 border border-white/20"
            }`}
            title="View & Download Kotlin Android Studio Code"
          >
            <Code2 className="w-4 h-4 text-indigo-200" />
            <span className="hidden md:inline">Kotlin Android Project</span>
            <span className="md:hidden font-sans">Android Code</span>
          </button>

          {/* Profile Badge */}
          <div className="w-9 h-9 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs shadow-md border border-indigo-200 ml-1">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};
