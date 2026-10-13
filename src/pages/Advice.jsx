import React, { useState, useEffect, useMemo } from 'react';
import {
  Droplets,
  MapPin,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Layers,
  Thermometer,
  CloudRain,
  Clock,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import MoistureGauge from '../components/MoistureGauge';
import { fetchWeather, getCachedWeather, KHAIRPUR_DEFAULT_COORDS } from '../lib/weather';
import {
  getStoredFields,
  updateFieldLastIrrigation,
  updateFieldAttributes,
} from '../lib/fields';
import { calculateIrrigationSchedule } from '../lib/irrigation';
import { logIrrigationEvent } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

/**
 * Format day label (Today, Tomorrow, or localized weekday & date)
 */
function formatDayName(dayOffset, dateStr, language, t) {
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
 * Advice Screen Component
 * Route: /advice
 * Core FAO-56 Irrigation Recommendation Engine
 */
export default function Advice() {
  const { t, language } = useLanguage();

  // Field selection state
  const [fields, setFields] = useState(() => getStoredFields());
  const [selectedFieldId, setSelectedFieldId] = useState(
    () => fields[0]?.id || 'f-kot-diji'
  );

  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  // Editable overrides for interactive experimentation
  const [growthStage, setGrowthStage] = useState(
    () => currentField?.growthStage || 'mid-season'
  );
  const [soilType, setSoilType] = useState(
    () => currentField?.soilType || 'loam'
  );

  // Weather data state
  const [weatherData, setWeatherData] = useState(() =>
    getCachedWeather(currentField?.lat, currentField?.lon)
  );
  const [loading, setLoading] = useState(() => !weatherData);
  const [successToast, setSuccessToast] = useState('');
  const [showCalcSteps, setShowCalcSteps] = useState(false);
  const [isLoggingIrrigation, setIsLoggingIrrigation] = useState(false);

  // Synchronize overrides when selected field changes
  const handleFieldChange = (newFieldId) => {
    setSelectedFieldId(newFieldId);
    const target = fields.find((f) => f.id === newFieldId);
    if (target) {
      setGrowthStage(target.growthStage || 'mid-season');
      setSoilType(target.soilType || 'loam');
      const cached = getCachedWeather(target.lat, target.lon);
      if (cached) setWeatherData(cached);
    }
  };

  // Fetch weather data for selected field
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const data = await fetchWeather(
          currentField?.lat || KHAIRPUR_DEFAULT_COORDS.latitude,
          currentField?.lon || KHAIRPUR_DEFAULT_COORDS.longitude
        );
        if (!isCancelled) {
          setWeatherData(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Weather fetch fallback to cache/error:', err);
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [currentField?.lat, currentField?.lon]);

  // Execute FAO-56 irrigation recommendation calculation
  const adviceResult = useMemo(() => {
    if (!weatherData) return null;

    return calculateIrrigationSchedule({
      rawWeatherResponse: weatherData,
      field: currentField,
      customStage: growthStage,
      customSoil: soilType,
    });
  }, [weatherData, currentField, growthStage, soilType]);

  /**
   * Action handler for "I irrigated today"
   */
  const handleIrrigatedToday = async () => {
    setIsLoggingIrrigation(true);
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Update local field state and localStorage
    const updatedFields = updateFieldLastIrrigation(currentField.id, todayStr);
    setFields(updatedFields);

    // 2. Log to Supabase irrigation_logs table
    try {
      await logIrrigationEvent({
        fieldId: currentField.id,
        fieldName: currentField.name,
        crop: currentField.crop,
        areaAcres: currentField.areaAcres,
        soilType: soilType,
        amountMm: adviceResult?.amountMm || 35,
        litres: adviceResult?.totalLitres || 700000,
      });
    } catch (err) {
      console.warn('Irrigation log error:', err);
    } finally {
      setIsLoggingIrrigation(false);
    }

    // 3. Show instant feedback toast
    setSuccessToast(
      t('adviceScreen.irrigatedSuccess') ||
        'Irrigation recorded! Soil moisture reset to 100%.'
    );
    setTimeout(() => setSuccessToast(''), 6000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-dark-brown">
          {t('adviceScreen.title') || 'Irrigation Advice'}
        </h1>
        <p className="text-sm sm:text-base text-dark-brown/70 mt-0.5">
          {t('adviceScreen.subtitle') || 'FAO-56 Crop Water Model • Khairpur Mirs, Sindh'}
        </p>
      </div>

      {/* Field Selector & Field Parameters */}
      <Card className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-leaf-green/10 text-leaf-green flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="advice-field-select"
              className="block text-xs font-semibold text-dark-brown/60 uppercase tracking-wider"
            >
              {t('adviceScreen.selectField') || 'Select Field'}
            </label>
            <select
              id="advice-field-select"
              value={selectedFieldId}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full bg-transparent font-heading font-bold text-base text-dark-brown focus:outline-none truncate cursor-pointer py-0.5"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.crop === 'wheat' ? 'Wheat' : 'Cotton'} • {f.areaAcres} Acres)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Growth Stage and Soil Controls */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F5EEDB]">
          <div>
            <label className="block text-xs font-semibold text-dark-brown/60 mb-1">
              {t('adviceScreen.cropStage') || 'Growth Stage'}
            </label>
            <select
              value={growthStage}
              onChange={(e) => {
                setGrowthStage(e.target.value);
                updateFieldAttributes(currentField.id, { growthStage: e.target.value });
              }}
              className="w-full h-11 px-3 rounded-xl border border-[#D5C9B1] bg-white text-xs sm:text-sm font-semibold text-dark-brown focus:outline-none focus:border-leaf-green"
            >
              <option value="initial">{t('adviceScreen.stages.initial') || 'Initial'}</option>
              <option value="development">{t('adviceScreen.stages.development') || 'Development'}</option>
              <option value="mid-season">{t('adviceScreen.stages.mid-season') || 'Mid-Season'}</option>
              <option value="late-season">{t('adviceScreen.stages.late-season') || 'Late-Season'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-brown/60 mb-1">
              {t('adviceScreen.soilType') || 'Soil Type'}
            </label>
            <select
              value={soilType}
              onChange={(e) => {
                setSoilType(e.target.value);
                updateFieldAttributes(currentField.id, { soilType: e.target.value });
              }}
              className="w-full h-11 px-3 rounded-xl border border-[#D5C9B1] bg-white text-xs sm:text-sm font-semibold text-dark-brown focus:outline-none focus:border-leaf-green"
            >
              <option value="sandy">{t('adviceScreen.soils.sandy') || 'Sandy (25 mm)'}</option>
              <option value="loam">{t('adviceScreen.soils.loam') || 'Loam (40 mm)'}</option>
              <option value="clay">{t('adviceScreen.soils.clay') || 'Clay (50 mm)'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-[#E8F5E9] border-2 border-leaf-green text-leaf-green rounded-[16px] p-4 shadow-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span className="font-heading font-bold text-sm sm:text-base text-dark-brown">
            {successToast}
          </span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !adviceResult && (
        <div className="bg-white rounded-[16px] p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#E0D7C6]/60 rounded" />
          <div className="h-16 w-full bg-[#E0D7C6]/40 rounded-xl" />
          <div className="h-28 w-full bg-[#E0D7C6]/30 rounded-xl" />
        </div>
      )}

      {/* Active Advice Content */}
      {adviceResult && (
        <div className="space-y-6">
          {/* Big Featured Result Card */}
          <Card
            className={`border-2 relative overflow-hidden ${
              adviceResult.recommendedDay
                ? 'border-leaf-green bg-gradient-to-br from-white via-white to-[#F1F8E9]'
                : 'border-water-blue/40 bg-gradient-to-br from-white via-white to-[#E1F5FE]'
            }`}
          >
            {/* Recommendation Header Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  adviceResult.recommendedDay
                    ? 'bg-leaf-green text-white'
                    : 'bg-water-blue/20 text-water-blue'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {adviceResult.recommendedDay
                  ? 'Recommended Action'
                  : 'Moisture Status: Sufficient'}
              </span>

              <span className="text-xs font-semibold text-dark-brown/60">
                {currentField.areaAcres} Acres • {currentField.crop === 'wheat' ? 'Wheat' : 'Cotton'}
              </span>
            </div>

            {/* Main Decision Headline */}
            <div className="mt-3">
              {adviceResult.recommendedDay ? (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-dark-brown">
                    {adviceResult.recommendedDay.dayOffset === 0
                      ? t('adviceScreen.irrigateToday') || 'Irrigate Today'
                      : adviceResult.recommendedDay.dayOffset === 1
                      ? t('adviceScreen.irrigateTomorrow') || 'Irrigate Tomorrow'
                      : (t('adviceScreen.irrigateOn') || 'Irrigate on {day}').replace(
                          '{day}',
                          formatDayName(
                            adviceResult.recommendedDay.dayOffset,
                            adviceResult.recommendedDay.date,
                            language,
                            t
                          )
                        )}
                  </h2>
                  <p className="text-sm sm:text-base text-dark-brown/75 mt-1">
                    Allowed depletion threshold ({adviceResult.allowedDepletion} mm) reached.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-dark-brown">
                    {t('adviceScreen.noIrrigationNeeded') || 'No Irrigation Needed Right Now'}
                  </h2>
                  <p className="text-sm sm:text-base text-dark-brown/75 mt-1">
                    {t('adviceScreen.noIrrigationDesc') ||
                      'Root-zone soil moisture is currently sufficient. Next check in 3 days.'}
                  </p>
                </div>
              )}
            </div>

            {/* Rain Postponement Callout Banner */}
            {adviceResult.isRainPostponed && (
              <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs sm:text-sm text-dark-brown">
                <CloudRain className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{t('adviceScreen.rainPostpone') || 'Irrigation Postponed:'}</strong>{' '}
                  {adviceResult.rainPostponeReason}
                </span>
              </div>
            )}

            {/* Water Amount & Litres Calculation */}
            {adviceResult.recommendedDay && (
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E0D7C6]">
                <div className="p-3.5 rounded-xl bg-white border border-leaf-green/30 shadow-xs">
                  <span className="text-xs font-bold uppercase text-leaf-green tracking-wide block">
                    {t('adviceScreen.depthToApply') || 'Depth to Apply'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-dark-brown mt-1">
                    {adviceResult.amountMm}{' '}
                    <span className="text-sm font-semibold text-dark-brown/60">mm</span>
                  </div>
                  <span className="text-[11px] text-dark-brown/60">
                    Depth needed to refill root zone
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-water-blue/30 shadow-xs">
                  <span className="text-xs font-bold uppercase text-water-blue tracking-wide block">
                    {t('adviceScreen.totalVolume') || 'Total Field Volume'}
                  </span>
                  <div className="text-xl sm:text-2xl font-heading font-extrabold text-water-blue mt-1 truncate">
                    {adviceResult.totalLitres.toLocaleString()}{' '}
                    <span className="text-xs font-semibold text-dark-brown/60">L</span>
                  </div>
                  <span className="text-[11px] text-dark-brown/60">
                    For {currentField.areaAcres} acres (4,047 L/mm/ac)
                  </span>
                </div>
              </div>
            )}

            {/* "I irrigated today" Primary Action Button */}
            <div className="mt-5">
              <Button
                variant="primary"
                onClick={handleIrrigatedToday}
                disabled={isLoggingIrrigation}
                className="gap-2.5 shadow-md"
              >
                <Droplets className="w-5 h-5" />
                <span>
                  {isLoggingIrrigation
                    ? 'Saving...'
                    : t('adviceScreen.iIrrigatedToday') || 'I Irrigated Today'}
                </span>
              </Button>
            </div>
          </Card>

          {/* Simulated Soil Moisture Gauge */}
          <MoistureGauge
            moisturePct={adviceResult.currentMoisturePct}
            currentDepletion={adviceResult.currentDepletion}
            allowedDepletion={adviceResult.allowedDepletion}
          />

          {/* 7-Day Irrigation Schedule Table/Cards */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-heading font-bold text-dark-brown">
                {t('adviceScreen.scheduleTitle') || '7-Day Schedule & Water Balance'}
              </h3>
              <span className="text-xs text-dark-brown/60">
                Limit: {adviceResult.allowedDepletion} mm
              </span>
            </div>

            <div className="space-y-2">
              {adviceResult.scheduleDays.map((day) => {
                const dayLabel = formatDayName(day.dayOffset, day.date, language, t);

                // Status chip configuration
                let chipBg = 'bg-leaf-green/15 text-leaf-green';
                let chipLabel = t('adviceScreen.statusFine') || 'Fine';
                if (day.status === 'irrigate') {
                  chipBg = 'bg-red-100 text-red-700 font-bold';
                  chipLabel = t('adviceScreen.statusIrrigate') || 'Irrigate';
                } else if (day.status === 'soon') {
                  chipBg = 'bg-wheat-yellow/25 text-[#B7791F] font-semibold';
                  chipLabel = t('adviceScreen.statusSoon') || 'Watch';
                }

                return (
                  <div
                    key={day.date}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                      day.status === 'irrigate'
                        ? 'border-red-300 bg-red-50/40'
                        : day.isToday
                        ? 'border-leaf-green bg-[#F5EEDB]/30'
                        : 'border-[#E0D7C6]/60 bg-white'
                    }`}
                  >
                    <div className="min-w-[90px] sm:min-w-[120px]">
                      <div className="font-heading font-bold text-sm text-dark-brown flex items-center gap-1.5">
                        <span>{dayLabel}</span>
                        {day.isToday && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-leaf-green text-white font-extrabold uppercase">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-dark-brown/60">
                        {day.date}
                      </span>
                    </div>

                    {/* Daily ETc */}
                    <div className="text-center px-1">
                      <div className="font-semibold text-xs sm:text-sm text-dark-brown">
                        {day.etc} mm
                      </div>
                      <span className="text-[10px] text-dark-brown/50 uppercase block">
                        ETc Need
                      </span>
                    </div>

                    {/* Daily Rain */}
                    <div className="text-center px-1">
                      <div
                        className={`font-semibold text-xs sm:text-sm ${
                          day.rain > 0 ? 'text-water-blue font-bold' : 'text-dark-brown/60'
                        }`}
                      >
                        {day.rain} mm
                      </div>
                      <span className="text-[10px] text-dark-brown/50 uppercase block">
                        Rain
                      </span>
                    </div>

                    {/* Cumulative Depletion */}
                    <div className="text-center px-1">
                      <div className="font-semibold text-xs sm:text-sm text-dark-brown">
                        {day.cumulativeDepletion} mm
                      </div>
                      <span className="text-[10px] text-dark-brown/50 uppercase block">
                        Depletion
                      </span>
                    </div>

                    {/* Status Chip */}
                    <div className="text-right min-w-[70px]">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full inline-block ${chipBg}`}
                      >
                        {chipLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* "Why This Advice" Section */}
          <Card className="space-y-3.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-leaf-green" />
              <h3 className="text-base sm:text-lg font-heading font-bold text-dark-brown">
                {t('adviceScreen.whyTitle') || 'Why This Advice?'}
              </h3>
            </div>

            <div className="space-y-2.5 text-sm text-dark-brown/85">
              {/* Factor 1: Crop & Stage */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF8E1]">
                <Layers className="w-4 h-4 text-leaf-green shrink-0 mt-0.5" />
                <div>
                  <strong>Crop Factor (Kc):</strong>{' '}
                  {currentField.crop === 'wheat' ? 'Wheat' : 'Cotton'} at{' '}
                  <span className="font-semibold capitalize">{growthStage}</span> growth stage
                  has a crop coefficient of <strong>Kc = {adviceResult.kc}</strong>.
                </div>
              </div>

              {/* Factor 2: Soil Type */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF8E1]">
                <Layers className="w-4 h-4 text-wheat-yellow shrink-0 mt-0.5" />
                <div>
                  <strong>Soil Water Capacity:</strong>{' '}
                  <span className="font-semibold capitalize">{soilType}</span> soil in{' '}
                  {currentField.taluka} can deplete up to{' '}
                  <strong>{adviceResult.allowedDepletion} mm</strong> before root moisture stress begins.
                </div>
              </div>

              {/* Factor 3: Weather & Evaporation */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF8E1]">
                <Thermometer className="w-4 h-4 text-water-blue shrink-0 mt-0.5" />
                <div>
                  <strong>Atmospheric Demand:</strong> Current Khairpur agro-weather exhibits an
                  evapotranspiration rate of ~
                  <strong>{weatherData?.today?.et0 || 5.2} mm/day</strong>.
                </div>
              </div>

              {/* Factor 4: Rainfall */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF8E1]">
                <CloudRain className="w-4 h-4 text-water-blue shrink-0 mt-0.5" />
                <div>
                  <strong>Rainfall Effect:</strong>{' '}
                  {weatherData?.threeDayRainSum > 0
                    ? `Forecast shows ${weatherData.threeDayRainSum} mm rain in the next 3 days, offsetting crop water extraction.`
                    : 'No significant rainfall (>= 5 mm) recorded to replenish soil.'}
                </div>
              </div>

              {/* Factor 5: Days Since Last Irrigation */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF8E1]">
                <Clock className="w-4 h-4 text-dark-brown/70 shrink-0 mt-0.5" />
                <div>
                  <strong>Irrigation History:</strong> Last watered{' '}
                  <strong>{adviceResult.daysSinceIrrigation} days ago</strong> (
                  {currentField.lastIrrigationDate || 'Initial season check'}). Current depletion stands at{' '}
                  <strong>{adviceResult.currentDepletion} mm</strong>.
                </div>
              </div>
            </div>
          </Card>

          {/* Expandable Calculation Steps for Judges */}
          <Card className="border border-[#E0D7C6]">
            <button
              type="button"
              onClick={() => setShowCalcSteps(!showCalcSteps)}
              className="w-full flex items-center justify-between text-left py-1 min-h-[48px] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-water-blue" />
                <div>
                  <h4 className="font-heading font-bold text-sm sm:text-base text-dark-brown">
                    {t('adviceScreen.calcTitle') || 'How We Calculate / Calculation Steps'}
                  </h4>
                  <p className="text-xs text-dark-brown/60">
                    Judge Verification • Simplified FAO-56 Methodology
                  </p>
                </div>
              </div>
              {showCalcSteps ? (
                <ChevronUp className="w-5 h-5 text-dark-brown/70" />
              ) : (
                <ChevronDown className="w-5 h-5 text-dark-brown/70" />
              )}
            </button>

            {showCalcSteps && (
              <div className="mt-4 pt-4 border-t border-[#E0D7C6] space-y-4 text-xs sm:text-sm">
                <p className="text-dark-brown/80 leading-relaxed bg-[#FFF8E1] p-3 rounded-xl border border-wheat-yellow/30">
                  {t('adviceScreen.faoExplanation') ||
                    'Uses the simplified FAO-56 Single Crop Coefficient approach: Crop Water Need (ETc) = ET0 × Kc. Effective rain (80% of rain >= 5 mm) offsets depletion. When cumulative depletion reaches the allowed limit, irrigation is recommended.'}
                </p>

                {/* Mathematical Formula Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-bold text-leaf-green block">1. Crop Water Need</span>
                    <code>ETc = ET0 × Kc</code>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-bold text-water-blue block">2. Effective Rain</span>
                    <code>P_eff = Rain × 80% (≥5mm)</code>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-bold text-dark-brown block">3. Field Volume</span>
                    <code>Litres = mm × Acres × 4047</code>
                  </div>
                </div>

                {/* Audit Steps Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E0D7C6] bg-[#F5EEDB]/60 text-dark-brown/80">
                        <th className="py-2 px-2 font-bold">Date</th>
                        <th className="py-2 px-1 font-bold">ET0</th>
                        <th className="py-2 px-1 font-bold">Kc</th>
                        <th className="py-2 px-1 font-bold">ETc</th>
                        <th className="py-2 px-1 font-bold">Rain</th>
                        <th className="py-2 px-1 font-bold">Eff. Rain</th>
                        <th className="py-2 px-1 font-bold">Net</th>
                        <th className="py-2 px-2 font-bold">Cumul. (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adviceResult.allSteps.map((step) => (
                        <tr
                          key={step.date}
                          className={`border-b border-[#E0D7C6]/30 ${
                            step.isPast
                              ? 'bg-gray-50/60 text-dark-brown/60'
                              : 'hover:bg-[#FFF8E1]/40'
                          }`}
                        >
                          <td className="py-2 px-2 whitespace-nowrap font-medium">
                            {step.date}{' '}
                            {step.isPast && (
                              <span className="text-[9px] px-1 rounded bg-gray-200">
                                Past
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-1">{step.et0}</td>
                          <td className="py-2 px-1">{step.kc}</td>
                          <td className="py-2 px-1 font-bold text-leaf-green">{step.etc}</td>
                          <td className="py-2 px-1">{step.rain}</td>
                          <td className="py-2 px-1 text-water-blue">{step.effectiveRain}</td>
                          <td className="py-2 px-1 font-semibold">{step.netDepletion}</td>
                          <td className="py-2 px-2 font-extrabold text-dark-brown">
                            {step.cumulativeDepletion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Visible Disclaimer Note */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs sm:text-sm text-dark-brown/80">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Disclaimer:</strong>{' '}
              {t('adviceScreen.disclaimer') ||
                'This is an estimate to help your decision, not a guarantee.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
