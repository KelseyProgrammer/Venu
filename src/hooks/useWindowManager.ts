"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

type WindowType = 'notifications' | 'gig-updates' | null;

interface UseWindowManagerReturn {
  activeWindow: WindowType;
  openWindow: (windowType: WindowType) => void;
  closeWindow: () => void;
  isWindowOpen: (windowType: WindowType) => boolean;
  windowRef: React.RefObject<HTMLDivElement>;
}

export const useWindowManager = (): UseWindowManagerReturn => {
  const [activeWindow, setActiveWindow] = useState<WindowType>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const openWindow = useCallback((windowType: WindowType) => {
    setActiveWindow(windowType);
  }, []);

  const closeWindow = useCallback(() => {
    setActiveWindow(null);
  }, []);

  const isWindowOpen = useCallback((windowType: WindowType) => {
    return activeWindow === windowType;
  }, [activeWindow]);

  // Handle click outside to close window
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
        closeWindow();
      }
    };

    if (activeWindow) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeWindow, closeWindow]);

  // Handle escape key to close window
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeWindow) {
        closeWindow();
      }
    };

    if (activeWindow) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeWindow, closeWindow]);

  return {
    activeWindow,
    openWindow,
    closeWindow,
    isWindowOpen,
    windowRef,
  };
};
