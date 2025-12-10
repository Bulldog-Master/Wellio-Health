import { useState, useEffect } from 'react';

interface PlatformInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isCapacitor: boolean;
  isPWA: boolean;
  isStandalone: boolean;
  hasSafeAreaInsets: boolean;
}

export const usePlatform = (): PlatformInfo => {
  const [platform, setPlatform] = useState<PlatformInfo>(() => detectPlatform());

  useEffect(() => {
    const handleResize = () => {
      setPlatform(detectPlatform());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return platform;
};

function detectPlatform(): PlatformInfo {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid || window.innerWidth < 768;
  
  // Check if running inside Capacitor
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  
  // Check if running as installed PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;
  
  const isStandalone = isCapacitor || isPWA;
  
  // Check for safe area inset support
  const hasSafeAreaInsets = CSS.supports('padding-top: env(safe-area-inset-top)');

  return {
    isMobile,
    isIOS,
    isAndroid,
    isCapacitor,
    isPWA,
    isStandalone,
    hasSafeAreaInsets,
  };
}

export const useIsMobile = (): boolean => {
  const { isMobile } = usePlatform();
  return isMobile;
};
