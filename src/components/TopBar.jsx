import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * TopBar Component
 * - Logo text "KhetiX"
 * - Language toggle: English / اردو / سنڌي
 * - Logout button placeholder (min 48px tap target)
 */
export default function TopBar() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Placeholder logout action: redirects to /login
    navigate('/login');
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'اردو' },
    { code: 'sd', label: 'سنڌي' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E0D7C6] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Tagline */}
        <Link
          to="/fields"
          className="flex items-center gap-2 group min-h-[48px] focus:outline-none"
          title="KhetiX Home"
        >
          <div className="w-10 h-10 rounded-xl bg-leaf-green/10 flex items-center justify-center text-leaf-green group-hover:bg-leaf-green group-hover:text-white transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-2xl text-leaf-green tracking-tight">
              KhetiX
            </span>
            <p className="hidden sm:block text-xs text-dark-brown/70 leading-none">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Right side controls: Language toggle and Logout placeholder */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle */}
          <div
            className="flex items-center bg-[#F5EEDB] p-1 rounded-xl"
            role="group"
            aria-label="Language selection"
          >
            {languages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`min-h-[48px] px-2.5 sm:px-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center select-none ${
                    isActive
                      ? 'bg-leaf-green text-white shadow-sm'
                      : 'text-dark-brown hover:text-leaf-green hover:bg-white/50'
                  }`}
                  aria-pressed={isActive}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Logout button placeholder */}
          <button
            type="button"
            onClick={handleLogout}
            title={t('logout') || 'Logout'}
            className="min-h-[48px] min-w-[48px] px-3 py-2 rounded-xl border border-[#E0D7C6] text-dark-brown/80 hover:text-leaf-green hover:border-leaf-green hover:bg-light-green/10 flex items-center justify-center gap-2 transition-colors select-none"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline text-sm font-medium">
              {t('logout') || 'Logout'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
