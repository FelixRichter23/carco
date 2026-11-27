import type { CarRatings, CarRecord, CarWithRatings, SortOption } from '../types/car';

export const DEFAULT_ANNUAL_MILEAGE_KM = 15_000;

export const SCORING_WEIGHTS = {
  reliability: 0.3,
  valueForMoney: 0.25,
  runningCosts: 0.25,
  valueRetention: 0.2,
} as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const roundOneDecimal = (value: number): number => Math.round(value * 10) / 10;

/**
 * Converts a normalized 0–100 index into a 1.0–5.0 star rating.
 */
export function indexToStars(index: number): number {
  const normalized = clamp(index, 0, 100);
  return roundOneDecimal(1 + (normalized / 100) * 4);
}

/**
 * Calculates estimated total annual operating cost in EUR at a given mileage.
 */
export function calculateAnnualCost(
  car: Pick<CarRecord, 'costPerKm' | 'insurancePerYear' | 'taxPerYear'>,
  annualMileageKm: number = DEFAULT_ANNUAL_MILEAGE_KM,
): number {
  const mileage = Math.max(0, annualMileageKm);
  return Math.round(car.costPerKm * mileage + car.insurancePerYear + car.taxPerYear);
}

/**
 * Computes fact-based 1.0–5.0 star ratings for the German used-car market.
 *
 * - Reliability: 0–100 index (TÜV / ADAC reference) -> 1.0–5.0 stars
 * - Value Retention: 0–100 index -> 1.0–5.0 stars
 * - Running Costs: Total annual cost at 15,000 km/yr benchmarked against
 *   EUR 3,000/yr (5.0★) to EUR 11,500/yr (1.0★)
 * - Value for Money: 60% quality composite (35% reliability, 25% comfort,
 *   25% practicality, 15% value retention) + 40% price affordability
 *   benchmarked against EUR 8,000 (100) to EUR 55,000 (0)
 * - Overall: Weighted average (30% Reliability, 25% Value for Money,
 *   25% Running Costs, 20% Value Retention)
 */
export function calculateCarRatings(
  car: Pick<
    CarRecord,
    | 'estimatedPrice'
    | 'costPerKm'
    | 'insurancePerYear'
    | 'taxPerYear'
    | 'reliabilityIndex'
    | 'valueRetentionIndex'
    | 'comfortIndex'
    | 'practicalityIndex'
  >,
): CarRatings {
  const reliability = indexToStars(car.reliabilityIndex);
  const valueRetention = indexToStars(car.valueRetentionIndex);

  const annualCostAt15k = calculateAnnualCost(car, DEFAULT_ANNUAL_MILEAGE_KM);
  const runningCostIndex = clamp(
    100 - ((annualCostAt15k - 3000) / (11500 - 3000)) * 100,
    0,
    100,
  );
  const runningCosts = indexToStars(runningCostIndex);

  const qualityComposite =
    clamp(car.reliabilityIndex, 0, 100) * 0.35 +
    clamp(car.comfortIndex, 0, 100) * 0.25 +
    clamp(car.practicalityIndex, 0, 100) * 0.25 +
    clamp(car.valueRetentionIndex, 0, 100) * 0.15;

  const priceAffordabilityIndex = clamp(
    100 - ((car.estimatedPrice - 8000) / (55000 - 8000)) * 100,
    0,
    100,
  );

  const valueForMoneyIndex = qualityComposite * 0.6 + priceAffordabilityIndex * 0.4;
  const valueForMoney = indexToStars(valueForMoneyIndex);

  const overall = roundOneDecimal(
    reliability * SCORING_WEIGHTS.reliability +
      valueForMoney * SCORING_WEIGHTS.valueForMoney +
      runningCosts * SCORING_WEIGHTS.runningCosts +
      valueRetention * SCORING_WEIGHTS.valueRetention,
  );

  return {
    valueForMoney,
    reliability,
    valueRetention,
    runningCosts,
    overall: clamp(overall, 1, 5),
    annualCostAt15k,
  };
}

export function attachRatings(car: CarRecord): CarWithRatings {
  return {
    ...car,
    ratings: calculateCarRatings(car),
  };
}

export function sortCars(cars: CarWithRatings[], sortBy: SortOption): CarWithRatings[] {
  const copy = [...cars];
  copy.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.estimatedPrice - b.estimatedPrice || b.ratings.overall - a.ratings.overall;
      case 'costPerKm':
        return a.costPerKm - b.costPerKm || b.ratings.overall - a.ratings.overall;
      case 'reliability':
        return (
          b.reliabilityIndex - a.reliabilityIndex || b.ratings.overall - a.ratings.overall
        );
      case 'valueRetention':
        return (
          b.valueRetentionIndex - a.valueRetentionIndex || b.ratings.overall - a.ratings.overall
        );
      case 'overall':
      default:
        return (
          b.ratings.overall - a.ratings.overall ||
          a.estimatedPrice - b.estimatedPrice ||
          a.brandModel.localeCompare(b.brandModel)
        );
    }
  });
  return copy;
}
