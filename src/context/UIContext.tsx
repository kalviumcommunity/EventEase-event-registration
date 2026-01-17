'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface Notification {
  id: string;
  message: string;
}

interface UIContextType {
  theme: Theme;
  sidebarOpen: boolean;
  notifications: Notification[];
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (msg: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleTheme = () => {
    console.log('Toggling theme from', theme);
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    console.log('Toggling sidebar');
    setSidebarOpen(prev => !prev);
  };

  const addNotification = (msg: string) => {
    const newNotification = { id: Date.now().toString(), message: msg };
    console.log('Adding notification:', msg);
    setNotifications(prev => [...prev, newNotification]);
  };

  const value: UIContextType = {
    theme,
    sidebarOpen,
    notifications,
    toggleTheme,
    toggleSidebar,
    addNotification,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};
