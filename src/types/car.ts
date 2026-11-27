export const BODY_STYLES = ['Sedan', 'Wagon', 'SUV', 'Hatchback', 'Coupe'] as const;
export type BodyStyle = (typeof BODY_STYLES)[number];

export const DRIVETRAINS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
export type Drivetrain = (typeof DRIVETRAINS)[number];

export const TRANSMISSIONS = ['Automatic', 'Manual'] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export interface CarRecord {
  id: string;
  brandModel: string;
  year: string;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  transmission: Transmission;
  horsepower: number;
  images: string[];
  estimatedPrice: number;
  costPerKm: number;
  insurancePerYear: number;
  taxPerYear: number;
  reliabilityIndex: number;
  valueRetentionIndex: number;
  comfortIndex: number;
  practicalityIndex: number;
  notes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CarFormInput = Omit<CarRecord, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> & {
  id?: string;
  isFavorite?: boolean;
};

export interface CarRatings {
  valueForMoney: number;
  reliability: number;
  valueRetention: number;
  runningCosts: number;
  overall: number;
  annualCostAt15k: number;
}

export interface CarWithRatings extends CarRecord {
  ratings: CarRatings;
}

export type SortOption = 'overall' | 'price' | 'costPerKm' | 'reliability' | 'valueRetention';

export interface FilterState {
  search: string;
  favoritesOnly: boolean;
  maxBudget: number | null;
  minStars: number;
  drivetrain: Drivetrain | 'All';
  bodyStyle: BodyStyle | 'All';
  sortBy: SortOption;
}

export interface AppSettings {
  annualMileageKm: number;
  sortBy: SortOption;
}

export interface AppStoragePayload {
  version: number;
  cars: CarRecord[];
  settings: AppSettings;
}
