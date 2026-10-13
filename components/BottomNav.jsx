import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sprout, CloudSun, Droplets, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * BottomNav Component (Mobile only)
 * - Fixed bottom navigation bar
 * - Icons + Labels: Fields, Weather, Advice, Savings
 * - Active tab highlighted in green
 * - All tap targets at least 48px
 */
export default function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    {
      to: '/fields',
      label: t('fields') || 'Fields',
      icon: Sprout,
      // Also highlight active when creating a new field
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
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E0D7C6] lg:hidden shadow-[0_-2px_10px_rgba(62,39,35,0.05)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors select-none ${
                active
                  ? 'text-leaf-green font-bold'
                  : 'text-dark-brown/70 hover:text-leaf-green'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform ${
                  active ? 'scale-110 bg-light-green/25' : ''
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-xs mt-0.5 tracking-tight truncate max-w-full px-1">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
