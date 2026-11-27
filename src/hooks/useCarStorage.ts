import { useCallback, useEffect, useState } from 'react';
import type {
  AppSettings,
  AppStoragePayload,
  CarFormInput,
  CarRecord,
  SortOption,
} from '../types/car';
import { DEFAULT_ANNUAL_MILEAGE_KM } from '../utils/scoring';
import { createCarId, normalizeImageList, validateCarCandidate } from '../utils/validation';

const STORAGE_KEY = 'carco_decision_board_v1';

const DEFAULT_SETTINGS: AppSettings = {
  annualMileageKm: DEFAULT_ANNUAL_MILEAGE_KM,
  sortBy: 'overall',
};

function loadInitialState(): AppStoragePayload {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: 1, cars: [], settings: DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<AppStoragePayload>;
    const validCars: CarRecord[] = [];
    if (Array.isArray(parsed.cars)) {
      for (const item of parsed.cars) {
        const result = validateCarCandidate(item);
        if (result.ok) {
          validCars.push(result.car);
        }
      }
    }
    const annualMileageKm =
      typeof parsed.settings?.annualMileageKm === 'number' &&
      Number.isFinite(parsed.settings.annualMileageKm) &&
      parsed.settings.annualMileageKm >= 1000
        ? Math.round(parsed.settings.annualMileageKm)
        : DEFAULT_ANNUAL_MILEAGE_KM;

    const validSorts: SortOption[] = [
      'overall',
      'price',
      'costPerKm',
      'reliability',
      'valueRetention',
    ];
    const sortBy = validSorts.includes(parsed.settings?.sortBy as SortOption)
      ? (parsed.settings!.sortBy as SortOption)
      : 'overall';

    return {
      version: 1,
      cars: validCars,
      settings: { annualMileageKm, sortBy },
    };
  } catch {
    return { version: 1, cars: [], settings: DEFAULT_SETTINGS };
  }
}

export function useCarStorage() {
  const [state, setState] = useState<AppStoragePayload>(loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [state]);

  const upsertCar = useCallback((input: CarFormInput): CarRecord => {
    const now = new Date().toISOString();
    const id = input.id ?? createCarId();
    const images = normalizeImageList(input.images);

    const record: CarRecord = {
      id,
      brandModel: input.brandModel.trim(),
      year: input.year.trim(),
      bodyStyle: input.bodyStyle,
      drivetrain: input.drivetrain,
      transmission: input.transmission,
      horsepower: Math.round(input.horsepower),
      images,
      estimatedPrice: Math.round(input.estimatedPrice),
      costPerKm: Math.round(input.costPerKm * 100) / 100,
      insurancePerYear: Math.round(input.insurancePerYear),
      taxPerYear: Math.round(input.taxPerYear),
      reliabilityIndex: Math.round(input.reliabilityIndex),
      valueRetentionIndex: Math.round(input.valueRetentionIndex),
      comfortIndex: Math.round(input.comfortIndex),
      practicalityIndex: Math.round(input.practicalityIndex),
      notes: input.notes.trim(),
      isFavorite: Boolean(input.isFavorite),
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => {
      const existing = prev.cars.find((c) => c.id === id);
      const nextRecord: CarRecord = existing
        ? {
            ...record,
            isFavorite: existing.isFavorite,
            createdAt: existing.createdAt,
          }
        : record;

      const nextCars = existing
        ? prev.cars.map((c) => (c.id === existing.id ? nextRecord : c))
        : [nextRecord, ...prev.cars];

      return { ...prev, cars: nextCars };
    });

    return record;
  }, []);

  const deleteCar = useCallback((carId: string) => {
    setState((prev) => ({
      ...prev,
      cars: prev.cars.filter((c) => c.id !== carId),
    }));
  }, []);

  const toggleFavorite = useCallback((carId: string) => {
    setState((prev) => ({
      ...prev,
      cars: prev.cars.map((c) =>
        c.id === carId
          ? { ...c, isFavorite: !c.isFavorite, updatedAt: new Date().toISOString() }
          : c,
      ),
    }));
  }, []);

  const importCars = useCallback((incoming: CarRecord[], mode: 'merge' | 'replace') => {
    setState((prev) => {
      if (mode === 'replace') {
        return { ...prev, cars: incoming };
      }
      const existingById = new Map(prev.cars.map((c) => [c.id, c]));
      const merged = [...prev.cars];
      for (const car of incoming) {
        if (existingById.has(car.id)) {
          const idx = merged.findIndex((c) => c.id === car.id);
          if (idx >= 0) merged[idx] = car;
        } else {
          merged.push(car);
        }
      }
      return { ...prev, cars: merged };
    });
  }, []);

  const restorePayload = useCallback(
    (payload: AppStoragePayload, mode: 'replace' | 'merge') => {
      setState((prev) => {
        if (mode === 'replace') {
          return {
            version: 1,
            cars: payload.cars,
            settings: payload.settings,
          };
        }
        const existingById = new Map(prev.cars.map((c) => [c.id, c]));
        const merged = [...prev.cars];
        for (const car of payload.cars) {
          if (existingById.has(car.id)) {
            const idx = merged.findIndex((c) => c.id === car.id);
            if (idx >= 0) merged[idx] = car;
          } else {
            merged.push(car);
          }
        }
        return {
          ...prev,
          cars: merged,
        };
      });
    },
    [],
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState({
      version: 1,
      cars: [],
      settings: DEFAULT_SETTINGS,
    });
  }, []);

  return {
    payload: state,
    cars: state.cars,
    settings: state.settings,
    upsertCar,
    deleteCar,
    toggleFavorite,
    importCars,
    restorePayload,
    updateSettings,
    resetAll,
  };
}
