// utils/socketService.ts

type DriverUpdate = {
  id: string;
  current: { latitude: number; longitude: number };
  heading?: number;
};

class SocketService {
  private socket: WebSocket | null = null;
  private connected = false;

  private onNearbyDriversCallback: ((drivers: any[]) => void) | null = null;
  private onDriverUpdatesCallback: ((updates: DriverUpdate[]) => void) | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;

  connect() {
    if (this.socket) return;

    this.socket = new WebSocket(process.env.EXPO_PUBLIC_SOCKET_URL!);

    this.socket.onopen = () => {
      console.log("✅ Socket connected");
      this.connected = true;
    };

    this.socket.onclose = () => {
      console.log("⚠️ Socket disconnected");
      this.connected = false;
      setTimeout(() => this.connect(), 3000); // reconnect
    };

    this.socket.onerror = (e) => {
      console.log("Socket Error:", e);
    };

    this.socket.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);

        // Existing handlers
        if (message.type === "nearbyDrivers" && this.onNearbyDriversCallback) {
          this.onNearbyDriversCallback(message.drivers);
        }
        if (message.type === "driverLocationUpdate" && this.onDriverUpdatesCallback) {
          this.onDriverUpdatesCallback(message.drivers);
        }

        // New generic message callback
        if (this.onMessageCallback) {
          this.onMessageCallback(message);
        }
      } catch (err) {
        console.error("Socket parsing failed", err);
      }
    };
  }

  // ✅ Generic send method for any message type
  send(data: any) {
    if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn("Socket not connected. Message not sent:", data);
    }
  }

  requestNearbyDrivers(location: { latitude: number; longitude: number }) {
    this.send({
      type: "requestDrivers",
      role: "user",
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }

  onNearbyDrivers(callback: (drivers: any[]) => void) {
    this.onNearbyDriversCallback = callback;
  }

  onDriverLocationUpdates(callback: (updates: DriverUpdate[]) => void) {
    this.onDriverUpdatesCallback = callback;
  }

  // ✅ Generic message listener
  onMessage(callback: (message: any) => void) {
    this.onMessageCallback = callback;
  }

  clearListeners() {
    this.onNearbyDriversCallback = null;
    this.onDriverUpdatesCallback = null;
    this.onMessageCallback = null;
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }
}

const socketService = new SocketService();
export default socketService;
