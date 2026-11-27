import { describe, expect, it } from 'vitest';
import { calculateAnnualCost, calculateCarRatings, sortCars, attachRatings } from '../scoring';
import { encodeStateToBase64, decodeStateFromBase64 } from '../codec';
import { parseCarsJson, normalizeImageList } from '../validation';
import type { CarRecord } from '../../types/car';

const sampleCar = (overrides: Partial<CarRecord> = {}): CarRecord => ({
  id: 'car-1',
  brandModel: 'Toyota Corolla Touring Sports 2.0 Hybrid',
  year: '2021 (E210)',
  bodyStyle: 'Wagon',
  drivetrain: 'Hybrid',
  transmission: 'Automatic',
  horsepower: 184,
  images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
  estimatedPrice: 21500,
  costPerKm: 0.34,
  insurancePerYear: 680,
  taxPerYear: 54,
  reliabilityIndex: 89,
  valueRetentionIndex: 82,
  comfortIndex: 76,
  practicalityIndex: 88,
  notes: 'Check 12V battery health & hybrid service check.',
  isFavorite: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('scoring', () => {
  it('computes bounded 1.0–5.0 star ratings and annual cost', () => {
    const car = sampleCar();
    const ratings = calculateCarRatings(car);
    expect(ratings.annualCostAt15k).toBe(Math.round(0.34 * 15000 + 680 + 54));
    expect(ratings.reliability).toBeGreaterThanOrEqual(4.4);
    expect(ratings.valueRetention).toBeGreaterThanOrEqual(4.2);
    expect(ratings.runningCosts).toBeGreaterThan(3);
    expect(ratings.overall).toBeGreaterThanOrEqual(1);
    expect(ratings.overall).toBeLessThanOrEqual(5);
  });

  it('sorts cars accurately by overall, price, and reliability', () => {
    const cheapReliable = attachRatings(
      sampleCar({ id: 'a', estimatedPrice: 14000, reliabilityIndex: 92 }),
    );
    const priceyUnreliable = attachRatings(
      sampleCar({ id: 'b', estimatedPrice: 44000, reliabilityIndex: 45, costPerKm: 0.62 }),
    );

    expect(sortCars([priceyUnreliable, cheapReliable], 'overall')[0].id).toBe('a');
    expect(sortCars([priceyUnreliable, cheapReliable], 'price')[0].id).toBe('a');
    expect(sortCars([priceyUnreliable, cheapReliable], 'reliability')[0].id).toBe('a');
  });

  it('calculates custom mileage annual cost', () => {
    const car = sampleCar({ costPerKm: 0.4, insurancePerYear: 700, taxPerYear: 100 });
    expect(calculateAnnualCost(car, 20000)).toBe(8800);
  });
});

describe('validation', () => {
  it('supports single object, array, and legacy imageUrl backward compatibility', () => {
    const legacyJson = JSON.stringify({
      brandModel: 'Mazda 3 Skyactiv-G',
      year: '2020 (BP)',
      bodyStyle: 'Hatchback',
      drivetrain: 'Petrol',
      transmission: 'Manual',
      horsepower: 150,
      imageUrl: 'https://example.com/mazda.jpg',
      estimatedPrice: 18500,
      costPerKm: 0.37,
      insurancePerYear: 620,
      taxPerYear: 112,
      reliabilityIndex: 86,
      valueRetentionIndex: 78,
      comfortIndex: 82,
      practicalityIndex: 70,
      notes: 'Inspect paint chips on hood.',
    });

    const parsed = parseCarsJson(legacyJson);
    expect(parsed.ok).toBe(true);
    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0].images).toEqual(['https://example.com/mazda.jpg']);
  });

  it('deduplicates images and reports clear schema errors on invalid input', () => {
    expect(normalizeImageList([' https://a.jpg ', 'https://a.jpg'], 'https://b.jpg')).toEqual([
      'https://a.jpg',
      'https://b.jpg',
    ]);

    const invalid = parseCarsJson(JSON.stringify({ brandModel: '', horsepower: -5 }));
    expect(invalid.ok).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(2);
  });
});

describe('codec', () => {
  it('round-trips UTF-8 strings including umlauts and EUR symbols safely', () => {
    const payload = {
      version: 1,
      cars: [
        sampleCar({
          brandModel: 'Škoda Octavia Combi 2.0 TDI',
          notes: 'Check TÜV brake discs, €450 service, München dealer history 🚗',
        }),
      ],
      settings: { annualMileageKm: 18000, sortBy: 'price' as const },
    };

    const encoded = encodeStateToBase64(payload);
    const decoded = decodeStateFromBase64(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.payload.cars[0].brandModel).toBe('Škoda Octavia Combi 2.0 TDI');
      expect(decoded.payload.cars[0].notes).toContain('TÜV');
      expect(decoded.payload.settings.annualMileageKm).toBe(18000);
      expect(decoded.payload.settings.sortBy).toBe('price');
    }
  });
});
