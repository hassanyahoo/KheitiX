import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Plus, MapPin } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';

/**
 * Fields Page (Placeholder)
 * Route: /fields
 * Lists registered crop fields in Khairpur, Sindh
 */
export default function Fields() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark-brown">
            {t('fields') || 'Fields'}
          </h1>
          <p className="text-base text-dark-brown/70 mt-1">
            Khairpur Mirs, Sindh • Wheat & Cotton Management
          </p>
        </div>
        <Link to="/fields/new" className="w-full sm:w-auto">
          <Button variant="primary" className="gap-2">
            <Plus className="w-5 h-5" />
            <span>{t('newField') || 'New Field'}</span>
          </Button>
        </Link>
      </div>

      {/* Field Cards */}
      <div className="space-y-4">
        {/* Placeholder Field 1: Wheat */}
        <Card className="border-l-4 border-leaf-green">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-wheat-yellow/20 text-[#B7791F]">
                  Wheat (گندم / ڪڻڪ)
                </span>
                <span className="text-xs text-dark-brown/60">5 Acres</span>
              </div>
              <h2 className="text-lg font-heading font-bold text-dark-brown mt-2">
                North Plot - Kot Diji
              </h2>
              <p className="text-base text-dark-brown/70 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-leaf-green shrink-0" />
                Khairpur District, Sindh
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-light-green/30 flex items-center justify-center text-leaf-green shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5EEDB] flex items-center justify-between">
            <span className="text-sm font-medium text-leaf-green">
              Status: Optimal Moisture
            </span>
            <Link to="/advice">
              <Button variant="secondary" className="!h-10 !min-h-[40px] text-sm px-4">
                View Advice
              </Button>
            </Link>
          </div>
        </Card>

        {/* Placeholder Field 2: Cotton */}
        <Card className="border-l-4 border-water-blue">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-water-blue/15 text-water-blue">
                  Cotton (کپاس / ڦٽيون)
                </span>
                <span className="text-xs text-dark-brown/60">8 Acres</span>
              </div>
              <h2 className="text-lg font-heading font-bold text-dark-brown mt-2">
                Canal Side Plot - Gambat
              </h2>
              <p className="text-base text-dark-brown/70 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-water-blue shrink-0" />
                Khairpur District, Sindh
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-water-blue/15 flex items-center justify-center text-water-blue shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5EEDB] flex items-center justify-between">
            <span className="text-sm font-medium text-water-blue">
              Irrigation recommended in 2 days
            </span>
            <Link to="/advice">
              <Button variant="secondary" className="!h-10 !min-h-[40px] text-sm px-4">
                View Advice
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
