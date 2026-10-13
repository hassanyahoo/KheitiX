import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useLanguage } from '../context/LanguageContext';

/**
 * Main Layout Component
 * - TopBar with logo, language toggle, and logout
 * - Global Offline Banner Notification
 * - Left Sidebar on laptop screens (hidden on mobile)
 * - Bottom Navigation Bar on mobile (hidden on laptop)
 * - Safe bottom padding (pb-28) to prevent mobile nav obstruction
 */
export default function Layout() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream text-dark-brown flex flex-col font-body antialiased">
      {/* Top Bar across all views */}
      <TopBar />

      {/* Global Offline Banner Notification */}
      {!isOnline && (
        <div
          role="status"
          className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm animate-fade-in z-50 sticky top-16"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {t('common.offlineGlobal') ||
              'You are offline. Showing cached weather and farm data.'}
          </span>
        </div>
      )}

      {/* Main app body */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Left Sidebar on laptop screens */}
        <Sidebar />

        {/* Content Area with safe padding (pb-28 on mobile so cards never get cut off by bottom nav) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation on mobile screens */}
      <BottomNav />
    </div>
  );
}
