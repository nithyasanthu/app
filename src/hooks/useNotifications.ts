import { useEffect, useCallback, useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { Task } from '../types';
import { isBefore, addMinutes } from 'date-fns';

export function useNotifications() {
  const { tasks, settings } = useTodo();
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    soundRef.current = { play: createBeepSound } as any;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (settings.notifications.soundEnabled && soundRef.current) {
      try {
        soundRef.current.play();
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }
  }, [settings.notifications.soundEnabled]);

  const showNotification = useCallback((task: Task) => {
    if (!settings.notifications.enabled) return;

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Task Due: ${task.title}`, {
        body: task.description || 'You have a task due now!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: task.id,
        requireInteraction: true,
        actions: [
          { action: 'complete', title: 'Mark Complete' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }

    // Play sound
    playNotificationSound();

    // Show in-app notification (custom implementation)
    const showInAppNotification = () => {
      const notificationElement = document.createElement('div');
      notificationElement.className = 'notification-popup';
      notificationElement.innerHTML = `
        <div class="notification-content">
          <div class="notification-header">
            <strong>Task Due!</strong>
            <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
          </div>
          <div class="notification-body">
            <div class="notification-title">${task.title}</div>
            ${task.description ? `<div class="notification-description">${task.description}</div>` : ''}
          </div>
          <div class="notification-actions">
            <button class="btn btn-success btn-sm" onclick="window.completeTaskFromNotification('${task.id}')">
              Complete
            </button>
            <button class="btn btn-secondary btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">
              OK
            </button>
          </div>
        </div>
      `;

      // Add styles for the notification
      const style = document.createElement('style');
      style.textContent = `
        .notification-popup {
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 10000;
          max-width: 350px;
          animation: slideInRight 0.3s ease;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .notification-content {
          padding: 1rem;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-weight: 600;
        }
        
        .notification-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-title {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .notification-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .notification-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }
      `;

      if (!document.head.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
      }

      document.body.appendChild(notificationElement);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notificationElement.parentNode) {
          notificationElement.remove();
        }
      }, 10000);
    };

    showInAppNotification();
  }, [settings.notifications.enabled, playNotificationSound]);

  const scheduleNotification = useCallback((task: Task) => {
    if (!task.dueDate || !settings.notifications.enabled) return;

    const reminderTime = addMinutes(task.dueDate, -settings.notifications.reminderTime);
    const now = new Date();

    // Clear existing timeout for this task
    const existingTimeout = notificationTimeouts.current.get(task.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule notification if reminder time is in the future
    if (isBefore(now, reminderTime)) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      const timeout = setTimeout(() => {
        showNotification(task);
        notificationTimeouts.current.delete(task.id);
      }, timeUntilReminder);

      notificationTimeouts.current.set(task.id, timeout);
    }
  }, [settings.notifications, showNotification]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Schedule notifications for all incomplete tasks
  useEffect(() => {
    tasks
      .filter(task => !task.completed && task.dueDate)
      .forEach(scheduleNotification);

    // Cleanup function
    return () => {
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
    };
  }, [tasks, scheduleNotification]);

  // Request notification permission on first load
  useEffect(() => {
    if (settings.notifications.enabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        requestNotificationPermission();
      }
    }
  }, [settings.notifications.enabled, requestNotificationPermission]);

  return {
    requestNotificationPermission,
    playNotificationSound,
    showNotification
  };
}