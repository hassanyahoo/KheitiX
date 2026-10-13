import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sprout, CloudSun, Droplets, TrendingUp, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Sidebar Component (Laptop screens)
 * - Displayed as a left sidebar on laptop screens
 * - Icons + Labels: Fields, Weather, Advice, Savings (+ About)
 * - Active tab highlighted in green
 * - All tap targets at least 48px
 */
export default function Sidebar() {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    {
      to: '/fields',
      label: t('fields') || 'Fields',
      icon: Sprout,
      isActive: location.pathname.startsWith('/fields'),
    },
    {
      to: '/weather',
      label: t('weather') || 'Weather',
      icon: CloudSun,
      isActive: location.pathname === '/weather',
    },
    {
      to: '/advice',
      label: t('advice') || 'Advice',
      icon: Droplets,
      isActive: location.pathname === '/advice',
    },
    {
      to: '/savings',
      label: t('savings') || 'Savings',
      icon: TrendingUp,
      isActive: location.pathname === '/savings',
    },
  ];

  return (
    <aside
      className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-[#E0D7C6] min-h-[calc(100vh-4rem)] p-4 shrink-0"
      aria-label="Desktop Sidebar Navigation"
    >
      <div className="space-y-2 flex-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-dark-brown/60">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-base font-medium transition-all ${
                active
                  ? 'bg-light-green/25 text-leaf-green font-bold shadow-xs'
                  : 'text-dark-brown/80 hover:bg-[#F5EEDB] hover:text-leaf-green'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? 'text-leaf-green' : 'text-dark-brown/70'}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Secondary footer links */}
      <div className="pt-4 border-t border-[#E0D7C6] space-y-1">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-light-green/25 text-leaf-green font-bold'
                : 'text-dark-brown/70 hover:bg-[#F5EEDB] hover:text-leaf-green'
            }`
          }
        >
          <Info className="w-5 h-5" />
          <span>{t('about') || 'About'}</span>
        </NavLink>
      </div>
    </aside>
  );
}
