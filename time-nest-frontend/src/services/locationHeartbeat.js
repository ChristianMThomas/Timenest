import { API_BASE_URL } from '../config/api';

class LocationHeartbeatService {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
    this.HEARTBEAT_INTERVAL = 150000; // 2.5 minutes (150 seconds)
  }

  start() {
    if (this.isActive) {
      console.log('Heartbeat service already running');
      return;
    }

    console.log('Starting location heartbeat service');
    this.isActive = true;

    // Send initial heartbeat
    this.sendHeartbeat();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  stop() {
    console.log('Stopping location heartbeat service');
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async sendHeartbeat() {
    if (!this.isActive) return;

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        this.stop();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/shift-monitoring/heartbeat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Heartbeat failed:', error);

        // If no active shift, stop heartbeat
        if (error.error?.includes('No active shift')) {
          this.stop();
        }
      } else {
        console.log('Location heartbeat sent successfully');
      }
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  }

  isRunning() {
    return this.isActive;
  }
}

// Singleton instance
const locationHeartbeatService = new LocationHeartbeatService();
export default locationHeartbeatService;
