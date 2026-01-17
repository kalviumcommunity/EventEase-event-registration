'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 bg-brand"
    >
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}
