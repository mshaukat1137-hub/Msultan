import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface PeerDevice {
  id: string;
  name: string;
  ip: string;
  deviceType: "android" | "tablet" | "browser";
  signal: number; // dBm
  status: "idle" | "busy" | "ready";
  lastSeen: number;
}

const activePeers: Map<string, PeerDevice> = new Map();

// Seed initial virtual peers so the user can test P2P file transfer right out of the box!
activePeers.set("peer_1", {
  id: "peer_1",
  name: "Shaukat Galaxy S24 Ultra",
  ip: "192.168.1.104",
  deviceType: "android",
  signal: -42,
  status: "ready",
  lastSeen: Date.now(),
});

activePeers.set("peer_2", {
  id: "peer_2",
  name: "Shaukat Pixel 9 Pro (Wi-Fi Direct)",
  ip: "192.168.1.118",
  deviceType: "android",
  signal: -58,
  status: "ready",
  lastSeen: Date.now(),
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API endpoints
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", name: "Shaukat P2P Transfer Engine" });
  });

  // Peer discovery endpoints
  app.get("/api/peers", (_req, res) => {
    // Refresh peer list and drop inactive peers > 60s
    const now = Date.now();
    const peers = Array.from(activePeers.values()).filter(p => now - p.lastSeen < 120000);
    res.json({ peers });
  });

  app.post("/api/peers/register", (req, res) => {
    const { id, name, ip, deviceType } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "Missing peer ID or name" });
    }

    const peer: PeerDevice = {
      id,
      name,
      ip: ip || "192.168.1." + Math.floor(Math.random() * 200 + 10),
      deviceType: deviceType || "android",
      signal: -(Math.floor(Math.random() * 30) + 35),
      status: "ready",
      lastSeen: Date.now(),
    };

    activePeers.set(id, peer);
    res.json({ success: true, peer });
  });

  app.post("/api/peers/heartbeat", (req, res) => {
    const { id } = req.body;
    const peer = activePeers.get(id);
    if (peer) {
      peer.lastSeen = Date.now();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Peer not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shaukat P2P Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
