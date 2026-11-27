import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Maximize2,
  Minimize2,
  PanelBottom,
  PanelBottomClose,
  Pencil,
  Shrink,
  Star,
  X,
} from 'lucide-react';
import type { CarWithRatings } from '../types/car';
import { calculateAnnualCost } from '../utils/scoring';
import { formatEur, formatEurPerKm, formatNumber, formatStarScore } from '../utils/format';
import { CarImage } from './CarImage';
import { StarRating } from './StarRating';

type ViewMode = 'standard' | 'extended' | 'fullscreen';
type ImageFit = 'contain' | 'cover';

interface ViewingModeProps {
  cars: CarWithRatings[];
  activeCarId: string | null;
  annualMileageKm: number;
  isModalOpen: boolean;
  onSelectCar: (carId: string) => void;
  onToggleFavorite: (carId: string) => void;
  onEditCar: (carId: string) => void;
  onClose: () => void;
}

export function ViewingMode({
  cars,
  activeCarId,
  annualMileageKm,
  isModalOpen,
  onSelectCar,
  onToggleFavorite,
  onEditCar,
  onClose,
}: ViewingModeProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [imageFit, setImageFit] = useState<ImageFit>('contain');

  const currentIndex = activeCarId ? cars.findIndex((c) => c.id === activeCarId) : -1;
  const activeCar = currentIndex >= 0 ? cars[currentIndex] : null;
  const imageCount = activeCar?.images.length ?? 0;

  // Reset or clamp image index when switching cars or editing photos
  useEffect(() => {
    setImageIndex(0);
  }, [activeCarId]);

  useEffect(() => {
    if (imageCount === 0) {
      setImageIndex(0);
    } else if (imageIndex >= imageCount) {
      setImageIndex(imageCount - 1);
    }
  }, [imageCount, imageIndex]);

  const goPrevImage = () => {
    if (imageCount <= 1) return;
    setImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const goNextImage = () => {
    if (imageCount <= 1) return;
    setImageIndex((prev) => (prev + 1) % imageCount);
  };

  const goPrevCar = () => {
    if (cars.length <= 1 || currentIndex < 0) return;
    const prevIdx = (currentIndex - 1 + cars.length) % cars.length;
    onSelectCar(cars[prevIdx].id);
  };

  const goNextCar = () => {
    if (cars.length <= 1 || currentIndex < 0) return;
    const nextIdx = (currentIndex + 1) % cars.length;
    onSelectCar(cars[nextIdx].id);
  };

  useEffect(() => {
    if (!activeCar || isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (imageCount > 1) {
            setImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (imageCount > 1) {
            setImageIndex((prev) => (prev + 1) % imageCount);
          }
          break;
        case 'a':
        case 'A':
        case 'PageUp':
          event.preventDefault();
          if (cars.length > 1) {
            const prevIdx = (currentIndex - 1 + cars.length) % cars.length;
            onSelectCar(cars[prevIdx].id);
          }
          break;
        case 'd':
        case 'D':
        case 'PageDown':
          event.preventDefault();
          if (cars.length > 1) {
            const nextIdx = (currentIndex + 1) % cars.length;
            onSelectCar(cars[nextIdx].id);
          }
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          onToggleFavorite(activeCar.id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCar, cars, currentIndex, imageCount, isModalOpen, onClose, onSelectCar, onToggleFavorite]);

  if (!activeCar) return null;

  const activeImageSrc = activeCar.images[imageIndex];
  const annualCost = calculateAnnualCost(activeCar, annualMileageKm);

  return (
    <div
      role="region"
      aria-label={`Viewing Mode: ${activeCar.brandModel}`}
      className="fixed inset-0 z-30 bg-[#0B1120] text-white flex flex-col select-none"
    >
      {/* Top Control Bar */}
      <div
        className={`flex flex-wrap md:flex-nowrap items-center justify-between gap-2 px-4 py-2.5 border-b transition-opacity ${
          viewMode === 'fullscreen'
            ? 'bg-slate-950/60 border-white/10 absolute top-0 inset-x-0 z-20 backdrop-blur-sm'
            : 'bg-slate-950/90 border-white/10 shrink-0'
        }`}
      >
        {/* Dedicated Vehicle Switching Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrevCar}
            disabled={cars.length <= 1}
            title="Previous car (A or PageUp)"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Prev Car</span>
            <kbd className="hidden md:inline-block ml-1 px-1 py-0.5 text-[10px] bg-black/40 rounded border border-white/15">
              A
            </kbd>
          </button>

          <span className="px-2 text-xs font-medium text-slate-300 tabular-nums">
            Car {currentIndex + 1} / {cars.length}
          </span>

          <button
            type="button"
            onClick={goNextCar}
            disabled={cars.length <= 1}
            title="Next car (D or PageDown)"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Next Car</span>
            <kbd className="hidden md:inline-block mr-1 px-1 py-0.5 text-[10px] bg-black/40 rounded border border-white/15">
              D
            </kbd>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div
          role="group"
          aria-label="Viewing layout mode"
          className="inline-flex items-center rounded-lg bg-white/10 p-0.5 border border-white/10"
        >
          <button
            type="button"
            onClick={() => setViewMode('standard')}
            aria-pressed={viewMode === 'standard'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'standard'
                ? 'bg-white text-[#0F172A]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <PanelBottom className="w-3.5 h-3.5" aria-hidden="true" />
            Standard
          </button>
          <button
            type="button"
            onClick={() => setViewMode('extended')}
            aria-pressed={viewMode === 'extended'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'extended'
                ? 'bg-white text-[#0F172A]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            Extended
          </button>
          <button
            type="button"
            onClick={() => setViewMode('fullscreen')}
            aria-pressed={viewMode === 'fullscreen'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'fullscreen'
                ? 'bg-white text-[#0F172A]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <PanelBottomClose className="w-3.5 h-3.5" aria-hidden="true" />
            Fullscreen
          </button>
        </div>

        {/* Fit toggle & Close */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setImageFit((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
            title={
              imageFit === 'contain'
                ? 'Switch to full-bleed cover crop'
                : 'Switch to full photo without cropping'
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            {imageFit === 'contain' ? (
              <>
                <Expand className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Fit: Contain</span>
              </>
            ) : (
              <>
                <Shrink className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Fit: Cover</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Viewing Mode"
            title="Close (Esc)"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Main Photo Stage */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center bg-[#0B1120] overflow-hidden">
        <CarImage
          src={activeImageSrc}
          alt={`${activeCar.brandModel} photo ${imageCount > 0 ? imageIndex + 1 : 1}`}
          fit={imageFit}
          darkSurface
          className={
            imageFit === 'cover' ? 'w-full h-full' : 'w-full h-full max-w-full max-h-full p-2 sm:p-4'
          }
        />

        {/* Image Navigation Controls (ArrowLeft / ArrowRight) */}
        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevImage}
              aria-label="Previous image"
              title="Previous image (Arrow Left)"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-900 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNextImage}
              aria-label="Next image"
              title="Next image (Arrow Right)"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-900 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Image Counter & Thumbnail Strip */}
        {imageCount > 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 max-w-[calc(100%-2rem)]">
            <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950/80 border border-white/15 text-slate-200 backdrop-blur-xs tabular-nums">
              Image {imageIndex + 1} / {imageCount}
              {imageCount > 1 && (
                <span className="hidden sm:inline text-slate-400 ml-2">&larr; / &rarr;</span>
              )}
            </div>

            {imageCount > 1 && viewMode !== 'fullscreen' && (
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-xs overflow-x-auto max-w-full">
                {activeCar.images.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    aria-label={`Show image ${idx + 1} of ${imageCount}`}
                    aria-current={idx === imageIndex ? 'true' : undefined}
                    className={`w-12 h-8 rounded-md overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === imageIndex
                        ? 'border-white scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <CarImage
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      fit="cover"
                      darkSurface
                      compact
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {imageCount > 1 && viewMode === 'fullscreen' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-950/75 border border-white/15">
                {activeCar.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === imageIndex ? 'w-5 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Restore stats bar button in Fullscreen mode */}
        {viewMode === 'fullscreen' && (
          <button
            type="button"
            onClick={() => setViewMode('standard')}
            className="absolute bottom-3 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950/80 hover:bg-slate-900 border border-white/15 text-slate-200 backdrop-blur-xs cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            Show Stats
          </button>
        )}
      </div>

      {/* Bottom Stats Bar (Standard & Extended modes) */}
      {viewMode !== 'fullscreen' && (
        <div className="shrink-0 bg-slate-950/95 border-t border-white/15 px-4 sm:px-6 py-3.5 select-text">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Identity */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                    {activeCar.brandModel}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/10 text-slate-200">
                    {activeCar.year}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeCar.bodyStyle} &middot; {activeCar.drivetrain} &middot;{' '}
                  {activeCar.transmission} &middot; {activeCar.horsepower} HP
                </p>
              </div>

              {/* Core German Market Metrics */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <div className="text-[11px] text-slate-400">Est. Price</div>
                  <div className="text-sm sm:text-base font-semibold text-white tabular-nums">
                    {formatEur(activeCar.estimatedPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Cost / km</div>
                  <div className="text-sm sm:text-base font-semibold text-white tabular-nums">
                    {formatEurPerKm(activeCar.costPerKm)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Insurance</div>
                  <div className="text-sm sm:text-base font-semibold text-white tabular-nums">
                    {formatEur(activeCar.insurancePerYear)}/yr
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Rating</div>
                  <StarRating value={activeCar.ratings.overall} size="md" darkSurface />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(activeCar.id)}
                  aria-pressed={activeCar.isFavorite}
                  title="Toggle favorite (F)"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    activeCar.isFavorite
                      ? 'bg-[#D97706]/20 border-[#D97706]/50 text-amber-300'
                      : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      activeCar.isFavorite ? 'text-[#D97706] fill-[#D97706]' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {activeCar.isFavorite ? 'Favorited' : 'Favorite'}
                  <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] bg-black/40 rounded border border-white/15">
                    F
                  </kbd>
                </button>

                <button
                  type="button"
                  onClick={() => onEditCar(activeCar.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#1E40AF] hover:bg-[#1D4ED8] text-white transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit
                </button>
              </div>
            </div>

            {/* Extended View Details */}
            {viewMode === 'extended' && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Value for Money</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {formatStarScore(activeCar.ratings.valueForMoney)} ★
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Reliability (TÜV)</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {activeCar.reliabilityIndex}/100 &middot;{' '}
                      {formatStarScore(activeCar.ratings.reliability)} ★
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Value Retention</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {activeCar.valueRetentionIndex}/100 &middot;{' '}
                      {formatStarScore(activeCar.ratings.valueRetention)} ★
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Running Costs</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {formatStarScore(activeCar.ratings.runningCosts)} ★
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Comfort &amp; Equip.</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {activeCar.comfortIndex} / 100
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Practicality</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {activeCar.practicalityIndex} / 100
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">Vehicle Tax</div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {formatEur(activeCar.taxPerYear)}/yr
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[11px] text-slate-400">
                      Est. {formatNumber(annualMileageKm)} km/yr
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5 tabular-nums">
                      {formatEur(annualCost)}/yr
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-lg bg-white/5 border border-white/10 p-3 max-h-36 overflow-y-auto">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Buyer Notes &amp; Inspection Checklist
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activeCar.notes || 'No buyer notes recorded for this vehicle yet.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
