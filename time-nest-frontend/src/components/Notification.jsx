import { useState, useEffect } from 'react';

export function Notification({ message, type = 'error', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    error: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700'
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded border ${typeStyles[type]} shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-lg font-bold hover:opacity-70"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useNotification() {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'error', duration = 5000) => {
    setNotification({ message, type, duration });
  };

  const NotificationComponent = notification ? (
    <Notification
      message={notification.message}
      type={notification.type}
      duration={notification.duration}
      onClose={() => setNotification(null)}
    />
  ) : null;

  return {
    showNotification,
    NotificationComponent,
    showError: (message, duration) => showNotification(message, 'error', duration),
    showSuccess: (message, duration) => showNotification(message, 'success', duration),
    showInfo: (message, duration) => showNotification(message, 'info', duration),
    showWarning: (message, duration) => showNotification(message, 'warning', duration),
  };
}
