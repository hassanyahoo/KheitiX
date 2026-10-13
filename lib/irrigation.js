/**
 * FAO-56 Irrigation Recommendation Engine for KhetiX
 * Calculates daily crop evapotranspiration (ETc), soil water depletion,
 * and irrigation timing based on local weather from Open-Meteo.
 */

// Crop coefficients (Kc) by growth stage (FAO-56 guidelines adapted for Sindh, Pakistan)
export const CROP_KC_VALUES = {
  wheat: {
    initial: 0.3,
    development: 0.7,
    'mid-season': 1.15,
    'late-season': 0.25,
  },
  cotton: {
    initial: 0.35,
    development: 0.75,
    'mid-season': 1.15,
    'late-season': 0.7,
  },
};

// Readily available water / Allowed depletion limits (mm) before root stress occurs
export const ALLOWED_DEPLETION_LIMITS = {
  sandy: 25, // Lower water retention capacity
  loam: 40,  // Medium silt/loam found across Kot Diji & Gambat
  clay: 50,  // Heavy clay with high retention found near Indus canals
};

/**
 * Calculate effective rainfall according to FAO-56 USDA soil conservation method:
 * - If rainfall < 5 mm, surface evaporation absorbs it -> 0 mm effective
 * - If rainfall >= 5 mm -> 80% is effectively stored in the root zone
 */
export function calculateEffectiveRain(rainMm) {
  const rain = Number(rainMm) || 0;
  return rain >= 5 ? Number((rain * 0.8).toFixed(1)) : 0;
}

/**
 * Convert irrigation depth (mm) over an area (acres) to total litres.
 * 1 mm of water over 1 acre = 4,047 Litres.
 */
export function calculateVolumeLitres(depthMm, areaAcres) {
  const depth = Number(depthMm) || 0;
  const acres = Number(areaAcres) || 1;
  return Math.round(depth * acres * 4047);
}

/**
 * Retrieve the crop Kc value for a crop and growth stage
 */
export function getCropKc(crop = 'wheat', stage = 'mid-season') {
  const cropKey = (crop || 'wheat').toLowerCase();
  const stageKey = (stage || 'mid-season').toLowerCase();
  const cropTable = CROP_KC_VALUES[cropKey] || CROP_KC_VALUES.wheat;
  return cropTable[stageKey] ?? cropTable['mid-season'] ?? 1.0;
}

/**
 * Core Irrigation Schedule Calculation
 * Evaluates past depletion since last_irrigation_date and projects 7 days forward.
 */
export function calculateIrrigationSchedule({
  rawWeatherResponse,
  field,
  customStage,
  customSoil,
}) {
  const crop = (field?.crop || 'wheat').toLowerCase();
  const stage = customStage || field?.growthStage || 'mid-season';
  const soilType = customSoil || field?.soilType || 'loam';
  const areaAcres = Number(field?.areaAcres) || 5;
  const lastIrrigationDate = field?.lastIrrigationDate || '';

  const kc = getCropKc(crop, stage);
  const allowedDepletion = ALLOWED_DEPLETION_LIMITS[soilType] || 40;

  // Extract daily timelines from raw Open-Meteo response or transformed weather data
  const daily = rawWeatherResponse?.daily || (rawWeatherResponse?.time ? rawWeatherResponse : {});
  const times = daily.time || [];
  const et0List = daily.et0_fao_evapotranspiration || [];
  const rainList = daily.precipitation_sum || [];

  const todayStr = new Date().toISOString().split('T')[0];
  let todayIndex = times.indexOf(todayStr);
  if (todayIndex === -1) {
    todayIndex = Math.min(7, times.length - 1);
  }

  // 1. Calculate Past Depletion accumulated since lastIrrigationDate
  let accumulatedPastDepletion = 0;
  const pastCalculationSteps = [];

  // Determine how many days ago last irrigation occurred
  let daysSinceIrrigation = 0;
  if (lastIrrigationDate) {
    const lastDateMs = new Date(lastIrrigationDate).getTime();
    const todayMs = new Date(todayStr).getTime();
    daysSinceIrrigation = Math.max(0, Math.round((todayMs - lastDateMs) / 86400000));
  }

  // Evaluate past days present in the API response (indices 0 to todayIndex - 1)
  for (let i = 0; i < todayIndex; i++) {
    const dayDate = times[i];
    // Only accumulate for days after the last irrigation date
    if (!lastIrrigationDate || dayDate > lastIrrigationDate) {
      const et0 = et0List[i] ?? 5.0;
      const rain = rainList[i] ?? 0;
      const etc = Number((et0 * kc).toFixed(1));
      const effRain = calculateEffectiveRain(rain);
      const net = Number((etc - effRain).toFixed(1));

      accumulatedPastDepletion = Math.max(0, Number((accumulatedPastDepletion + net).toFixed(1)));

      pastCalculationSteps.push({
        date: dayDate,
        isPast: true,
        et0,
        kc,
        etc,
        rain,
        effectiveRain: effRain,
        netDepletion: net,
        cumulativeDepletion: accumulatedPastDepletion,
      });
    }
  }

  // If last irrigation was further back than the 7 API past days, estimate remaining days
  if (daysSinceIrrigation > 7) {
    const extraDays = daysSinceIrrigation - 7;
    const avgEt0 = et0List[todayIndex] || 5.0;
    const avgDailyEtc = avgEt0 * kc;
    accumulatedPastDepletion += extraDays * avgDailyEtc;
    accumulatedPastDepletion = Number(accumulatedPastDepletion.toFixed(1));
  }

  // Cap initial depletion at allowedDepletion + 15 to remain physically realistic
  let runningDepletion = Math.min(accumulatedPastDepletion, allowedDepletion + 15);
  const currentDepletion = runningDepletion;

  // Current soil moisture percentage (0% to 100%)
  const currentMoisturePct = Math.max(
    0,
    Math.min(100, Math.round((1 - currentDepletion / allowedDepletion) * 100))
  );

  // 2. Project forward across the 7-day forecast (Today to Day 6)
  const scheduleDays = [];
  const forecastSteps = [];
  let recommendedDay = null;
  let recommendedIndex = -1;
  let rainEventDisplaced = false;
  let rainPostponeReason = '';

  const totalForecastDays = Math.min(times.length, todayIndex + 7);

  for (let i = todayIndex; i < totalForecastDays; i++) {
    const dayOffset = i - todayIndex;
    const dayDate = times[i];
    const et0 = et0List[i] ?? 5.0;
    const rain = rainList[i] ?? 0;
    const etc = Number((et0 * kc).toFixed(1));
    const effRain = calculateEffectiveRain(rain);
    const net = Number((etc - effRain).toFixed(1));

    // Update cumulative depletion
    runningDepletion = Math.max(0, Number((runningDepletion + net).toFixed(1)));

    // Status chip logic
    let status = 'fine'; // green
    if (runningDepletion >= allowedDepletion) {
      status = 'irrigate'; // red
    } else if (runningDepletion >= allowedDepletion * 0.7) {
      status = 'soon'; // yellow
    }

    const moisturePct = Math.max(
      0,
      Math.min(100, Math.round((1 - runningDepletion / allowedDepletion) * 100))
    );

    const dayObj = {
      date: dayDate,
      dayOffset,
      isToday: dayOffset === 0,
      et0,
      kc,
      etc,
      rain,
      effectiveRain: effRain,
      netDepletion: net,
      cumulativeDepletion: runningDepletion,
      moisturePct,
      status,
    };

    scheduleDays.push(dayObj);
    forecastSteps.push(dayObj);

    // Detect first day reaching allowed depletion limit
    if (recommendedDay === null && runningDepletion >= allowedDepletion) {
      recommendedDay = { ...dayObj };
      recommendedIndex = dayOffset;
    }
  }

  // 3. Rain Postponement Rule:
  // "If rain > 5mm is forecast on or just before the recommended irrigation day, push recommendation back"
  if (recommendedDay !== null && recommendedIndex >= 0) {
    // Check if rain > 5mm is forecast on the recommended day or 1 day prior
    const checkDays = [
      scheduleDays[Math.max(0, recommendedIndex - 1)],
      scheduleDays[recommendedIndex],
      scheduleDays[Math.min(scheduleDays.length - 1, recommendedIndex + 1)],
    ];

    const significantRainDay = checkDays.find((d) => d && d.rain >= 5);

    if (significantRainDay) {
      rainEventDisplaced = true;
      rainPostponeReason = `Rain forecast (${significantRainDay.rain} mm) on ${significantRainDay.date}. Natural rainfall will recharge the soil.`;

      // Find the next day after the rain event where depletion re-exceeds limit
      const postRainDay = scheduleDays.slice(recommendedIndex + 1).find(
        (d) => d.cumulativeDepletion >= allowedDepletion
      );

      if (postRainDay) {
        recommendedDay = { ...postRainDay };
      } else {
        // If rain keeps soil moist for the rest of the 7-day period
        recommendedDay = null;
      }
    }
  }

  // Calculate recommended irrigation volume if irrigation is needed
  let amountMm = 0;
  let totalLitres = 0;

  if (recommendedDay) {
    amountMm = Math.round(recommendedDay.cumulativeDepletion);
    totalLitres = calculateVolumeLitres(amountMm, areaAcres);
  }

  return {
    field,
    crop,
    stage,
    soilType,
    areaAcres,
    kc,
    allowedDepletion,
    currentDepletion,
    currentMoisturePct,
    daysSinceIrrigation,
    recommendedDay,
    amountMm,
    totalLitres,
    isRainPostponed: rainEventDisplaced,
    rainPostponeReason,
    scheduleDays,
    allSteps: [...pastCalculationSteps, ...forecastSteps],
  };
}
