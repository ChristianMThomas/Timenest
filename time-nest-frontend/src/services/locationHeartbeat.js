import { API_BASE_URL } from '../config/api';

class LocationHeartbeatService {
  constructor() {
    this.watchId = null;
    this.isActive = false;
    this.workAreaConfig = null;
    this.lastServerSync = null;
    this.lastPosition = null;
    this.violationState = 'compliant'; // 'compliant', 'warning'
    this.violationStartTime = null;

    // Adaptive intervals based on compliance state
    this.COMPLIANT_HEARTBEAT_INTERVAL = 120000; // 2 minutes when in geofence
    this.WARNING_HEARTBEAT_INTERVAL = 30000;    // 30 seconds when outside geofence
    this.MAX_RETRIES = 5;
    this.retryAttempts = 0;
    this.pendingHeartbeats = [];

    // Callbacks for UI updates
    this.onViolationDetected = null;
    this.onReturnedToCompliance = null;
    this.onNetworkError = null;
  }

  start(workAreaConfig, callbacks = {}) {
    if (this.isActive) {
      console.log('Heartbeat service already running');
      return;
    }

    console.log('Starting real-time location monitoring with geofencing');
    console.log('Work area:', workAreaConfig);

    this.isActive = true;
    this.workAreaConfig = workAreaConfig;
    this.onViolationDetected = callbacks.onViolationDetected;
    this.onReturnedToCompliance = callbacks.onReturnedToCompliance;
    this.onNetworkError = callbacks.onNetworkError;

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // Use watchPosition for continuous monitoring (not polling)
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handlePositionError(error),
      {
        enableHighAccuracy: this.violationState === 'warning', // High accuracy during violations
        maximumAge: this.violationState === 'warning' ? 5000 : 30000, // Fresher data during violations
        timeout: 15000
      }
    );

    console.log('Location tracking started with watchPosition');
  }

  stop() {
    console.log('Stopping location heartbeat service');
    this.isActive = false;
    this.violationState = 'compliant';
    this.violationStartTime = null;

    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  handlePositionUpdate(position) {
    if (!this.isActive) return;

    const { latitude, longitude, accuracy } = position.coords;

    // Filter out low-accuracy readings (>100m accuracy)
    if (accuracy > 100) {
      console.warn('Low GPS accuracy:', accuracy, 'm - skipping update');
      return;
    }

    // Skip if position hasn't changed significantly (reduce processing)
    if (this.lastPosition && !this.hasSignificantMovement(latitude, longitude)) {
      // Still need to do periodic sync even if not moved
      this.conditionalServerSync(latitude, longitude);
      return;
    }

    this.lastPosition = { latitude, longitude };

    // CLIENT-SIDE GEOFENCE CHECK (real-time detection)
    const distance = this.calculateDistance(
      this.workAreaConfig.latitude,
      this.workAreaConfig.longitude,
      latitude,
      longitude
    );

    const isInGeofence = distance <= this.workAreaConfig.radiusMeters;

    console.log(`Distance from work area: ${distance.toFixed(1)}m (limit: ${this.workAreaConfig.radiusMeters}m) - ${isInGeofence ? 'IN' : 'OUT'}`);

    // STATE MACHINE: Detect violations and compliance returns
    if (!isInGeofence && this.violationState === 'compliant') {
      // VIOLATION DETECTED - immediate action
      console.warn('GEOFENCE VIOLATION DETECTED!');
      this.violationState = 'warning';
      this.violationStartTime = Date.now();

      // Notify UI immediately
      if (this.onViolationDetected) {
        this.onViolationDetected(distance);
      }

      // Send urgent heartbeat to backend for validation
      this.sendHeartbeatToServer(latitude, longitude, true);

      // Switch to high accuracy mode
      this.updateWatchAccuracy(true);

    } else if (isInGeofence && this.violationState === 'warning') {
      // RETURNED TO COMPLIANCE
      console.log('Employee returned to geofence');
      this.violationState = 'compliant';
      this.violationStartTime = null;

      // Notify UI
      if (this.onReturnedToCompliance) {
        this.onReturnedToCompliance();
      }

      // Send urgent heartbeat to clear warning
      this.sendHeartbeatToServer(latitude, longitude, true);

      // Switch back to normal accuracy mode
      this.updateWatchAccuracy(false);

    } else {
      // Stable state - periodic sync
      this.conditionalServerSync(latitude, longitude);
    }
  }

  handlePositionError(error) {
    console.error('Geolocation error:', error.code, error.message);

    // Continue trying - don't stop on errors
    // Common errors: timeout, position unavailable
    // User may be indoors or have poor GPS signal
  }

  conditionalServerSync(latitude, longitude) {
    const now = Date.now();
    const interval = this.violationState === 'warning'
      ? this.WARNING_HEARTBEAT_INTERVAL
      : this.COMPLIANT_HEARTBEAT_INTERVAL;

    if (!this.lastServerSync || (now - this.lastServerSync) >= interval) {
      this.sendHeartbeatToServer(latitude, longitude, false);
    }
  }

  async sendHeartbeatToServer(latitude, longitude, urgent = false) {
    if (!this.isActive) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      this.stop();
      return;
    }

    const heartbeat = {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      urgent // Flag for backend to prioritize
    };

    try {
      const response = await fetch(`${API_BASE_URL}/shift-monitoring/heartbeat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(heartbeat),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Heartbeat failed:', response.status, error);

        // If no active shift, stop heartbeat
        if (error.error?.includes('No active shift')) {
          console.warn('No active shift detected - stopping heartbeat service');
          this.stop();
        }

        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Heartbeat sent successfully:', { latitude, longitude, urgent });

      this.lastServerSync = Date.now();
      this.retryAttempts = 0;

      // Process any queued heartbeats
      this.processPendingHeartbeats();

    } catch (error) {
      console.error('Error sending heartbeat:', error);

      // Queue for retry
      this.pendingHeartbeats.push(heartbeat);
      this.retryAttempts++;

      if (this.retryAttempts >= this.MAX_RETRIES && this.onNetworkError) {
        this.onNetworkError();
      }

      // Exponential backoff
      const backoffDelay = Math.min(1000 * Math.pow(2, this.retryAttempts), 60000);
      setTimeout(() => this.processPendingHeartbeats(), backoffDelay);
    }
  }

  async processPendingHeartbeats() {
    // Send most recent heartbeat from queue
    if (this.pendingHeartbeats.length > 0) {
      // Keep only most recent heartbeat (discard old ones)
      const recentHeartbeat = this.pendingHeartbeats[this.pendingHeartbeats.length - 1];
      this.pendingHeartbeats = [];

      await this.sendHeartbeatToServer(
        recentHeartbeat.latitude,
        recentHeartbeat.longitude,
        recentHeartbeat.urgent
      );
    }
  }

  updateWatchAccuracy(highAccuracy) {
    // Restart watch with new accuracy settings
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handlePositionError(error),
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: highAccuracy ? 5000 : 30000,
        timeout: 15000
      }
    );
  }

  hasSignificantMovement(latitude, longitude) {
    if (!this.lastPosition) return true;

    const distance = this.calculateDistance(
      this.lastPosition.latitude,
      this.lastPosition.longitude,
      latitude,
      longitude
    );

    // Consider movement significant if >5 meters
    // Filters out GPS jitter
    return distance > 5;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  isRunning() {
    return this.isActive;
  }

  getViolationState() {
    return this.violationState;
  }
}

// Singleton instance
const locationHeartbeatService = new LocationHeartbeatService();
export default locationHeartbeatService;
