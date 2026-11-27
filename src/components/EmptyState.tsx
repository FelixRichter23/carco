import { BarChart3, CarFront, Database, Eye, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAddFirstCar: () => void;
  onImportJson: () => void;
}

export function EmptyState({ onAddFirstCar, onImportJson }: EmptyStateProps) {
  return (
    <section
      aria-labelledby="empty-state-heading"
      className="max-w-3xl mx-auto my-8 sm:my-16"
    >
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center mx-auto mb-5">
          <CarFront className="w-6 h-6" aria-hidden="true" />
        </div>

        <h2
          id="empty-state-heading"
          className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0F172A]"
        >
          Your German used-car decision board is empty
        </h2>
        <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Track candidate vehicles with German market costs, TÜV/ADAC reliability scores, and
          multiple photos. Star ratings and rankings compute automatically from the numbers.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAddFirstCar}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1E3A8A] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add First Car
          </button>
          <button
            type="button"
            onClick={onImportJson}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#1E40AF]" aria-hidden="true" />
            Import via AI Agent / JSON
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="flex gap-3">
            <BarChart3 className="w-5 h-5 text-[#1E40AF] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                Fact-Based Ranking
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Automatic 1–5★ scores from purchase price, €/km, insurance, tax, and TÜV metrics.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Eye className="w-5 h-5 text-[#1E40AF] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                Fullscreen Viewing
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Inspect multi-photo galleries with keyboard controls and live bottom stats bars.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Database className="w-5 h-5 text-[#1E40AF] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                Local &amp; Base64 Sync
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                No backend required. Export or restore your entire shortlist with a single Base64
                string.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
