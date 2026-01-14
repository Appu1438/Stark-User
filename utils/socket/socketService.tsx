type DriverUpdate = {
  id: string;
  current: { latitude: number; longitude: number };
  heading?: number;
};

class SocketService {
  private socket: WebSocket | null = null;
  private connected = false;
  private pingInterval: any = null;
  private reconnectTimeout: any = null;
  private hasShownDisconnectToast = false;

  /* ---------- LISTENERS ---------- */
  private connectListeners = new Set<() => void>();
  private nearbyDriverListeners = new Set<(drivers: any[]) => void>();
  private driverUpdateListeners = new Set<(updates: DriverUpdate[]) => void>();
  private messageListeners = new Set<(message: any) => void>();

  /* ===============================
     💓 HEARTBEAT
  =============================== */

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        console.log("💓 [USER_SOCKET] ping");
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);
  }

  private stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = null;
  }

  /* ===============================
     🔌 CONNECTION
  =============================== */

  connect() {
    if (this.socket) return;

    console.log("🔌 [USER_SOCKET] connecting…");
    this.socket = new WebSocket(process.env.EXPO_PUBLIC_SOCKET_URL!);

    this.socket.onopen = () => {
      console.log("✅ [USER_SOCKET] connected");
      this.connected = true;
      this.hasShownDisconnectToast = false;

      this.startPing();

      // Notify all connect listeners
      this.connectListeners.forEach(cb => cb());
    };

    this.socket.onclose = () => {
      console.warn("⚠️ [USER_SOCKET] disconnected");

      this.cleanup();

      if (!this.hasShownDisconnectToast) {
        this.hasShownDisconnectToast = true;
      }

      // Prevent duplicate reconnect timers
      if (this.reconnectTimeout) return;

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, 3000);
    };

    this.socket.onerror = (e) => {
      console.error("❌ [USER_SOCKET] error", e);
    };

    this.socket.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);

        if (message.type === "nearbyDrivers") {
          this.nearbyDriverListeners.forEach(cb =>
            cb(message.drivers)
          );
        }

        if (message.type === "driverLocationUpdate") {
          this.driverUpdateListeners.forEach(cb =>
            cb(message.drivers)
          );
        }

        this.messageListeners.forEach(cb => cb(message));
      } catch (err) {
        console.error("❌ [USER_SOCKET] parse failed", err);
      }
    };
  }

  private cleanup() {
    this.stopPing();
    this.connected = false;
    this.socket = null;
  }

  /* ===============================
     📦 SEND
  =============================== */

  send(data: any) {
    if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn("📦 [USER_SOCKET] send skipped (not connected)");
    }
  }

  /* ===============================
     🔔 LISTENER API
  =============================== */

  onConnected(cb: () => void) {
    this.connectListeners.add(cb);
    return () => this.connectListeners.delete(cb);
  }

  onNearbyDrivers(cb: (drivers: any[]) => void) {
    this.nearbyDriverListeners.add(cb);
    return () => this.nearbyDriverListeners.delete(cb);
  }

  onDriverLocationUpdates(cb: (updates: DriverUpdate[]) => void) {
    this.driverUpdateListeners.add(cb);
    return () => this.driverUpdateListeners.delete(cb);
  }

  onMessage(cb: (message: any) => void) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  /* ===============================
     🚕 USER ACTIONS
  =============================== */

  requestNearbyDrivers(location: { latitude: number; longitude: number }) {
    this.send({
      type: "requestDrivers",
      role: "user",
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }
}

const socketService = new SocketService();
export default socketService;
