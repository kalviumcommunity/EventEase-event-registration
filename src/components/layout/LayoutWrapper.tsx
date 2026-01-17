'use client';

import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}
