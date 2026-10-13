import React from 'react';
import {
  Sprout,
  Sun,
  Layers,
  CloudRain,
  Cpu,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import Card from '../components/Card';
import { useLanguage } from '../context/LanguageContext';

/**
 * About & Methodology Screen
 * Route: /about
 * Explains FAO-56 Penman-Monteith methodology, the 4 data pillars,
 * sensorless transparency, and scientific citations.
 */
export default function About() {
  const { t } = useLanguage();

  const dataPillars = [
    {
      icon: Sun,
      color: 'text-wheat-yellow bg-wheat-yellow/15 border-wheat-yellow/30',
      title: t('aboutScreen.pillar1Title') || '1. Weather Demand (ET0)',
      desc:
        t('aboutScreen.pillar1Desc') ||
        'Satellite and ground weather data (solar radiation, temperature, wind, humidity) from Open-Meteo.',
      highlight: 'Atmospheric Evaporative Power',
    },
    {
      icon: Sprout,
      color: 'text-leaf-green bg-leaf-green/15 border-leaf-green/30',
      title: t('aboutScreen.pillar2Title') || '2. Crop Factor (Kc)',
      desc:
        t('aboutScreen.pillar2Desc') ||
        'Calibrated crop water consumption coefficients across Initial, Development, Mid-Season, and Late-Season stages.',
      highlight: 'Wheat & Cotton Phenology',
    },
    {
      icon: Layers,
      color: 'text-[#8D6E63] bg-[#8D6E63]/15 border-[#8D6E63]/30',
      title: t('aboutScreen.pillar3Title') || '3. Soil Capacity',
      desc:
        t('aboutScreen.pillar3Desc') ||
        'Readily available water holding capacity for Sandy (25 mm), Loam (40 mm), and Clay (50 mm) soils of the Indus basin.',
      highlight: 'Root-Zone Water Retention',
    },
    {
      icon: CloudRain,
      color: 'text-water-blue bg-water-blue/15 border-water-blue/30',
      title: t('aboutScreen.pillar4Title') || '4. Rain Forecast',
      desc:
        t('aboutScreen.pillar4Desc') ||
        'Effective rain logic (80% of rainfall >= 5 mm) that postpones unnecessary irrigation when rain is expected.',
      highlight: 'Rainfall Credit & Postponement',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-dark-brown">
          {t('aboutScreen.title') || 'About & Methodology'}
        </h1>
        <p className="text-sm sm:text-base text-dark-brown/70 mt-0.5">
          {t('aboutScreen.subtitle') ||
            'FAO-56 Penman-Monteith Atmospheric Water Balance'}
        </p>
      </div>

      {/* Mission Card */}
      <Card className="border-l-4 border-leaf-green space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-leaf-green/10 text-leaf-green flex items-center justify-center shrink-0">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-dark-brown">
              KhetiX
            </h2>
            <p className="text-sm font-semibold text-leaf-green">
              "Right water, at the right time" (صحیح وقت پر، صحیح پانی)
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-dark-brown/85 leading-relaxed">
          {t('aboutScreen.missionText') ||
            "KhetiX empowers smallholder farmers in Khairpur, Sindh, Pakistan to apply the 'Right water, at the right time'. By eliminating guesswork, farmers protect wheat and cotton yields from waterlogging and drought while slashing tube-well diesel expenses."}
        </p>
      </Card>

      {/* Visual Diagram: The 4 Data Pillars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-heading font-bold text-dark-brown">
            {t('aboutScreen.methodologyTitle') || 'The 4 Core Data Pillars'}
          </h2>
          <span className="text-xs text-dark-brown/60 font-semibold">
            FAO-56 Inputs
          </span>
        </div>

        {/* 2x2 Grid of Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dataPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="flex flex-col justify-between border border-[#E0D7C6]/60 hover:border-leaf-green/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${pillar.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-dark-brown">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-dark-brown/75 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#F5EEDB] text-[11px] font-bold text-dark-brown/60 uppercase">
                  {pillar.highlight}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transparency: Why KhetiX Works Without Expensive Sensors */}
      <Card className="border-2 border-leaf-green/30 bg-gradient-to-br from-white via-white to-[#F1F8E9] space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-leaf-green/15 text-leaf-green flex items-center justify-center shrink-0 mt-0.5">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-dark-brown">
              {t('aboutScreen.whyNoSensorsTitle') ||
                'Why KhetiX Works Without Costly Hardware Sensors'}
            </h3>
            <span className="text-xs font-semibold text-leaf-green uppercase tracking-wide">
              Atmospheric Water Balance Model
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-dark-brown/85 leading-relaxed">
          {t('aboutScreen.whyNoSensorsDesc') ||
            'Physical IoT soil moisture probes cost Rs 50,000+, easily clog in Indus canal silt, and fail during power outages. KhetiX uses an atmospheric water-balance model (mass conservation) validated by the UN FAO. We calculate water leaving the field through evapotranspiration and water entering through rain or irrigation, delivering high accuracy at zero hardware cost to the farmer.'}
        </p>

        {/* Benefits list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E0D7C6]">
          <div className="flex items-center gap-2 text-xs font-semibold text-dark-brown/80">
            <CheckCircle2 className="w-4 h-4 text-leaf-green shrink-0" />
            <span>Zero hardware or maintenance cost</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-dark-brown/80">
            <CheckCircle2 className="w-4 h-4 text-leaf-green shrink-0" />
            <span>Works 100% offline with local cache</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-dark-brown/80">
            <CheckCircle2 className="w-4 h-4 text-leaf-green shrink-0" />
            <span>Calibrated for Khairpur silt/clay soil</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-dark-brown/80">
            <CheckCircle2 className="w-4 h-4 text-leaf-green shrink-0" />
            <span>Field-tested FAO-56 scientific equations</span>
          </div>
        </div>
      </Card>

      {/* References & Scientific Sources */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-water-blue" />
          <h3 className="font-heading font-bold text-base text-dark-brown">
            {t('aboutScreen.sourcesTitle') || 'Scientific References & Data Sources'}
          </h3>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-dark-brown/80">
          <div className="p-2.5 rounded-xl bg-[#FFF8E1] border border-[#E0D7C6]/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-leaf-green shrink-0 mt-0.5" />
            <div>
              <strong>UN FAO-56 Paper:</strong>{' '}
              {t('aboutScreen.refFao') ||
                "FAO Irrigation and Drainage Paper No. 56: 'Crop Evapotranspiration - Guidelines for computing crop water requirements' (Allen, Pereira, Raes, Smith)."}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF8E1] border border-[#E0D7C6]/60 flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-water-blue shrink-0 mt-0.5" />
            <div>
              <strong>Open-Meteo Weather API:</strong>{' '}
              {t('aboutScreen.refMeteo') ||
                'Open-Meteo High-Resolution Global Weather & Evapotranspiration Reanalysis API.'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF8E1] border border-[#E0D7C6]/60 flex items-start gap-2">
            <Compass className="w-4 h-4 text-wheat-yellow shrink-0 mt-0.5" />
            <div>
              <strong>Local Agronomy:</strong>{' '}
              {t('aboutScreen.refParc') ||
                'Pakistan Agricultural Research Council (PARC) & Sindh Agriculture Extension guidelines for wheat and cotton cultivation.'}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] sm:text-xs text-dark-brown/60 pt-2 border-t border-[#F5EEDB] leading-relaxed">
          {t('aboutScreen.disclaimer') ||
            'Disclaimer: KhetiX provides scientific decision support to optimize irrigation. Actual field conditions may vary based on salinity, drainage, and local canal rotation.'}
        </p>
      </Card>
    </div>
  );
}
