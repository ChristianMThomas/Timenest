import { API_BASE_URL } from '../config/api';

class NotificationPollerService {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
    this.POLL_INTERVAL = 30000; // 30 seconds
    this.onNotificationCallback = null;
  }

  start(onNotificationCallback) {
    if (this.isActive) {
      console.log('Notification poller already running');
      return;
    }

    console.log('Starting notification poller');
    this.isActive = true;
    this.onNotificationCallback = onNotificationCallback;

    // Poll immediately
    this.pollNotifications();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.pollNotifications();
    }, this.POLL_INTERVAL);
  }

  stop() {
    console.log('Stopping notification poller');
    this.isActive = false;
    this.onNotificationCallback = null;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async pollNotifications() {
    if (!this.isActive) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.stop();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/shift-monitoring/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch notifications');
        return;
      }

      const notifications = await response.json();

      // Trigger callback for each undelivered notification
      if (notifications.length > 0 && this.onNotificationCallback) {
        notifications.forEach(notification => {
          this.onNotificationCallback(notification);
        });
      }
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }

  async markAsRead(notificationId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/shift-monitoring/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  isRunning() {
    return this.isActive;
  }
}

// Singleton instance
const notificationPollerService = new NotificationPollerService();
export default notificationPollerService;
