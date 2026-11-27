import { CarFront, Database, Plus, Star } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  favoriteCount: number;
  onAddCar: () => void;
  onOpenDataSync: () => void;
}

export function Header({
  totalCount,
  favoriteCount,
  onAddCar,
  onOpenDataSync,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center shrink-0">
            <CarFront className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#0F172A] truncate">
                CarCo
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-[#E2E8F0]">
                DE Market
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              Used Car Decision Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {totalCount > 0 && (
            <div className="hidden md:flex items-center gap-3 mr-1 px-3 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0] text-xs text-slate-600">
              <span>
                <strong className="text-[#0F172A] tabular-nums">{totalCount}</strong>{' '}
                {totalCount === 1 ? 'model' : 'models'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" aria-hidden="true" />
                <strong className="text-[#0F172A] tabular-nums">{favoriteCount}</strong>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenDataSync}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-[#E2E8F0] hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="hidden sm:inline">Data &amp; AI Import</span>
            <span className="sm:hidden">Import</span>
          </button>

          <button
            type="button"
            onClick={onAddCar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1E3A8A] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Car</span>
          </button>
        </div>
      </div>
    </header>
  );
}
