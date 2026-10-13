/**
 * Weather Service for KhetiX
 * Provides agro-meteorological data for Khairpur, Sindh, Pakistan via Open-Meteo API.
 * Includes in-memory and localStorage offline caching.
 */

// Default coordinates for Khairpur Mirs, Sindh, Pakistan
export const KHAIRPUR_DEFAULT_COORDS = {
  latitude: 27.52,
  longitude: 68.76,
  name: 'Khairpur Mirs',
};

// In-memory cache for fast lookups during the app session
const memoryCache = new Map();

/**
 * Generate a consistent cache key from latitude and longitude
 */
function getCacheKey(lat, lon) {
  const roundedLat = Number(lat || KHAIRPUR_DEFAULT_COORDS.latitude).toFixed(2);
  const roundedLon = Number(lon || KHAIRPUR_DEFAULT_COORDS.longitude).toFixed(2);
  return `khetix_weather_${roundedLat}_${roundedLon}`;
}

/**
 * Retrieve cached weather data from memory or localStorage
 */
export function getCachedWeather(lat, lon) {
  const key = getCacheKey(lat, lon);

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  // 2. Check localStorage for persistent offline availability
  try {
    const serialized = localStorage.getItem(key);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      // Populate memory cache
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('Unable to read weather cache from localStorage:', err);
  }

  return null;
}

/**
 * Persist weather data to both memory and localStorage
 */
function setCachedWeather(lat, lon, data) {
  const key = getCacheKey(lat, lon);
  const payload = {
    ...data,
    cachedAt: new Date().toISOString(),
  };

  memoryCache.set(key, payload);

  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Unable to save weather cache to localStorage:', err);
  }
}

/**
 * Interpret WMO weather codes into UI condition types and icons
 */
export function getWeatherCondition(code, rainAmount = 0) {
  if (code === 0) return { type: 'clear', icon: 'sun', labelKey: 'weather.conditions.clear' };
  if ([1, 2].includes(code)) return { type: 'partlyCloudy', icon: 'cloud-sun', labelKey: 'weather.conditions.partlyCloudy' };
  if (code === 3 || [45, 48].includes(code)) return { type: 'cloudy', icon: 'cloud', labelKey: 'weather.conditions.cloudy' };
  if ([51, 53, 55, 56, 57].includes(code)) return { type: 'drizzle', icon: 'cloud-drizzle', labelKey: 'weather.conditions.drizzle' };
  if ([61, 63, 65, 80, 81, 82].includes(code) || rainAmount > 0.5) {
    return { type: 'rain', icon: 'cloud-rain', labelKey: 'weather.conditions.rain' };
  }
  if ([95, 96, 99].includes(code)) return { type: 'thunderstorm', icon: 'cloud-lightning', labelKey: 'weather.conditions.thunderstorm' };

  return { type: 'clear', icon: 'sun', labelKey: 'weather.conditions.clear' };
}

/**
 * Transform Open-Meteo API daily payload into UI-friendly structure
 */
function transformWeatherData(data) {
  const daily = data.daily || {};
  const times = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const rains = daily.precipitation_sum || [];
  const et0s = daily.et0_fao_evapotranspiration || [];
  const codes = daily.weather_code || [];

  // Determine today's index in the returned timeline
  const todayStr = new Date().toISOString().split('T')[0];
  let todayIndex = times.indexOf(todayStr);

  // If todayStr is not matched directly (e.g. past_days=7), index 7 is typically today
  if (todayIndex === -1) {
    todayIndex = Math.min(7, times.length - 1);
  }

  // Today's weather data
  const today = {
    date: times[todayIndex] || todayStr,
    maxTemp: Math.round(maxTemps[todayIndex] ?? 35),
    minTemp: Math.round(minTemps[todayIndex] ?? 24),
    rain: Number((rains[todayIndex] ?? 0).toFixed(1)),
    et0: Number((et0s[todayIndex] ?? 5.0).toFixed(1)),
    weatherCode: codes[todayIndex] ?? 0,
    condition: getWeatherCondition(codes[todayIndex] ?? 0, rains[todayIndex] ?? 0),
  };

  // Next 7 days forecast starting from today (index todayIndex to todayIndex + 6)
  const forecast7Days = [];
  const totalDays = Math.min(times.length, todayIndex + 7);

  for (let i = todayIndex; i < totalDays; i++) {
    const isToday = i === todayIndex;
    const rainVal = Number((rains[i] ?? 0).toFixed(1));
    const codeVal = codes[i] ?? 0;

    forecast7Days.push({
      date: times[i],
      maxTemp: Math.round(maxTemps[i] ?? 35),
      minTemp: Math.round(minTemps[i] ?? 24),
      rain: rainVal,
      et0: Number((et0s[i] ?? 5.0).toFixed(1)),
      weatherCode: codeVal,
      condition: getWeatherCondition(codeVal, rainVal),
      isToday,
      dayOffset: i - todayIndex,
    });
  }

  // Check 3-day precipitation sum (Today + 2 subsequent days)
  let threeDayRainSum = 0;
  for (let i = todayIndex; i < Math.min(times.length, todayIndex + 3); i++) {
    threeDayRainSum += rains[i] || 0;
  }
  threeDayRainSum = Number(threeDayRainSum.toFixed(1));
  const hasRainWarning = threeDayRainSum > 5;

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    today,
    forecast7Days,
    threeDayRainSum,
    hasRainWarning,
    daily,
  };
}

/**
 * Fetch weather forecast for coordinates from Open-Meteo
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Processed weather data with today & 7-day forecast
 */
export async function fetchWeather(
  latitude = KHAIRPUR_DEFAULT_COORDS.latitude,
  longitude = KHAIRPUR_DEFAULT_COORDS.longitude
) {
  const lat = Number(latitude) || KHAIRPUR_DEFAULT_COORDS.latitude;
  const lon = Number(longitude) || KHAIRPUR_DEFAULT_COORDS.longitude;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weather_code'
  );
  url.searchParams.set('past_days', '7');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'auto');

  try {
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }

    const json = await res.json();
    const transformed = transformWeatherData(json);

    // Save to cache
    setCachedWeather(lat, lon, transformed);

    return {
      ...transformed,
      isOffline: false,
    };
  } catch (error) {
    // Attempt fallback from localStorage/memory cache
    const cached = getCachedWeather(lat, lon);
    if (cached) {
      console.warn('Network request failed. Using cached weather data:', error);
      return {
        ...cached,
        isOffline: true,
      };
    }
    // No cache available, propagate error for UI error state
    throw error;
  }
}
