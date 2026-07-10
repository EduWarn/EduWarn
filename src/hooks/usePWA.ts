import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALLED_KEY = 'pwa-installed';

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (import.meta.env.DEV) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      } else {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }

    // Detect installed: standalone display, iOS standalone, or previously recorded
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.startsWith('android-app://');

    const storedInstalled = localStorage.getItem(INSTALLED_KEY) === '1';

    if (isStandalone) {
      setIsInstalled(true);
      localStorage.setItem(INSTALLED_KEY, '1');
    } else if (storedInstalled) {
      setIsInstalled(true);
    }

    // Chrome/Android: query native check for installed related apps
    const nav = navigator as any;
    if (nav.getInstalledRelatedApps) {
      nav.getInstalledRelatedApps().then((apps: any[]) => {
        if (apps && apps.length > 0) {
          setIsInstalled(true);
          localStorage.setItem(INSTALLED_KEY, '1');
        }
      }).catch(() => {});
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Ignore if we already know app is installed
      if (localStorage.getItem(INSTALLED_KEY) === '1') return;
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      localStorage.setItem(INSTALLED_KEY, '1');
    };

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        localStorage.setItem(INSTALLED_KEY, '1');
      }
    };

    const standaloneMql = window.matchMedia('(display-mode: standalone)');
    standaloneMql.addEventListener?.('change', handleDisplayModeChange);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMql.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsInstalled(true);
      localStorage.setItem(INSTALLED_KEY, '1');
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return 'denied' as NotificationPermission;
  }, []);

  return {
    isInstallable,
    isInstalled,
    notificationPermission,
    installApp,
    requestNotificationPermission,
  };
};
