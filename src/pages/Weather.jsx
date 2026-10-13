import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Droplets,
  RotateCw,
  MapPin,
  Info,
  Calendar,
  CloudRain,
  WifiOff,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import WeatherIcon from '../components/WeatherIcon';
import { fetchWeather, getCachedWeather, KHAIRPUR_DEFAULT_COORDS } from '../lib/weather';
import { getStoredFields } from '../lib/fields';
import { useLanguage } from '../context/LanguageContext';

/**
 * Helper to format day labels for the 7-day forecast
 */
function getDayTitle(dayOffset, dateStr, language, t) {
  if (dayOffset === 0) return t('weatherScreen.today') || 'Today';
  if (dayOffset === 1) return t('weatherScreen.tomorrow') || 'Tomorrow';

  try {
    const d = new Date(dateStr);
    const locale = language === 'ur' ? 'ur-PK' : language === 'sd' ? 'sd-PK' : 'en-US';
    return d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Skeleton Loader Component
 */
function WeatherSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Featured Card Skeleton */}
      <div className="bg-white rounded-[16px] p-5 shadow-[0_4px_14px_rgba(62,39,35,0.08)] space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#E0D7C6]/50 rounded" />
            <div className="h-10 w-36 bg-[#E0D7C6]/70 rounded-lg" />
          </div>
          <div className="w-14 h-14 bg-[#E0D7C6]/50 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E0D7C6]/40">
          <div className="h-16 bg-[#FFF8E1] rounded-xl" />
          <div className="h-16 bg-[#FFF8E1] rounded-xl" />
        </div>
        <div className="h-14 bg-[#FFF8E1] rounded-xl" />
      </div>

      {/* Forecast Skeletons */}
      <div className="space-y-3">
        <div className="h-5 w-48 bg-[#E0D7C6]/60 rounded" />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-20 bg-white rounded-[16px] shadow-[0_4px_14px_rgba(62,39,35,0.08)] p-4 flex items-center justify-between"
          >
            <div className="h-4 w-24 bg-[#E0D7C6]/50 rounded" />
            <div className="h-8 w-16 bg-[#E0D7C6]/50 rounded" />
            <div className="h-4 w-20 bg-[#E0D7C6]/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Weather Screen Component
 * Route: /weather
 */
export default function Weather() {
  const { t, language } = useLanguage();

  // Field profiles list
  const [fields] = useState(() => getStoredFields());
  const [selectedFieldId, setSelectedFieldId] = useState(
    () => fields[0]?.id || 'default'
  );

  // Determine current active coordinates
  const currentField = fields.find((f) => f.id === selectedFieldId) || {
    name: 'Khairpur Mirs',
    lat: KHAIRPUR_DEFAULT_COORDS.latitude,
    lon: KHAIRPUR_DEFAULT_COORDS.longitude,
    taluka: 'Khairpur Mirs',
  };

  // Weather state initialized with cached data if available for instant display
  const [weatherData, setWeatherData] = useState(() =>
    getCachedWeather(currentField.lat, currentField.lon)
  );
  const [loading, setLoading] = useState(() => !weatherData);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle field switching with immediate cache display
  const handleFieldChange = (newFieldId) => {
    setSelectedFieldId(newFieldId);
    const newField = fields.find((f) => f.id === newFieldId);
    if (newField) {
      const cached = getCachedWeather(newField.lat, newField.lon);
      setWeatherData(cached || null);
      setLoading(!cached);
      setError(null);
    }
  };

  // Fetch when field selection changes or manual refresh triggered
  useEffect(() => {
    let isCancelled = false;

    async function doFetch() {
      try {
        const fresh = await fetchWeather(currentField.lat, currentField.lon);
        if (!isCancelled) {
          setWeatherData(fresh);
          setError(null);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        if (!isCancelled && !weatherData) {
          setError(
            t('weatherScreen.errorMsg') ||
              'Unable to fetch live weather data. Check your internet connection.'
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    doFetch();

    return () => {
      isCancelled = true;
    };
  }, [currentField.lat, currentField.lon, refreshTrigger, t, weatherData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Screen Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-dark-brown">
          {t('weatherScreen.title') || 'Weather & Evapotranspiration'}
        </h1>
        <p className="text-sm sm:text-base text-dark-brown/70 mt-0.5">
          {currentField.name} • {t('weatherScreen.subtitle') || 'Khairpur Mirs, Sindh'}
        </p>
      </div>

      {/* Field Selector Dropdown & Refresh Button */}
      <div className="bg-white rounded-[16px] p-3 shadow-[0_4px_14px_rgba(62,39,35,0.06)] flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-leaf-green/10 text-leaf-green flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="field-select"
              className="block text-xs font-semibold text-dark-brown/60 uppercase tracking-wider"
            >
              {t('weatherScreen.selectField') || 'Select Field'}
            </label>
            <select
              id="field-select"
              value={selectedFieldId}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full bg-transparent font-heading font-bold text-base text-dark-brown focus:outline-none truncate cursor-pointer py-0.5"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.taluka || 'Khairpur'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Manual Refresh Button (min 48px tap target) */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="min-h-[48px] min-w-[48px] rounded-xl text-dark-brown/70 hover:text-leaf-green hover:bg-[#FFF8E1] transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Refresh weather"
          title="Refresh weather data"
        >
          <RotateCw
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-leaf-green' : ''}`}
          />
        </button>
      </div>

      {/* Offline Notice Badge (if showing cached data while offline) */}
      {weatherData?.isOffline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-center gap-2.5 text-xs sm:text-sm">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {t('weatherScreen.offlineNotice') ||
              'Offline Mode: Showing last saved weather data'}
          </span>
        </div>
      )}

      {/* Rain Expected Warning Banner (precipitation sum > 5mm in next 3 days) */}
      {weatherData?.hasRainWarning && (
        <div className="bg-[#E1F5FE] border-2 border-water-blue/40 text-dark-brown rounded-[16px] p-4 shadow-[0_4px_14px_rgba(2,136,209,0.08)] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-water-blue/15 text-water-blue flex items-center justify-center shrink-0 mt-0.5">
            <CloudRain className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-base text-water-blue">
                {t('weatherScreen.rainWarningTitle') || 'Rain Expected Ahead'}
              </span>
              <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-water-blue text-white">
                {weatherData.threeDayRainSum} mm
              </span>
            </div>
            <p className="text-sm text-dark-brown/85 mt-1 leading-relaxed">
              {(
                t('weatherScreen.rainWarningMsg') ||
                'Rain forecast in the next 3 days: {amount} mm. Pause or reduce irrigation to save fuel and avoid waterlogging.'
              ).replace('{amount}', weatherData.threeDayRainSum)}
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !weatherData && <WeatherSkeleton />}

      {/* Error State with Retry Button */}
      {error && !weatherData && (
        <Card className="border-2 border-amber-300 text-center py-8 px-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="max-w-sm mx-auto">
            <h2 className="text-lg font-heading font-bold text-dark-brown">
              {t('weatherScreen.errorMsg') ||
                'Unable to fetch live weather data. Check your internet connection.'}
            </h2>
            <p className="text-sm text-dark-brown/60 mt-1">
              Please check your connection and try again.
            </p>
          </div>
          <div className="pt-2 max-w-xs mx-auto">
            <Button variant="primary" onClick={handleRefresh}>
              {t('weatherScreen.retry') || 'Retry'}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Weather Content */}
      {weatherData && (
        <div className="space-y-6">
          {/* Big Featured Card for Today's Weather */}
          <Card className="bg-gradient-to-br from-white via-white to-[#FFF8E1] border-2 border-leaf-green/20 relative overflow-hidden">
            {/* Top row: Date, Condition badge & Main weather icon */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-leaf-green/10 text-leaf-green">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('weatherScreen.todayTitle') || "Today's Agro-Weather"}
                </span>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-heading font-black text-dark-brown tracking-tight">
                    {weatherData.today.maxTemp}°C
                  </span>
                  <span className="text-lg sm:text-xl font-heading font-semibold text-dark-brown/60">
                    / {weatherData.today.minTemp}°C
                  </span>
                </div>

                <p className="text-base font-semibold text-dark-brown/80 mt-1">
                  {t(weatherData.today.condition.labelKey) || 'Clear Sky'}
                </p>
              </div>

              {/* Intuitive Weather Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-wheat-yellow/15 flex items-center justify-center shrink-0 shadow-inner">
                <WeatherIcon
                  iconType={weatherData.today.condition.icon}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
            </div>

            {/* Metrics Grid: Rainfall & ET0 */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#E0D7C6]">
              {/* Rainfall in mm */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E0D7C6]/60 shadow-xs">
                <div className="flex items-center gap-1.5 text-water-blue text-xs font-bold uppercase tracking-wide">
                  <Droplets className="w-4 h-4" />
                  <span>{t('weatherScreen.rainfall') || 'Rainfall'}</span>
                </div>
                <div className="text-2xl font-heading font-extrabold text-dark-brown mt-1.5">
                  {weatherData.today.rain} <span className="text-sm font-normal text-dark-brown/60">mm</span>
                </div>
                <p className="text-xs text-dark-brown/60 mt-0.5">
                  {weatherData.today.rain > 0 ? 'Precipitation expected' : 'Zero rain'}
                </p>
              </div>

              {/* ET0 Reference Evapotranspiration in mm/day */}
              <div className="p-3.5 rounded-xl bg-white border border-leaf-green/30 shadow-xs">
                <div className="flex items-center gap-1.5 text-leaf-green text-xs font-bold uppercase tracking-wide">
                  <Droplets className="w-4 h-4 text-leaf-green" />
                  <span>ET0</span>
                </div>
                <div className="text-2xl font-heading font-extrabold text-leaf-green mt-1.5">
                  {weatherData.today.et0}{' '}
                  <span className="text-sm font-normal text-dark-brown/60">mm/day</span>
                </div>
                <p className="text-xs text-dark-brown/60 mt-0.5">
                  Crop Evapotranspiration
                </p>
              </div>
            </div>

            {/* Clear Helper Banner for ET0 */}
            <div className="mt-3.5 p-3 rounded-xl bg-[#FFF8E1] border border-wheat-yellow/40 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-wheat-yellow shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-dark-brown/90 leading-snug">
                <strong className="text-dark-brown font-semibold">
                  {t('weatherScreen.et0Title') || 'ET0 Evapotranspiration'}:
                </strong>{' '}
                {t('weatherScreen.et0Helper') || 'Water the crop loses per day'}
              </div>
            </div>
          </Card>

          {/* 7-Day Forecast Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-dark-brown">
                {t('weatherScreen.forecastTitle') || '7-Day Forecast & Water Loss'}
              </h2>
              <span className="text-xs text-dark-brown/60 font-medium">
                Khairpur Station
              </span>
            </div>

            <div className="space-y-2.5">
              {weatherData.forecast7Days.map((day) => {
                const dayLabel = getDayTitle(
                  day.dayOffset,
                  day.date,
                  language,
                  t
                );

                return (
                  <Card
                    key={day.date}
                    className={`py-3 px-3.5 transition-all ${
                      day.isToday
                        ? 'border-2 border-leaf-green bg-[#F5EEDB]/40'
                        : 'hover:border-[#E0D7C6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Day & Condition */}
                      <div className="flex items-center gap-3 min-w-[100px] sm:min-w-[140px]">
                        <div className="w-10 h-10 rounded-xl bg-wheat-yellow/10 flex items-center justify-center shrink-0">
                          <WeatherIcon
                            iconType={day.condition.icon}
                            className="w-5 h-5"
                          />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-sm sm:text-base text-dark-brown flex items-center gap-1.5">
                            <span>{dayLabel}</span>
                            {day.isToday && (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-leaf-green text-white">
                                Today
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-dark-brown/60 block truncate max-w-[90px] sm:max-w-none">
                            {t(day.condition.labelKey) || 'Clear'}
                          </span>
                        </div>
                      </div>

                      {/* Temperature Range */}
                      <div className="text-center px-1">
                        <div className="font-heading font-bold text-sm sm:text-base text-dark-brown whitespace-nowrap">
                          {day.maxTemp}° / <span className="text-dark-brown/60 text-xs sm:text-sm">{day.minTemp}°</span>
                        </div>
                        <span className="text-[10px] text-dark-brown/50 uppercase tracking-wider block">
                          Temp
                        </span>
                      </div>

                      {/* Rain Amount */}
                      <div className="text-center px-1 min-w-[50px]">
                        <div
                          className={`font-semibold text-xs sm:text-sm whitespace-nowrap ${
                            day.rain > 0 ? 'text-water-blue font-bold' : 'text-dark-brown/70'
                          }`}
                        >
                          {day.rain} mm
                        </div>
                        <span className="text-[10px] text-dark-brown/50 uppercase tracking-wider block">
                          Rain
                        </span>
                      </div>

                      {/* ET0 Water Loss */}
                      <div className="text-right pl-1 min-w-[65px]">
                        <div className="font-heading font-extrabold text-xs sm:text-sm text-leaf-green whitespace-nowrap">
                          {day.et0} mm/d
                        </div>
                        <span className="text-[10px] text-dark-brown/50 uppercase tracking-wider block">
                          ET0 Loss
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
