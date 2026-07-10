import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

const PWA_DISMISS_KEY = 'pwa-prompt-dismissed-at';
const PWA_SHOW_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstalled) return;

    const dismissedAt = localStorage.getItem(PWA_DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < PWA_SHOW_INTERVAL) return;
    }

    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = useCallback(async () => {
    if (!isInstallable) {
      toast.info(
        isIOS
          ? 'On iPhone: tap the Share icon, then "Add to Home Screen".'
          : 'Open your browser menu (⋮) and tap "Install app" or "Add to Home Screen".',
        { duration: 6000 }
      );
      return;
    }
    try {
      await installApp();
      toast.success('App installed successfully!');
      setIsVisible(false);
    } catch {
      toast.error('Failed to install app');
    }
  }, [installApp, isInstallable, isIOS]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(PWA_DISMISS_KEY, Date.now().toString());
  }, []);

  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/85 p-4 flex items-center gap-3">
          <div className="bg-white rounded-xl p-2 shadow-md flex-shrink-0">
            <img
              src="/team-members/d7e3fbc0-a893-42e1-b105-df7983076c31.png"
              alt="EduWarn Nepal"
              className="w-8 h-8"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm">EduWarn Nepal App</h3>
            <p className="text-white/80 text-xs">Install for the best experience</p>
          </div>
          <Button
            onClick={handleClose}
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/15 h-8 w-8 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Works offline</span>
            </div>
            <span>•</span>
            <span>Fast & lightweight</span>
            <span>•</span>
            <span>Free</span>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1 h-10 font-semibold" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              {isInstallable ? 'Install Now' : 'How to Install'}
            </Button>
            <Button onClick={handleClose} variant="ghost" className="h-10 text-sm text-muted-foreground" size="sm">
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
