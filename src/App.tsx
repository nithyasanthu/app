import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TodoProvider, useTodo } from './context/TodoContext';
import { useNotifications } from './hooks/useNotifications';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

// Global function for notifications
declare global {
  interface Window {
    completeTaskFromNotification: (taskId: string) => void;
  }
}

function AppContent() {
  const { toggleTask } = useTodo();
  const { requestNotificationPermission } = useNotifications();

  useEffect(() => {
    // Set up global function for notification actions
    window.completeTaskFromNotification = (taskId: string) => {
      toggleTask(taskId);
      // Remove notification if it exists
      const notifications = document.querySelectorAll('.notification-popup');
      notifications.forEach(notification => notification.remove());
    };

    // Request notification permission
    requestNotificationPermission();

    return () => {
      delete window.completeTaskFromNotification;
    };
  }, [toggleTask, requestNotificationPermission]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;