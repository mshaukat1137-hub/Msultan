import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Radio,
  Smartphone,
  Tablet,
  Laptop,
  Wifi,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Globe
} from "lucide-react";
import { PeerDevice } from "../types";

interface DeviceDiscoveryModalProps {
  isSender: boolean;
  onSelectPeer: (peer: PeerDevice) => void;
  onBack: () => void;
}

export const DeviceDiscoveryModal: React.FC<DeviceDiscoveryModalProps> = ({
  isSender,
  onSelectPeer,
  onBack,
}) => {
  const [peers, setPeers] = useState<PeerDevice[]>([
    {
      id: "peer_1",
      name: "Shaukat Galaxy S24 Ultra",
      ip: "192.168.1.104",
      deviceType: "android",
      signal: -42,
      status: "ready",
    },
    {
      id: "peer_2",
      name: "Shaukat Pixel 9 Pro (Wi-Fi Direct)",
      ip: "192.168.1.118",
      deviceType: "android",
      signal: -58,
      status: "ready",
    },
  ]);

  const [isScanning, setIsScanning] = useState(true);

  // Fetch peers from server API or register current peer tab
  useEffect(() => {
    let isMounted = true;
    const fetchPeers = async () => {
      try {
        const res = await fetch("/api/peers");
        if (res.ok) {
          const data = await res.json();
          if (data.peers && data.peers.length > 0 && isMounted) {
            setPeers(data.peers);
          }
        }
      } catch (err) {
        console.warn("Peers API offline, using Wi-Fi Direct simulation", err);
      }
    };

    fetchPeers();
    const interval = setInterval(fetchPeers, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRefreshDiscovery = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl">
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
              {isSender ? "Nearby Devices" : "Listening for Connection"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isSender
                ? "Searching nearby phones running Shaukat app"
                : "Your device is discoverable via Wi-Fi Direct"}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshDiscovery}
          className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition-colors cursor-pointer shadow-sm"
          title="Scan again"
        >
          <RefreshCw className={`w-5 h-5 ${isScanning ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Animated Radar Pulse Container */}
      <div className="relative py-8 bg-slate-50 flex flex-col items-center justify-center border-b border-slate-100 overflow-hidden">
        {/* Radar Waves */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <motion.div
            animate={{ scale: [0.8, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-indigo-400/40 bg-indigo-500/10 pointer-events-none"
          />
          <motion.div
            animate={{ scale: [0.8, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2, delay: 0.7, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-teal-400/40 bg-teal-500/10 pointer-events-none"
          />

          <div className="relative z-10 w-20 h-20 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 flex flex-col items-center justify-center border border-indigo-400">
            <Radio className="w-9 h-9 text-white animate-pulse" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 font-bold tracking-tight">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span>Scanning for Wi-Fi Direct Peers...</span>
        </div>
      </div>

      {/* Discovered Peers List */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">
            Nearby Devices ({peers.length})
          </h3>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Direct Connect</span>
        </div>

        <div className="flex flex-col gap-3">
          {peers.map((peer, idx) => (
            <motion.div
              key={peer.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectPeer(peer)}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 flex items-center justify-between transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                  {peer.name.charAt(0)}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {peer.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                    <span>{idx === 0 ? "Hotspot Ready" : "In range"}</span>
                    <span>•</span>
                    <span>{peer.ip}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPeer(peer);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Connect
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tip Banner */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Need to test P2P? Open another browser tab to discover live!</span>
        </div>
      </div>
    </div>
  );
};
