import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, SearchX } from 'lucide-react';
import type { CarFormInput, FilterState } from './types/car';
import { attachRatings, sortCars } from './utils/scoring';
import { useCarStorage } from './hooks/useCarStorage';
import { CarCard } from './components/CarCard';
import { CarFormModal } from './components/CarFormModal';
import { CompareTray } from './components/CompareTray';
import { ComparisonModal } from './components/ComparisonModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DataSyncModal } from './components/DataSyncModal';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { ViewingMode } from './components/ViewingMode';

const MAX_COMPARE_CARS = 4;

const DEFAULT_FILTERS: Omit<FilterState, 'sortBy'> = {
  search: '',
  favoritesOnly: false,
  maxBudget: null,
  minStars: 0,
  drivetrain: 'All',
  bodyStyle: 'All',
};

export function App() {
  const {
    payload,
    cars,
    settings,
    upsertCar,
    deleteCar,
    toggleFavorite,
    importCars,
    restorePayload,
    updateSettings,
    resetAll,
  } = useCarStorage();

  const [filterValues, setFilterValues] = useState(DEFAULT_FILTERS);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [viewingCarId, setViewingCarId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [dataSyncOpen, setDataSyncOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const filters: FilterState = useMemo(
    () => ({ ...filterValues, sortBy: settings.sortBy }),
    [filterValues, settings.sortBy],
  );

  const ratedCars = useMemo(() => cars.map(attachRatings), [cars]);

  const filteredAndSortedCars = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const filtered = ratedCars.filter((car) => {
      if (filters.favoritesOnly && !car.isFavorite) return false;
      if (filters.maxBudget !== null && car.estimatedPrice > filters.maxBudget) return false;
      if (filters.minStars > 0 && car.ratings.overall < filters.minStars) return false;
      if (filters.drivetrain !== 'All' && car.drivetrain !== filters.drivetrain) return false;
      if (filters.bodyStyle !== 'All' && car.bodyStyle !== filters.bodyStyle) return false;
      if (query) {
        const haystack = `${car.brandModel} ${car.year} ${car.bodyStyle} ${car.drivetrain} ${car.notes}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return sortCars(filtered, filters.sortBy);
  }, [ratedCars, filters]);

  // Keep selected compare IDs synchronized if cars are deleted or replaced
  useEffect(() => {
    const existingIds = new Set(cars.map((c) => c.id));
    setSelectedCompareIds((prev) => prev.filter((id) => existingIds.has(id)));
  }, [cars]);

  // Close Viewing Mode if active car was removed
  useEffect(() => {
    if (viewingCarId && !cars.some((c) => c.id === viewingCarId)) {
      setViewingCarId(null);
    }
  }, [cars, viewingCarId]);

  const selectedCompareCars = useMemo(() => {
    const byId = new Map(ratedCars.map((c) => [c.id, c]));
    return selectedCompareIds
      .map((id) => byId.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [ratedCars, selectedCompareIds]);

  const viewingCarList = useMemo(() => {
    if (!viewingCarId) return [];
    const inFiltered = filteredAndSortedCars.some((c) => c.id === viewingCarId);
    return inFiltered ? filteredAndSortedCars : sortCars(ratedCars, filters.sortBy);
  }, [viewingCarId, filteredAndSortedCars, ratedCars, filters.sortBy]);

  const editingCar = useMemo(
    () => (editingCarId ? cars.find((c) => c.id === editingCarId) ?? null : null),
    [cars, editingCarId],
  );

  const pendingDeleteCar = useMemo(
    () => (pendingDeleteId ? cars.find((c) => c.id === pendingDeleteId) ?? null : null),
    [cars, pendingDeleteId],
  );

  const favoriteCount = useMemo(() => cars.filter((c) => c.isFavorite).length, [cars]);

  const handleFilterChange = (patch: Partial<FilterState>) => {
    if (patch.sortBy !== undefined) {
      updateSettings({ sortBy: patch.sortBy });
    }
    const { sortBy: _ignored, ...rest } = patch;
    if (Object.keys(rest).length > 0) {
      setFilterValues((prev) => ({ ...prev, ...rest }));
    }
  };

  const handleResetFilters = () => {
    setFilterValues(DEFAULT_FILTERS);
  };

  const handleOpenAddModal = () => {
    setEditingCarId(null);
    setFormOpen(true);
  };

  const handleOpenEditModal = (carId: string) => {
    setEditingCarId(carId);
    setFormOpen(true);
  };

  const handleSaveCar = (input: CarFormInput) => {
    const saved = upsertCar(input);
    setFormOpen(false);
    setEditingCarId(null);
    notify(input.id ? `Updated "${saved.brandModel}".` : `Added "${saved.brandModel}".`);
  };

  const handleToggleCompare = (carId: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      }
      if (prev.length >= MAX_COMPARE_CARS) return prev;
      return [...prev, carId];
    });
  };

  const handleConfirmDeleteCar = () => {
    if (!pendingDeleteCar) return;
    const name = pendingDeleteCar.brandModel;
    deleteCar(pendingDeleteCar.id);
    setPendingDeleteId(null);
    notify(`Deleted "${name}".`);
  };

  const handleConfirmResetAll = () => {
    resetAll();
    setSelectedCompareIds([]);
    setViewingCarId(null);
    setCompareOpen(false);
    setDataSyncOpen(false);
    setConfirmResetOpen(false);
    setFilterValues(DEFAULT_FILTERS);
    notify('All stored vehicles and settings were cleared.');
  };

  const isAnyModalOpen =
    formOpen || compareOpen || dataSyncOpen || Boolean(pendingDeleteId) || confirmResetOpen;

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8F9FA] text-[#0F172A]">
      <Header
        totalCount={cars.length}
        favoriteCount={favoriteCount}
        onAddCar={handleOpenAddModal}
        onOpenDataSync={() => setDataSyncOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {cars.length === 0 ? (
          <EmptyState
            onAddFirstCar={handleOpenAddModal}
            onImportJson={() => setDataSyncOpen(true)}
          />
        ) : (
          <div className="space-y-5">
            <FilterBar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              visibleCount={filteredAndSortedCars.length}
              totalCount={cars.length}
            />

            {filteredAndSortedCars.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
                <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
                <h2 className="text-base font-semibold text-[#0F172A]">
                  No vehicles match your current filters
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Try widening your budget, lowering the minimum rating, or clearing search terms.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-[#1E40AF] hover:bg-[#1E3A8A] text-white transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <section
                aria-label="Ranked vehicles"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredAndSortedCars.map((car, idx) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    rank={idx + 1}
                    isSelectedForCompare={selectedCompareIds.includes(car.id)}
                    compareLimitReached={selectedCompareIds.length >= MAX_COMPARE_CARS}
                    onToggleCompare={handleToggleCompare}
                    onToggleFavorite={toggleFavorite}
                    onInspect={setViewingCarId}
                    onEdit={handleOpenEditModal}
                    onDelete={setPendingDeleteId}
                  />
                ))}
              </section>
            )}
          </div>
        )}
      </main>

      {/* Compare Floating Tray (z-20) */}
      <CompareTray
        selectedCars={selectedCompareCars}
        onRemove={handleToggleCompare}
        onClear={() => setSelectedCompareIds([])}
        onOpenCompare={() => setCompareOpen(true)}
      />

      {/* Fullscreen Viewing Mode (z-30) */}
      <ViewingMode
        cars={viewingCarList}
        activeCarId={viewingCarId}
        annualMileageKm={settings.annualMileageKm}
        isModalOpen={isAnyModalOpen}
        onSelectCar={setViewingCarId}
        onToggleFavorite={toggleFavorite}
        onEditCar={handleOpenEditModal}
        onClose={() => setViewingCarId(null)}
      />

      {/* Native Top-Layer Modals (z-50) — guaranteed to stack above Viewing Mode */}
      <CarFormModal
        open={formOpen}
        editingCar={editingCar}
        onSave={handleSaveCar}
        onClose={() => {
          setFormOpen(false);
          setEditingCarId(null);
        }}
      />

      <ComparisonModal
        open={compareOpen && selectedCompareCars.length >= 2}
        cars={selectedCompareCars}
        annualMileageKm={settings.annualMileageKm}
        onChangeMileage={(km) => updateSettings({ annualMileageKm: km })}
        onToggleFavorite={toggleFavorite}
        onInspect={setViewingCarId}
        onEdit={handleOpenEditModal}
        onClose={() => setCompareOpen(false)}
      />

      <DataSyncModal
        open={dataSyncOpen}
        payload={payload}
        onImportCars={importCars}
        onRestoreBackup={restorePayload}
        onRequestResetAll={() => setConfirmResetOpen(true)}
        onNotify={notify}
        onClose={() => setDataSyncOpen(false)}
      />

      {/* Confirmation Dialogs (z-60) */}
      <ConfirmDialog
        open={Boolean(pendingDeleteCar)}
        title={`Delete ${pendingDeleteCar?.brandModel ?? 'vehicle'}?`}
        description="This removes the vehicle from your local decision board. You can restore it only if you saved a Base64 backup."
        confirmLabel="Delete Vehicle"
        onConfirm={handleConfirmDeleteCar}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset all stored data?"
        description="This permanently removes every vehicle, favorite, and preference from localStorage on this browser."
        confirmLabel="Reset Everything"
        onConfirm={handleConfirmResetAll}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* Live Toast Feedback (z-70) */}
      <div
        role="status"
        aria-live="polite"
        className="fixed top-20 right-4 z-[70] pointer-events-none"
      >
        {toastMessage && (
          <div className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-sm font-medium shadow-lg border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
