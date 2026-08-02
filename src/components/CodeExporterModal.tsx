import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Folder,
  Layers,
  Sparkles,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import JSZip from "jszip";
import { ANDROID_SOURCE_FILES } from "../data/androidSourceCode";
import { AndroidSourceFile } from "../types";

export const CodeExporterModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(
    ANDROID_SOURCE_FILES[0]
  );
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all Kotlin and configuration files to zip structure
      ANDROID_SOURCE_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add project root build configuration
      zip.file(
        "build.gradle.kts",
        `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
      );
      zip.file(
        "settings.gradle.kts",
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Shaukat"
include(":app")`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Shaukat_Android_Kotlin_Project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate zip", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl">
      {/* Top Banner */}
      <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Kotlin Android Studio Source Exporter
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                Jetpack Compose
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Complete production code for Wi-Fi Direct, Sockets, and UI
            </p>
          </div>
        </div>

        {/* Zip Download Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          {zipSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Downloaded Shaukat_Android.zip!</span>
            </>
          ) : (
            <>
              <Download className={`w-4 h-4 ${isZipping ? "animate-bounce" : ""}`} />
              <span>Download Complete Android Project (.zip)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Split: Left Sidebar Files, Right Code Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[480px]">
        {/* Left Sidebar: File List */}
        <div className="p-4 bg-slate-50 border-r border-slate-100 flex flex-col gap-1.5 md:col-span-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 px-2 py-1 tracking-wider">
            Project Files
          </span>

          {ANDROID_SOURCE_FILES.map((file) => {
            const isSelected = selectedFile.fileName === file.fileName;
            return (
              <button
                key={file.fileName}
                onClick={() => setSelectedFile(file)}
                className={`p-2.5 rounded-xl text-xs text-left font-mono transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-indigo-600"}`} />
                  <span className="truncate">{file.fileName}</span>
                </div>
              </button>
            );
          })}

          <div className="mt-auto p-3.5 rounded-2xl bg-white border border-slate-100 text-[11px] text-slate-500 shadow-sm">
            <span className="font-bold text-indigo-600 block mb-1">
              Android Studio Ready
            </span>
            <span>Target SDK: 34 • Kotlin 1.9 • Compose Compiler 1.5</span>
          </div>
        </div>

        {/* Right Panel: Code Code Viewer */}
        <div className="md:col-span-3 flex flex-col bg-white">
          {/* File Toolbar */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-indigo-600 font-bold">
              <span className="text-slate-500">{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 font-medium">
            {selectedFile.description}
          </div>

          {/* Code Textarea / Viewer */}
          <div className="p-4 flex-1 overflow-auto max-h-[460px] bg-slate-900 text-slate-100 m-3 rounded-2xl">
            <pre className="text-xs font-mono text-slate-200 whitespace-pre leading-relaxed font-normal">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
