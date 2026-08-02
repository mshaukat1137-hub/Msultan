import React, { useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { Navbar } from "./components/Navbar";
import { HomeScreen } from "./components/HomeScreen";
import { FilePickerModal } from "./components/FilePickerModal";
import { DeviceDiscoveryModal } from "./components/DeviceDiscoveryModal";
import { TransferProgressScreen } from "./components/TransferProgressScreen";
import { ReceivedFilesModal } from "./components/ReceivedFilesModal";
import { CodeExporterModal } from "./components/CodeExporterModal";
import { FileItem, PeerDevice } from "./types";
import { SAMPLE_FILES } from "./data/sampleFiles";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<"app" | "code_exporter" | "history">("app");
  const [appFlow, setAppFlow] = useState<
    "home" | "picker" | "discovery_sender" | "discovery_receiver" | "transferring"
  >("home");

  const [initialPickerCategory, setInitialPickerCategory] = useState<FileItem["category"]>("photo");
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([SAMPLE_FILES[0], SAMPLE_FILES[3]]);
  const [targetDevice, setTargetDevice] = useState<PeerDevice>({
    id: "peer_1",
    name: "Shaukat Galaxy S24 Ultra",
    ip: "192.168.1.104",
    deviceType: "android",
    signal: -42,
    status: "ready",
  });

  const [receivedFiles, setReceivedFiles] = useState<FileItem[]>([
    {
      id: "rec_1",
      name: "Shaukat_Camera_Photo_HD.jpg",
      category: "photo",
      size: 5200000,
      sizeFormatted: "5.20 MB",
      mimeType: "image/jpeg",
    },
    {
      id: "rec_2",
      name: "Fast_P2P_Wi-Fi_Socket_Demo.mp4",
      category: "video",
      size: 45000000,
      sizeFormatted: "45.0 MB",
      mimeType: "video/mp4",
    },
  ]);

  const handleToggleSelectFile = (file: FileItem) => {
    setSelectedFiles((prev) =>
      prev.some((f) => f.id === file.id)
        ? prev.filter((f) => f.id !== file.id)
        : [...prev, file]
    );
  };

  const handleCustomFileUpload = (files: FileList) => {
    // files are automatically parsed and added in FilePickerModal
  };

  const handleOpenCategory = (cat: FileItem["category"]) => {
    setInitialPickerCategory(cat);
    setAppFlow("picker");
  };

  const handleSelectPeerToConnect = (peer: PeerDevice) => {
    setTargetDevice(peer);
    setAppFlow("transferring");
  };

  const handleTransferCompleted = (completedFiles: FileItem[]) => {
    setReceivedFiles((prev) => [...completedFiles, ...prev]);
    setAppFlow("home");
  };

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const totalSizeFormatted = (totalSize / (1024 * 1024)).toFixed(1) + " MB";

  if (showSplash) {
    return <SplashScreen onStartApp={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSplash={() => setShowSplash(true)}
        receivedCount={receivedFiles.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full p-4 sm:p-6 flex flex-col items-center justify-center">
        {activeTab === "code_exporter" ? (
          <CodeExporterModal />
        ) : activeTab === "history" ? (
          <ReceivedFilesModal
            receivedFiles={receivedFiles}
            onBack={() => setActiveTab("app")}
          />
        ) : (
          /* Transfer App Screens */
          <>
            {appFlow === "home" && (
              <HomeScreen
                onSendClick={() => setAppFlow("picker")}
                onReceiveClick={() => setAppFlow("discovery_receiver")}
                onOpenCategory={handleOpenCategory}
                selectedFilesCount={selectedFiles.length}
                selectedFilesTotalSize={totalSizeFormatted}
              />
            )}

            {appFlow === "picker" && (
              <FilePickerModal
                initialCategory={initialPickerCategory}
                selectedFiles={selectedFiles}
                onToggleSelect={handleToggleSelectFile}
                onCustomFileUpload={handleCustomFileUpload}
                onProceedToDiscovery={() => setAppFlow("discovery_sender")}
                onBack={() => setAppFlow("home")}
              />
            )}

            {appFlow === "discovery_sender" && (
              <DeviceDiscoveryModal
                isSender={true}
                onSelectPeer={handleSelectPeerToConnect}
                onBack={() => setAppFlow("picker")}
              />
            )}

            {appFlow === "discovery_receiver" && (
              <DeviceDiscoveryModal
                isSender={false}
                onSelectPeer={handleSelectPeerToConnect}
                onBack={() => setAppFlow("home")}
              />
            )}

            {appFlow === "transferring" && (
              <TransferProgressScreen
                files={selectedFiles.length > 0 ? selectedFiles : [SAMPLE_FILES[0]]}
                targetDevice={targetDevice}
                onFinished={handleTransferCompleted}
                onCancel={() => setAppFlow("home")}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
