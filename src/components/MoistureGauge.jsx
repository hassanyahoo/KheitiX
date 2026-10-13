import React from 'react';
import { Droplet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Simulated Soil Moisture Gauge Component
 * Reflects available root-zone soil water percentage (0% to 100%)
 * based on cumulative depletion versus allowed soil depletion.
 */
export default function MoistureGauge({
  moisturePct = 100,
  currentDepletion = 0,
  allowedDepletion = 40,
  className = '',
}) {
  const { t } = useLanguage();

  // Status color logic based on available moisture
  let statusColor = '#2E7D32'; // leaf green
  let statusBg = 'bg-leaf-green';
  let statusText = 'Adequate';
  let statusBadge = 'bg-light-green/25 text-leaf-green';

  if (moisturePct <= 25) {
    statusColor = '#D32F2F'; // red
    statusBg = 'bg-[#D32F2F]';
    statusText = 'Critical / Low';
    statusBadge = 'bg-red-100 text-red-700';
  } else if (moisturePct <= 50) {
    statusColor = '#F9A825'; // wheat yellow
    statusBg = 'bg-wheat-yellow';
    statusText = 'Moderate';
    statusBadge = 'bg-wheat-yellow/20 text-[#B7791F]';
  }

  // Calculate SVG circular arc stroke offset (radius = 45, circumference ~ 283)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  // Use a semi-circle or 240-degree arc:
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * moisturePct) / 100;

  return (
    <div
      className={`bg-white rounded-[16px] p-4 shadow-[0_4px_14px_rgba(62,39,35,0.08)] ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Droplet className="w-4 h-4 text-water-blue" />
          <h3 className="text-sm font-heading font-bold text-dark-brown">
            {t('adviceScreen.moistureGauge') || 'Root-Zone Moisture'}
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-dark-brown/60 uppercase tracking-wider bg-[#FFF8E1] px-2 py-0.5 rounded-md border border-[#E0D7C6]">
          {t('adviceScreen.simulatedReading') || 'Simulated reading'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        {/* Semi-circular gauge visual */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F5EEDB"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset="0"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={statusColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
            />
          </svg>

          {/* Center text reading */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-heading font-black text-dark-brown tracking-tight">
              {moisturePct}%
            </span>
            <span className="text-[11px] font-semibold text-dark-brown/60 -mt-1">
              Available
            </span>
          </div>
        </div>

        {/* Gauge breakdown metrics */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-brown/70">
              Current Moisture Status:
            </span>
            <span
              className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${statusBadge}`}
            >
              {statusText}
            </span>
          </div>

          {/* Linear bar representation */}
          <div>
            <div className="h-2.5 w-full bg-[#F5EEDB] rounded-full overflow-hidden">
              <div
                className={`h-full ${statusBg} rounded-full transition-all duration-500`}
                style={{ width: `${moisturePct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-dark-brown/70 pt-1 border-t border-[#F5EEDB]">
            <span>
              Depletion: <strong>{currentDepletion} mm</strong>
            </span>
            <span>
              Limit: <strong>{allowedDepletion} mm</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
