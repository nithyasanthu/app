import React, { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { useNotifications } from '../hooks/useNotifications';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Clock, 
  Download, 
  Upload, 
  Trash2,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, tasks } = useTodo();
  const { requestNotificationPermission, playNotificationSound } = useNotifications();
  const [showDataManagement, setShowDataManagement] = useState(false);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSettings({
          notifications: {
            ...settings.notifications,
            enabled: true
          }
        });
      }
    } else {
      updateSettings({
        notifications: {
          ...settings.notifications,
          enabled: false
        }
      });
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        soundEnabled: enabled
      }
    });

    if (enabled) {
      playNotificationSound();
    }
  };

  const handleReminderTimeChange = (minutes: number) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        reminderTime: minutes
      }
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    
    // Apply theme immediately
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const exportData = () => {
    const data = {
      tasks,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.tasks && Array.isArray(data.tasks)) {
          // You would implement import logic here
          console.log('Import data:', data);
          alert('Data import feature would be implemented here');
        } else {
          alert('Invalid backup file format');
        }
      } catch (error) {
        alert('Error reading backup file');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  const reminderOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted">
          Customize your todo app experience
        </p>
      </div>

      {/* Notifications Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h3 className="font-semibold">Notifications</h3>
          </div>
        </div>
        <div className="card-body space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Notifications</h4>
              <p className="text-sm text-muted">
                Receive reminders when tasks are due
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Sound Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sound Notifications</h4>
              <p className="text-sm text-muted">
                Play sound when notifications appear
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playNotificationSound()}
                className="btn btn-secondary btn-sm"
                disabled={!settings.notifications.soundEnabled}
              >
                Test Sound
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.soundEnabled}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                  disabled={!settings.notifications.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Reminder Time */}
          <div>
            <h4 className="font-medium mb-3">Reminder Time</h4>
            <p className="text-sm text-muted mb-4">
              How early should we remind you before a task is due?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {reminderOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleReminderTimeChange(option.value)}
                  disabled={!settings.notifications.enabled}
                  className={`btn btn-sm ${
                    settings.notifications.reminderTime === option.value
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Permission Status */}
          <div className="p-4 bg-surface-alt rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-muted" />
              <span className="text-sm font-medium">Browser Permission Status</span>
            </div>
            <p className="text-sm text-muted">
              {typeof Notification !== 'undefined' 
                ? `Notification permission: ${Notification.permission}`
                : 'Notifications not supported in this browser'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Monitor size={20} />
            <h3 className="font-semibold">Appearance</h3>
          </div>
        </div>
        <div className="card-body space-y-6">
          {/* Theme Selection */}
          <div>
            <h4 className="font-medium mb-3">Theme</h4>
            <p className="text-sm text-muted mb-4">
              Choose your preferred color scheme
            </p>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value as any)}
                    className={`btn ${
                      settings.theme === option.value ? 'btn-primary' : 'btn-secondary'
                    } flex-col py-4`}
                  >
                    <Icon size={24} className="mb-2" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SettingsIcon size={20} />
              <h3 className="font-semibold">Data Management</h3>
            </div>
            <button
              onClick={() => setShowDataManagement(!showDataManagement)}
              className="btn btn-secondary btn-sm"
            >
              {showDataManagement ? 'Hide' : 'Show'} Options
            </button>
          </div>
        </div>
        
        {showDataManagement && (
          <div className="card-body space-y-6">
            {/* Export Data */}
            <div>
              <h4 className="font-medium mb-2">Export Data</h4>
              <p className="text-sm text-muted mb-4">
                Download a backup of all your tasks and settings
              </p>
              <button
                onClick={exportData}
                className="btn btn-secondary"
              >
                <Download size={16} />
                Export Backup
              </button>
            </div>

            {/* Import Data */}
            <div>
              <h4 className="font-medium mb-2">Import Data</h4>
              <p className="text-sm text-muted mb-4">
                Restore from a previously exported backup file
              </p>
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={16} />
                Import Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>

            {/* Clear Data */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-2 text-error-color">Danger Zone</h4>
              <p className="text-sm text-muted mb-4">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <button
                onClick={clearAllData}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Information */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Smartphone size={20} />
            <h3 className="font-semibold">App Information</h3>
          </div>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted">Version</h4>
              <p className="text-lg">1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted">Total Tasks</h4>
              <p className="text-lg">{tasks.length}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted">Storage Used</h4>
              <p className="text-lg">
                {Math.round(JSON.stringify({ tasks, settings }).length / 1024)} KB
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted">Browser</h4>
              <p className="text-lg">
                {navigator.userAgent.includes('Chrome') ? 'Chrome' :
                 navigator.userAgent.includes('Firefox') ? 'Firefox' :
                 navigator.userAgent.includes('Safari') ? 'Safari' :
                 navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Features Support */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Feature Support</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <span className="text-sm">Notifications</span>
                <span className={`text-sm ${
                  typeof Notification !== 'undefined' ? 'text-success-color' : 'text-error-color'
                }`}>
                  {typeof Notification !== 'undefined' ? 'Supported' : 'Not Supported'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <span className="text-sm">Voice Input</span>
                <span className={`text-sm ${
                  typeof (window as any).webkitSpeechRecognition !== 'undefined' || typeof (window as any).SpeechRecognition !== 'undefined'
                    ? 'text-success-color' : 'text-error-color'
                }`}>
                  {typeof (window as any).webkitSpeechRecognition !== 'undefined' || typeof (window as any).SpeechRecognition !== 'undefined'
                    ? 'Supported' : 'Not Supported'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <span className="text-sm">Local Storage</span>
                <span className={`text-sm ${
                  typeof Storage !== 'undefined' ? 'text-success-color' : 'text-error-color'
                }`}>
                  {typeof Storage !== 'undefined' ? 'Supported' : 'Not Supported'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <span className="text-sm">PWA Support</span>
                <span className="text-sm text-success-color">Supported</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;