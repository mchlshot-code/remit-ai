'use client';

import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY_INSTALLED = 'remitai_pwa_installed';
const COOKIE_KEY_DISMISSED = 'remitai_pwa_dismissed';
const DISMISS_DAYS = 7;

/** Check if the app is running in standalone (installed PWA) mode. */
function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari
  if ((navigator as unknown as { standalone?: boolean }).standalone === true) return true;
  // Standard browsers (Chrome, Edge, etc.)
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

/** Set a cookie with a given name, value, and expiry in days. */
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** Read a cookie value by name. Returns null if not found. */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Never show inside an installed PWA (standalone mode)
    if (isStandaloneMode()) return;

    // 2. Never show if the user has already installed the app
    if (localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true') return;

    // 3. Never show if the user manually dismissed within the last 7 days
    if (getCookie(COOKIE_KEY_DISMISSED) === 'true') return;

    // Check if on mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for the appinstalled event to permanently flag installation
    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // The appinstalled listener will handle persisting the flag
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Set a 7-day cookie so the prompt stays hidden across sessions
    setCookie(COOKIE_KEY_DISMISSED, 'true', DISMISS_DAYS);
  };

  if (!showPrompt || !isMobile) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 border border-emerald-400/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Add RemitAI to home screen</p>
            <p className="text-white/80 text-xs">Access rates faster anywhere</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-emerald-600 hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
