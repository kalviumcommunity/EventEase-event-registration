import { useUIContext } from '@/context/UIContext';

export const useUI = () => {
  const {
    theme,
    sidebarOpen,
    notifications,
    toggleTheme,
    toggleSidebar,
    addNotification,
  } = useUIContext();

  return {
    theme,
    sidebarOpen,
    notifications,
    toggleTheme,
    toggleSidebar,
    addNotification,
  };
};
