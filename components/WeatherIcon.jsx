import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
} from 'lucide-react';

/**
 * Returns an appropriate weather icon with themed colors
 */
export default function WeatherIcon({ iconType, className = 'w-6 h-6' }) {
  switch (iconType) {
    case 'sun':
      return <Sun className={`${className} text-wheat-yellow animate-spin-slow`} />;
    case 'cloud-sun':
      return <CloudSun className={`${className} text-wheat-yellow`} />;
    case 'cloud':
      return <Cloud className={`${className} text-dark-brown/60`} />;
    case 'cloud-drizzle':
      return <CloudDrizzle className={`${className} text-water-blue`} />;
    case 'cloud-rain':
      return <CloudRain className={`${className} text-water-blue`} />;
    case 'cloud-lightning':
      return <CloudLightning className={`${className} text-wheat-yellow`} />;
    default:
      return <CloudSun className={`${className} text-wheat-yellow`} />;
  }
}
