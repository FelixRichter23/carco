import { RotateCcw, Search, SlidersHorizontal, Star } from 'lucide-react';
import {
  BODY_STYLES,
  DRIVETRAINS,
  type BodyStyle,
  type Drivetrain,
  type FilterState,
  type SortOption,
} from '../types/car';
import { RatingFormulaTooltip } from './RatingFormulaTooltip';

interface FilterBarProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  visibleCount: number;
  totalCount: number;
}

export function FilterBar({
  filters,
  onChange,
  onReset,
  visibleCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.favoritesOnly ||
    filters.maxBudget !== null ||
    filters.minStars > 0 ||
    filters.drivetrain !== 'All' ||
    filters.bodyStyle !== 'All';

  return (
    <section
      aria-label="Filter and sort vehicles"
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search brand, model, generation, or buyer notes..."
            aria-label="Search brand, model, or notes"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ favoritesOnly: !filters.favoritesOnly })}
            aria-pressed={filters.favoritesOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              filters.favoritesOnly
                ? 'bg-[#D97706]/10 border-[#D97706]/40 text-[#B45309]'
                : 'bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                filters.favoritesOnly ? 'text-[#D97706] fill-[#D97706]' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
            Favorites
          </button>

          <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5">
            <label htmlFor="filter-max-budget" className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Max €
            </label>
            <input
              id="filter-max-budget"
              type="number"
              min={0}
              step={1000}
              value={filters.maxBudget ?? ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                onChange({ maxBudget: raw === '' ? null : Math.max(0, Number(raw)) });
              }}
              placeholder="Any"
              className="w-24 text-sm bg-transparent text-[#0F172A] placeholder:text-slate-400 focus:outline-none tabular-nums"
            />
          </div>

          <select
            aria-label="Minimum overall star rating"
            value={filters.minStars}
            onChange={(e) => onChange({ minStars: Number(e.target.value) })}
            className="px-2.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#1E40AF] cursor-pointer"
          >
            <option value={0}>Any rating</option>
            <option value={2}>2.0★ &amp; up</option>
            <option value={3}>3.0★ &amp; up</option>
            <option value={3.5}>3.5★ &amp; up</option>
            <option value={4}>4.0★ &amp; up</option>
            <option value={4.5}>4.5★ &amp; up</option>
          </select>

          <select
            aria-label="Filter by drivetrain"
            value={filters.drivetrain}
            onChange={(e) => onChange({ drivetrain: e.target.value as Drivetrain | 'All' })}
            className="px-2.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#1E40AF] cursor-pointer"
          >
            <option value="All">All drivetrains</option>
            {DRIVETRAINS.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by body style"
            value={filters.bodyStyle}
            onChange={(e) => onChange({ bodyStyle: e.target.value as BodyStyle | 'All' })}
            className="px-2.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#1E40AF] cursor-pointer"
          >
            <option value="All">All body styles</option>
            {BODY_STYLES.map((bs) => (
              <option key={bs} value={bs}>
                {bs}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>
            Showing <strong className="text-[#0F172A] tabular-nums">{visibleCount}</strong> of{' '}
            <strong className="text-[#0F172A] tabular-nums">{totalCount}</strong>{' '}
            {totalCount === 1 ? 'vehicle' : 'vehicles'}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 ml-1 text-[#1E40AF] hover:text-[#1E3A8A] font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Reset filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs font-medium text-slate-500">
            Rank by
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortOption })}
            className="px-2.5 py-1.5 text-xs font-medium bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#1E40AF] cursor-pointer"
          >
            <option value="overall">Overall Rating (High to Low)</option>
            <option value="price">Estimated Price (Low to High)</option>
            <option value="costPerKm">Cost per km (Low to High)</option>
            <option value="reliability">Reliability Index (High to Low)</option>
            <option value="valueRetention">Value Retention (High to Low)</option>
          </select>
          <RatingFormulaTooltip />
        </div>
      </div>
    </section>
  );
}
