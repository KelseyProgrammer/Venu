"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { useWindowManager } from '@/hooks/useWindowManager';

type WindowType = 'notifications' | 'gig-updates' | null;

interface WindowManagerContextType {
  activeWindow: WindowType;
  openWindow: (windowType: WindowType) => void;
  closeWindow: () => void;
  isWindowOpen: (windowType: WindowType) => boolean;
  windowRef: React.RefObject<HTMLDivElement>;
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

interface WindowManagerProviderProps {
  children: ReactNode;
}

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  const windowManager = useWindowManager();

  return (
    <WindowManagerContext.Provider value={windowManager}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManagerContext(): WindowManagerContextType {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error('useWindowManagerContext must be used within a WindowManagerProvider');
  }
  return context;
}
