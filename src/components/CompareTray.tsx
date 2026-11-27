import { Columns3, X } from 'lucide-react';
import type { CarWithRatings } from '../types/car';

interface CompareTrayProps {
  selectedCars: CarWithRatings[];
  onRemove: (carId: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export function CompareTray({
  selectedCars,
  onRemove,
  onClear,
  onOpenCompare,
}: CompareTrayProps) {
  if (selectedCars.length === 0) return null;

  const canCompare = selectedCars.length >= 2;

  return (
    <div
      role="region"
      aria-label="Vehicle comparison selection"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-3xl bg-[#0F172A] text-white rounded-xl shadow-lg border border-slate-700 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
          Compare ({selectedCars.length}/4):
        </span>
        {selectedCars.map((car) => (
          <span
            key={car.id}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-white/10 text-xs font-medium max-w-[180px]"
          >
            <span className="truncate">{car.brandModel}</span>
            <button
              type="button"
              onClick={() => onRemove(car.id)}
              aria-label={`Remove ${car.brandModel} from comparison`}
              className="p-0.5 rounded hover:bg-white/20 cursor-pointer"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0 justify-end">
        <button
          type="button"
          onClick={onClear}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={!canCompare}
          onClick={onOpenCompare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
        >
          <Columns3 className="w-3.5 h-3.5" aria-hidden="true" />
          {canCompare ? 'Compare Side-by-Side' : 'Select 1 more'}
        </button>
      </div>
    </div>
  );
}
