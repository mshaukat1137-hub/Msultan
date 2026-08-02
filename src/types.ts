export interface FileItem {
  id: string;
  name: string;
  category: "photo" | "video" | "app" | "document";
  size: number; // in bytes
  sizeFormatted: string;
  mimeType: string;
  thumbnailUrl?: string;
  iconName?: string;
  appVersion?: string;
  apkPackageName?: string;
  selected?: boolean;
  blob?: Blob;
}

export interface PeerDevice {
  id: string;
  name: string;
  ip: string;
  deviceType: "android" | "tablet" | "browser";
  signal: number; // dBm e.g. -45
  status: "idle" | "busy" | "ready" | "connected";
  lastSeen?: number;
}

export interface TransferTask {
  id: string;
  file: FileItem;
  direction: "send" | "receive";
  targetDevice: PeerDevice;
  status: "preparing" | "transferring" | "paused" | "completed" | "error";
  progressPercentage: number; // 0 to 100
  transferredBytes: number;
  totalBytes: number;
  currentSpeedMBs: number; // MB/s
  averageSpeedMBs: number;
  estimatedSecondsRemaining: number;
  startTime: number;
  errorMessage?: string;
  downloadUrl?: string;
}

export interface AndroidSourceFile {
  path: string;
  fileName: string;
  language: "kotlin" | "xml" | "gradle";
  description: string;
  content: string;
}
