'use client';

import type React from "react";
import { useEffect } from "react";

interface DarkThemeWrapperProps {
  children: React.ReactNode;
}

export function DarkThemeWrapper({ children }: DarkThemeWrapperProps) {
  useEffect(() => {
    // Force dark theme CSS variables on mount
    const root = document.documentElement;
    
    // Add dark class to enable Tailwind dark mode
    const hadDarkClass = root.classList.contains('dark');
    root.classList.add('dark');
    
    root.style.setProperty('--background', '0 0% 4%');
    root.style.setProperty('--foreground', '0 0% 98%');
    root.style.setProperty('--card', '0 0% 7%');
    root.style.setProperty('--card-foreground', '0 0% 98%');
    root.style.setProperty('--popover', '0 0% 7%');
    root.style.setProperty('--popover-foreground', '0 0% 98%');
    root.style.setProperty('--primary', '262.1 83.3% 57.8%');
    root.style.setProperty('--primary-foreground', '0 0% 98%');
    root.style.setProperty('--secondary', '0 0% 14.9%');
    root.style.setProperty('--secondary-foreground', '0 0% 98%');
    root.style.setProperty('--muted', '0 0% 14.9%');
    root.style.setProperty('--muted-foreground', '0 0% 63.9%');
    root.style.setProperty('--accent', '0 0% 14.9%');
    root.style.setProperty('--accent-foreground', '0 0% 98%');
    root.style.setProperty('--destructive', '0 62.8% 30.6%');
    root.style.setProperty('--destructive-foreground', '0 0% 98%');
    root.style.setProperty('--border', '0 0% 14.9%');
    root.style.setProperty('--input', '0 0% 14.9%');
    root.style.setProperty('--ring', '262.1 83.3% 57.8%');
    root.style.colorScheme = 'dark';
    
    // Cleanup on unmount - restore to default
    return () => {
      // Only remove dark class if it wasn't there before
      if (!hadDarkClass) {
        root.classList.remove('dark');
      }
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--popover');
      root.style.removeProperty('--popover-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--destructive');
      root.style.removeProperty('--destructive-foreground');
      root.style.removeProperty('--border');
      root.style.removeProperty('--input');
      root.style.removeProperty('--ring');
      root.style.colorScheme = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      {children}
    </div>
  );
}
