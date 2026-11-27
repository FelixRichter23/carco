import { Eye, Images, Pencil, Star, Trash2 } from 'lucide-react';
import type { CarWithRatings } from '../types/car';
import { formatEur, formatEurPerKm, formatStarScore } from '../utils/format';
import { CarImage } from './CarImage';
import { StarRating } from './StarRating';

interface CarCardProps {
  car: CarWithRatings;
  rank: number;
  isSelectedForCompare: boolean;
  compareLimitReached: boolean;
  onToggleCompare: (carId: string) => void;
  onToggleFavorite: (carId: string) => void;
  onInspect: (carId: string) => void;
  onEdit: (carId: string) => void;
  onDelete: (carId: string) => void;
}

export function CarCard({
  car,
  rank,
  isSelectedForCompare,
  compareLimitReached,
  onToggleCompare,
  onToggleFavorite,
  onInspect,
  onEdit,
  onDelete,
}: CarCardProps) {
  const compareDisabled = !isSelectedForCompare && compareLimitReached;

  return (
    <article
      className={`group bg-white rounded-xl border transition-all flex flex-col overflow-hidden ${
        isSelectedForCompare
          ? 'border-[#1E40AF] ring-2 ring-[#1E40AF]/15'
          : 'border-[#E2E8F0] hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Clickable thumbnail opening Fullscreen Viewing Mode */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => onInspect(car.id)}
          aria-label={`Inspect ${car.brandModel} in Viewing Mode`}
          className="block w-full h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E40AF]"
        >
          <CarImage
            src={car.images[0]}
            alt={`${car.brandModel} (${car.year})`}
            fit="cover"
            className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>

        {/* Rank badge */}
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums bg-[#0F172A]/80 text-white backdrop-blur-xs">
          #{rank}
        </span>

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={() => onToggleFavorite(car.id)}
          aria-label={car.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={car.isFavorite}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer ${
            car.isFavorite
              ? 'bg-white/95 text-[#D97706] shadow-xs'
              : 'bg-[#0F172A]/55 text-white/90 hover:bg-white/95 hover:text-[#D97706]'
          }`}
        >
          <Star
            className={`w-4 h-4 ${car.isFavorite ? 'fill-[#D97706]' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Multi-image badge */}
        {car.images.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#0F172A]/75 text-white backdrop-blur-xs pointer-events-none">
            <Images className="w-3 h-3" aria-hidden="true" />
            {car.images.length}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onInspect(car.id)}
              className="text-left text-base font-semibold text-[#0F172A] hover:text-[#1E40AF] transition-colors line-clamp-1 cursor-pointer"
            >
              {car.brandModel}
            </button>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {car.year} &middot; {car.bodyStyle} &middot; {car.drivetrain} &middot;{' '}
              {car.transmission} &middot; {car.horsepower} HP
            </p>
          </div>
        </div>

        {/* German market cost strip */}
        <dl className="mt-3.5 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0]">
          <div>
            <dt className="text-[11px] font-medium text-slate-500">Est. Price</dt>
            <dd className="text-sm font-semibold text-[#0F172A] tabular-nums mt-0.5">
              {formatEur(car.estimatedPrice)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-slate-500">Cost / km</dt>
            <dd className="text-sm font-semibold text-[#0F172A] tabular-nums mt-0.5">
              {formatEurPerKm(car.costPerKm)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium text-slate-500">Insurance</dt>
            <dd className="text-sm font-semibold text-[#0F172A] tabular-nums mt-0.5">
              {formatEur(car.insurancePerYear)}
              <span className="text-[10px] font-normal text-slate-400">/yr</span>
            </dd>
          </div>
        </dl>

        {/* Computed stars & breakdown */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <StarRating value={car.ratings.overall} size="md" label="Overall rating" />
          <span className="text-[11px] text-slate-500 tabular-nums">
            Tax {formatEur(car.taxPerYear)}/yr
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
          <div className="rounded-md bg-slate-50 border border-[#E2E8F0] py-1 px-1">
            <div className="text-[10px] text-slate-500 truncate">Value</div>
            <div className="text-xs font-semibold text-[#0F172A] tabular-nums">
              {formatStarScore(car.ratings.valueForMoney)}★
            </div>
          </div>
          <div className="rounded-md bg-slate-50 border border-[#E2E8F0] py-1 px-1">
            <div className="text-[10px] text-slate-500 truncate">Reliab.</div>
            <div className="text-xs font-semibold text-[#0F172A] tabular-nums">
              {formatStarScore(car.ratings.reliability)}★
            </div>
          </div>
          <div className="rounded-md bg-slate-50 border border-[#E2E8F0] py-1 px-1">
            <div className="text-[10px] text-slate-500 truncate">Retent.</div>
            <div className="text-xs font-semibold text-[#0F172A] tabular-nums">
              {formatStarScore(car.ratings.valueRetention)}★
            </div>
          </div>
          <div className="rounded-md bg-slate-50 border border-[#E2E8F0] py-1 px-1">
            <div className="text-[10px] text-slate-500 truncate">Costs</div>
            <div className="text-xs font-semibold text-[#0F172A] tabular-nums">
              {formatStarScore(car.ratings.runningCosts)}★
            </div>
          </div>
        </div>

        {car.notes && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {car.notes}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-auto pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
          <label
            className={`inline-flex items-center gap-2 text-xs font-medium select-none ${
              compareDisabled
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 cursor-pointer'
            }`}
            title={compareDisabled ? 'Up to 4 vehicles can be compared at once' : undefined}
          >
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              disabled={compareDisabled}
              onChange={() => onToggleCompare(car.id)}
              className="w-4 h-4 rounded border-slate-300 text-[#1E40AF] focus:ring-[#1E40AF] cursor-pointer disabled:cursor-not-allowed"
            />
            Compare
          </label>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onInspect(car.id)}
              aria-label={`Inspect ${car.brandModel}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-[#1E40AF] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              View
            </button>
            <button
              type="button"
              onClick={() => onEdit(car.id)}
              aria-label={`Edit ${car.brandModel}`}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(car.id)}
              aria-label={`Delete ${car.brandModel}`}
              className="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
