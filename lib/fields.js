/**
 * Field profiles for Khairpur Mirs, Sindh, Pakistan.
 * Includes crop type, soil characteristics, taluka, area in acres,
 * and last irrigation tracking for FAO-56 irrigation scheduling.
 */

// Helper to get a date string N days in the past
function getPastDate(daysAgo = 4) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_FIELDS = [
  {
    id: 'f-kot-diji',
    name: 'North Plot - Kot Diji',
    crop: 'wheat',
    growthStage: 'mid-season',
    soilType: 'loam',
    lat: 27.34,
    lon: 68.71,
    areaAcres: 5,
    taluka: 'Kot Diji',
    lastIrrigationDate: getPastDate(5),
  },
  {
    id: 'f-gambat',
    name: 'Canal Side Plot - Gambat',
    crop: 'cotton',
    growthStage: 'mid-season',
    soilType: 'clay',
    lat: 27.35,
    lon: 68.52,
    areaAcres: 8,
    taluka: 'Gambat',
    lastIrrigationDate: getPastDate(6),
  },
  {
    id: 'f-khairpur-main',
    name: 'Main Farm - Khairpur Mirs',
    crop: 'wheat',
    growthStage: 'development',
    soilType: 'loam',
    lat: 27.52,
    lon: 68.76,
    areaAcres: 10,
    taluka: 'Khairpur Mirs',
    lastIrrigationDate: getPastDate(3),
  },
  {
    id: 'f-kingri',
    name: 'East Plot - Kingri',
    crop: 'cotton',
    growthStage: 'initial',
    soilType: 'sandy',
    lat: 27.60,
    lon: 68.68,
    areaAcres: 6,
    taluka: 'Kingri',
    lastIrrigationDate: getPastDate(2),
  },
];

const FIELDS_STORAGE_KEY = 'khetix_registered_fields';

/**
 * Get all registered fields from localStorage or fallback to default Khairpur fields
 */
export function getStoredFields() {
  try {
    const raw = localStorage.getItem(FIELDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading fields from localStorage:', err);
  }
  return DEFAULT_FIELDS;
}

/**
 * Save new field or update existing fields list in localStorage
 */
export function saveField(newField) {
  const fields = getStoredFields();
  const updated = [newField, ...fields];
  try {
    localStorage.setItem(FIELDS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed writing field to localStorage:', err);
  }
  return updated;
}

/**
 * Update a field's last irrigation date
 */
export function updateFieldLastIrrigation(fieldId, dateString) {
  const fields = getStoredFields();
  const updated = fields.map((f) =>
    f.id === fieldId ? { ...f, lastIrrigationDate: dateString } : f
  );
  try {
    localStorage.setItem(FIELDS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed updating irrigation date in localStorage:', err);
  }
  return updated;
}

/**
 * Update field attributes (e.g. soil type, growth stage)
 */
export function updateFieldAttributes(fieldId, attributes) {
  const fields = getStoredFields();
  const updated = fields.map((f) =>
    f.id === fieldId ? { ...f, ...attributes } : f
  );
  try {
    localStorage.setItem(FIELDS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed updating field attributes in localStorage:', err);
  }
  return updated;
}
