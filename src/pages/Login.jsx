import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';

/**
 * Login Page (Placeholder)
 * Route: /login
 * Phone-first farmer login for KhetiX
 */
export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder login: redirect to fields
    navigate('/fields');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-sm mx-auto">
      {/* Branding Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-leaf-green/10 text-leaf-green mx-auto flex items-center justify-center mb-3">
          <Sprout className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-dark-brown">
          KhetiX
        </h1>
        <p className="text-base text-dark-brown/70 mt-1">
          {t('tagline') || 'Right water, at the right time'}
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-dark-brown mb-1">
              {t('login') || 'Login'}
            </h2>
            <p className="text-sm text-dark-brown/70">
              Enter your mobile number to sign in
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-1.5">
              Mobile Number (موبائل نمبر)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-base font-semibold text-dark-brown/60">
                +92
              </span>
              <input
                type="tel"
                placeholder="300 1234567"
                defaultValue="301 2345678"
                className="w-full h-12 pl-14 pr-4 rounded-xl border border-[#D5C9B1] bg-white text-base text-dark-brown focus:outline-none focus:border-leaf-green"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary">
              {t('login') || 'Login'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
