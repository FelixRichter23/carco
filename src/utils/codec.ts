import type { AppStoragePayload, SortOption } from '../types/car';
import { DEFAULT_ANNUAL_MILEAGE_KM } from './scoring';
import { validateCarCandidate } from './validation';

const VALID_SORT_OPTIONS: SortOption[] = [
  'overall',
  'price',
  'costPerKm',
  'reliability',
  'valueRetention',
];

/**
 * Encodes an AppStoragePayload into a UTF-8 safe Base64 string.
 */
export function encodeStateToBase64(payload: AppStoragePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Decodes and validates a UTF-8 safe Base64 backup string into an AppStoragePayload.
 */
export function decodeStateFromBase64(
  input: string,
): { ok: true; payload: AppStoragePayload } | { ok: false; error: string } {
  const cleaned = input.trim().replace(/\s+/g, '');
  if (!cleaned) {
    return { ok: false, error: 'Please paste a Base64 backup string.' };
  }

  let json: string;
  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return {
      ok: false,
      error: 'Invalid Base64 string. Ensure the full backup string was copied without truncation.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      ok: false,
      error: 'Decoded Base64 does not contain valid JSON.',
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Backup payload must be a valid object.' };
  }

  const record = parsed as Record<string, unknown>;
  if (!Array.isArray(record.cars)) {
    return { ok: false, error: 'Backup payload is missing a valid "cars" array.' };
  }

  const cars = [];
  for (let i = 0; i < record.cars.length; i++) {
    const validated = validateCarCandidate(record.cars[i], `Backup car #${i + 1}`);
    if (!validated.ok) {
      return { ok: false, error: validated.errors[0] };
    }
    cars.push(validated.car);
  }

  const rawSettings =
    record.settings && typeof record.settings === 'object'
      ? (record.settings as Record<string, unknown>)
      : {};

  const annualMileageKm =
    typeof rawSettings.annualMileageKm === 'number' &&
    Number.isFinite(rawSettings.annualMileageKm) &&
    rawSettings.annualMileageKm >= 1000 &&
    rawSettings.annualMileageKm <= 100_000
      ? Math.round(rawSettings.annualMileageKm)
      : DEFAULT_ANNUAL_MILEAGE_KM;

  const sortBy = VALID_SORT_OPTIONS.includes(rawSettings.sortBy as SortOption)
    ? (rawSettings.sortBy as SortOption)
    : 'overall';

  return {
    ok: true,
    payload: {
      version: typeof record.version === 'number' ? record.version : 1,
      cars,
      settings: {
        annualMileageKm,
        sortBy,
      },
    },
  };
}
