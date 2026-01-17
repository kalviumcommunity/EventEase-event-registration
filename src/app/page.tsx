'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUI } from '@/hooks/useUI';

export default function Home() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { theme, sidebarOpen, toggleTheme, toggleSidebar, addNotification } = useUI();

  const handleLogin = () => {
    login({ id: '1', name: 'John Doe', email: 'john@example.com' });
    addNotification('Logged in successfully!');
  };

  const handleLogout = () => {
    logout();
    addNotification('Logged out successfully!');
  };

  const bgClass = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black';
  const buttonClass = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className={`flex min-h-screen flex-col ${bgClass} font-sans transition-colors`}>
      {/* Navigation */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
          <span className="text-xl font-bold tracking-tight">EventFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 ${buttonClass}`}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95">
              Logout
            </button>
          ) : (
            <button onClick={handleLogin} className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95">
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed left-0 top-0 z-40 h-full w-64 bg-gray-100 dark:bg-gray-800 p-4 shadow-lg">
          <h2 className="text-lg font-bold mb-4">Sidebar</h2>
          <p>Sidebar is open!</p>
          <button onClick={toggleSidebar} className="mt-4 rounded bg-red-500 px-4 py-2 text-white">
            Close Sidebar
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pt-32 text-center">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Welcome to EventFlow
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
            {isAuthenticated ? `Hello, ${user?.name}!` : 'Please log in to access the dashboard.'}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={toggleSidebar} className={`rounded-full px-8 py-3 font-bold transition-all hover:scale-105 ${buttonClass} text-white`}>
              {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            </button>
          </div>

          {/* Demo Dashboard */}
          <div className="mt-10 w-full max-w-4xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Dashboard Demo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h3 className="font-semibold">Theme</h3>
                <p>Current: {theme}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h3 className="font-semibold">Auth Status</h3>
                <p>{isAuthenticated ? 'Logged In' : 'Logged Out'}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h3 className="font-semibold">Sidebar</h3>
                <p>{sidebarOpen ? 'Open' : 'Closed'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
