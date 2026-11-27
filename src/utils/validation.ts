import {
  BODY_STYLES,
  DRIVETRAINS,
  TRANSMISSIONS,
  type BodyStyle,
  type CarRecord,
  type Drivetrain,
  type Transmission,
} from '../types/car';

export interface ValidationResult<T> {
  ok: boolean;
  data: T;
  errors: string[];
}

const BODY_STYLE_MAP: Record<string, BodyStyle> = {
  sedan: 'Sedan',
  saloon: 'Sedan',
  limousine: 'Sedan',
  wagon: 'Wagon',
  estate: 'Wagon',
  touring: 'Wagon',
  kombi: 'Wagon',
  suv: 'SUV',
  crossover: 'SUV',
  hatchback: 'Hatchback',
  compact: 'Hatchback',
  kompakt: 'Hatchback',
  coupe: 'Coupe',
  coupé: 'Coupe',
};

const DRIVETRAIN_MAP: Record<string, Drivetrain> = {
  petrol: 'Petrol',
  gasoline: 'Petrol',
  benzin: 'Petrol',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  phev: 'Hybrid',
  'plug-in hybrid': 'Hybrid',
  electric: 'Electric',
  ev: 'Electric',
  bev: 'Electric',
  elektro: 'Electric',
};

const TRANSMISSION_MAP: Record<string, Transmission> = {
  automatic: 'Automatic',
  auto: 'Automatic',
  automatik: 'Automatic',
  dsg: 'Automatic',
  cvt: 'Automatic',
  manual: 'Manual',
  manuell: 'Manual',
  stick: 'Manual',
};

export function createCarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `car-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeImageList(rawImages: unknown, legacyImageUrl?: unknown): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const pushUrl = (value: unknown) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  };

  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      pushUrl(item);
    }
  }

  if (typeof legacyImageUrl === 'string') {
    pushUrl(legacyImageUrl);
  }

  return result;
}

function parseFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function validateCarCandidate(
  raw: unknown,
  labelPrefix = 'Car',
): { ok: true; car: CarRecord } | { ok: false; errors: string[] } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: [`${labelPrefix}: must be a JSON object.`] };
  }

  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  const brandModel =
    typeof obj.brandModel === 'string' ? obj.brandModel.trim() : '';
  if (!brandModel) {
    errors.push(`${labelPrefix}: "brandModel" is required and must be a non-empty string.`);
  }

  const year =
    typeof obj.year === 'string'
      ? obj.year.trim()
      : typeof obj.year === 'number' && Number.isFinite(obj.year)
        ? String(obj.year)
        : '';
  if (!year) {
    errors.push(`${labelPrefix}: "year" is required (e.g. "2021" or "2020–2023 (Mk8)").`);
  }

  const rawBodyStyle = typeof obj.bodyStyle === 'string' ? obj.bodyStyle.trim().toLowerCase() : '';
  const bodyStyle = BODY_STYLE_MAP[rawBodyStyle];
  if (!bodyStyle) {
    errors.push(
      `${labelPrefix}: "bodyStyle" must be one of ${BODY_STYLES.join(', ')}.`,
    );
  }

  const rawDrivetrain =
    typeof obj.drivetrain === 'string' ? obj.drivetrain.trim().toLowerCase() : '';
  const drivetrain = DRIVETRAIN_MAP[rawDrivetrain];
  if (!drivetrain) {
    errors.push(
      `${labelPrefix}: "drivetrain" must be one of ${DRIVETRAINS.join(', ')}.`,
    );
  }

  const rawTransmission =
    typeof obj.transmission === 'string' ? obj.transmission.trim().toLowerCase() : '';
  const transmission = TRANSMISSION_MAP[rawTransmission];
  if (!transmission) {
    errors.push(
      `${labelPrefix}: "transmission" must be one of ${TRANSMISSIONS.join(', ')}.`,
    );
  }

  const horsepower = parseFiniteNumber(obj.horsepower);
  if (horsepower === null || horsepower < 1 || horsepower > 2500) {
    errors.push(`${labelPrefix}: "horsepower" must be a number between 1 and 2500.`);
  }

  const estimatedPrice = parseFiniteNumber(obj.estimatedPrice);
  if (estimatedPrice === null || estimatedPrice < 0 || estimatedPrice > 5_000_000) {
    errors.push(`${labelPrefix}: "estimatedPrice" must be a non-negative EUR amount.`);
  }

  const costPerKm = parseFiniteNumber(obj.costPerKm);
  if (costPerKm === null || costPerKm < 0 || costPerKm > 20) {
    errors.push(`${labelPrefix}: "costPerKm" must be a number between 0 and 20 (EUR/km).`);
  }

  const insurancePerYear = parseFiniteNumber(obj.insurancePerYear);
  if (insurancePerYear === null || insurancePerYear < 0 || insurancePerYear > 50_000) {
    errors.push(`${labelPrefix}: "insurancePerYear" must be a non-negative EUR amount.`);
  }

  const taxPerYear = parseFiniteNumber(obj.taxPerYear);
  if (taxPerYear === null || taxPerYear < 0 || taxPerYear > 10_000) {
    errors.push(`${labelPrefix}: "taxPerYear" must be a non-negative EUR amount.`);
  }

  const checkIndex = (key: string): number | null => {
    const val = parseFiniteNumber(obj[key]);
    if (val === null || val < 0 || val > 100) {
      errors.push(`${labelPrefix}: "${key}" must be a number between 0 and 100.`);
      return null;
    }
    return Math.round(val);
  };

  const reliabilityIndex = checkIndex('reliabilityIndex');
  const valueRetentionIndex = checkIndex('valueRetentionIndex');
  const comfortIndex = checkIndex('comfortIndex');
  const practicalityIndex = checkIndex('practicalityIndex');

  if (obj.images !== undefined && !Array.isArray(obj.images)) {
    errors.push(`${labelPrefix}: "images" must be an array of URL strings when provided.`);
  }

  const images = normalizeImageList(obj.images, obj.imageUrl);
  const notes = typeof obj.notes === 'string' ? obj.notes.trim() : '';

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const now = new Date().toISOString();
  const id =
    typeof obj.id === 'string' && obj.id.trim().length > 0
      ? obj.id.trim()
      : createCarId();

  return {
    ok: true,
    car: {
      id,
      brandModel,
      year,
      bodyStyle: bodyStyle!,
      drivetrain: drivetrain!,
      transmission: transmission!,
      horsepower: Math.round(horsepower!),
      images,
      estimatedPrice: Math.round(estimatedPrice!),
      costPerKm: Math.round(costPerKm! * 100) / 100,
      insurancePerYear: Math.round(insurancePerYear!),
      taxPerYear: Math.round(taxPerYear!),
      reliabilityIndex: reliabilityIndex!,
      valueRetentionIndex: valueRetentionIndex!,
      comfortIndex: comfortIndex!,
      practicalityIndex: practicalityIndex!,
      notes,
      isFavorite: Boolean(obj.isFavorite),
      createdAt: typeof obj.createdAt === 'string' && obj.createdAt ? obj.createdAt : now,
      updatedAt: typeof obj.updatedAt === 'string' && obj.updatedAt ? obj.updatedAt : now,
    },
  };
}

/**
 * Parses and validates JSON input representing either a single car object
 * or an array of car objects (or an object containing a `cars` array).
 */
export function parseCarsJson(rawJson: string): ValidationResult<CarRecord[]> {
  const trimmed = rawJson.trim();
  if (!trimmed) {
    return { ok: false, data: [], errors: ['Please paste JSON data before importing.'] };
  }

  // Strip optional markdown code fences if a user pasted directly from an AI response
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON syntax.';
    return { ok: false, data: [], errors: [`JSON syntax error: ${message}`] };
  }

  let candidates: unknown[];
  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as Record<string, unknown>).cars)
  ) {
    candidates = (parsed as { cars: unknown[] }).cars;
  } else if (parsed && typeof parsed === 'object') {
    candidates = [parsed];
  } else {
    return {
      ok: false,
      data: [],
      errors: ['JSON root must be a car object or an array of car objects.'],
    };
  }

  if (candidates.length === 0) {
    return { ok: false, data: [], errors: ['JSON array does not contain any car records.'] };
  }

  const validCars: CarRecord[] = [];
  const allErrors: string[] = [];

  candidates.forEach((candidate, idx) => {
    const label = candidates.length > 1 ? `Item #${idx + 1}` : 'Car';
    const result = validateCarCandidate(candidate, label);
    if (result.ok) {
      validCars.push(result.car);
    } else {
      allErrors.push(...result.errors);
    }
  });

  if (allErrors.length > 0) {
    return { ok: false, data: [], errors: allErrors };
  }

  return { ok: true, data: validCars, errors: [] };
}
