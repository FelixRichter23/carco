import { Check, Eye, Pencil, Star, X } from 'lucide-react';
import type { CarWithRatings } from '../types/car';
import { calculateAnnualCost } from '../utils/scoring';
import { formatEur, formatEurPerKm, formatNumber, formatStarScore } from '../utils/format';
import { CarImage } from './CarImage';
import { NativeModal } from './NativeModal';
import { StarRating } from './StarRating';

interface ComparisonModalProps {
  open: boolean;
  cars: CarWithRatings[];
  annualMileageKm: number;
  onChangeMileage: (km: number) => void;
  onToggleFavorite: (carId: string) => void;
  onInspect: (carId: string) => void;
  onEdit: (carId: string) => void;
  onClose: () => void;
}

const MILEAGE_PRESETS = [10_000, 15_000, 20_000, 30_000];

function getBestIds(
  cars: CarWithRatings[],
  selector: (car: CarWithRatings) => number,
  direction: 'min' | 'max',
): Set<string> {
  if (cars.length < 2) return new Set();
  const values = cars.map(selector);
  const allEqual = values.every((v) => v === values[0]);
  if (allEqual) return new Set();

  const target = direction === 'min' ? Math.min(...values) : Math.max(...values);
  return new Set(cars.filter((c) => selector(c) === target).map((c) => c.id));
}

export function ComparisonModal({
  open,
  cars,
  annualMileageKm,
  onChangeMileage,
  onToggleFavorite,
  onInspect,
  onEdit,
  onClose,
}: ComparisonModalProps) {
  const bestPrice = getBestIds(cars, (c) => c.estimatedPrice, 'min');
  const bestCostKm = getBestIds(cars, (c) => c.costPerKm, 'min');
  const bestInsurance = getBestIds(cars, (c) => c.insurancePerYear, 'min');
  const bestTax = getBestIds(cars, (c) => c.taxPerYear, 'min');
  const bestAnnualCost = getBestIds(
    cars,
    (c) => calculateAnnualCost(c, annualMileageKm),
    'min',
  );
  const bestHp = getBestIds(cars, (c) => c.horsepower, 'max');
  const bestReliability = getBestIds(cars, (c) => c.reliabilityIndex, 'max');
  const bestRetention = getBestIds(cars, (c) => c.valueRetentionIndex, 'max');
  const bestComfort = getBestIds(cars, (c) => c.comfortIndex, 'max');
  const bestPracticality = getBestIds(cars, (c) => c.practicalityIndex, 'max');
  const bestValueStars = getBestIds(cars, (c) => c.ratings.valueForMoney, 'max');
  const bestRunningStars = getBestIds(cars, (c) => c.ratings.runningCosts, 'max');
  const bestOverall = getBestIds(cars, (c) => c.ratings.overall, 'max');

  const cellHighlight = (isBest: boolean) =>
    isBest ? 'bg-emerald-50/90 text-emerald-900 font-semibold' : 'text-[#0F172A]';

  return (
    <NativeModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="comparison-modal-title"
      zIndexClass="z-50"
      panelClassName="w-full max-w-6xl"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h1 id="comparison-modal-title" className="text-lg font-semibold text-[#0F172A]">
              Side-by-Side Comparison ({cars.length} Models)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Best metric per row is highlighted subtly in emerald.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5">
              <label htmlFor="compare-mileage" className="text-xs font-medium text-slate-600">
                Annual mileage:
              </label>
              <input
                id="compare-mileage"
                type="number"
                min={1000}
                max={100000}
                step={1000}
                value={annualMileageKm}
                onChange={(e) => {
                  const val = Math.max(1000, Number(e.target.value) || 15000);
                  onChangeMileage(val);
                }}
                className="w-20 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded px-1.5 py-0.5 tabular-nums text-right"
              />
              <span className="text-xs text-slate-500">km/yr</span>
              <div className="hidden md:flex items-center gap-1 ml-1">
                {MILEAGE_PRESETS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => onChangeMileage(km)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                      annualMileageKm === km
                        ? 'bg-[#1E40AF] text-white'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {km / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="comparison-table-caption"
            className="comparison-table-wrapper"
          >
            <table className="comparison-table text-sm">
              <caption id="comparison-table-caption" className="visually-hidden">
                Side-by-side specification, cost, and star rating comparison
              </caption>
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th
                    scope="col"
                    className="w-44 min-w-[160px] px-3.5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-r border-[#E2E8F0]"
                  >
                    Metric
                  </th>
                  {cars.map((car) => (
                    <th
                      key={car.id}
                      scope="col"
                      className="min-w-[200px] px-3.5 py-2.5 text-left align-middle bg-white border-b border-r last:border-r-0 border-[#E2E8F0]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-[#0F172A] leading-snug">
                            {car.brandModel}
                          </div>
                          <div className="text-xs font-normal text-slate-500 mt-0.5">
                            {car.year}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(car.id)}
                          aria-label={car.isFavorite ? 'Remove favorite' : 'Mark favorite'}
                          className="p-1 rounded hover:bg-slate-100 cursor-pointer shrink-0"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              car.isFavorite
                                ? 'text-[#D97706] fill-[#D97706]'
                                : 'text-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {/* Scrolling Photo & Quick Actions Row */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 align-top border-r border-[#E2E8F0]"
                  >
                    Photo
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className="p-3 align-top border-r last:border-r-0 border-[#E2E8F0]"
                    >
                      <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100 border border-[#E2E8F0]">
                        <CarImage
                          src={car.images[0]}
                          alt={car.brandModel}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onInspect(car.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" aria-hidden="true" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(car.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          Edit
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Overall Star Rating */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-semibold text-[#0F172A] border-r border-[#E2E8F0]"
                  >
                    Overall Rating
                  </th>
                  {cars.map((car) => {
                    const isBest = bestOverall.has(car.id);
                    return (
                      <td
                        key={car.id}
                        className={`p-3 border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                          isBest,
                        )}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <StarRating value={car.ratings.overall} size="sm" />
                          {isBest && (
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-label="Best value" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Estimated Purchase Price */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Est. Used Price
                  </th>
                  {cars.map((car) => {
                    const isBest = bestPrice.has(car.id);
                    return (
                      <td
                        key={car.id}
                        className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                          isBest,
                        )}`}
                      >
                        {formatEur(car.estimatedPrice)}
                      </td>
                    );
                  })}
                </tr>

                {/* Annual Total Operating Cost */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-semibold text-[#0F172A] border-r border-[#E2E8F0]"
                  >
                    Est. Annual Cost
                    <span className="block text-[11px] font-normal text-slate-500">
                      @ {formatNumber(annualMileageKm)} km/yr
                    </span>
                  </th>
                  {cars.map((car) => {
                    const isBest = bestAnnualCost.has(car.id);
                    return (
                      <td
                        key={car.id}
                        className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                          isBest,
                        )}`}
                      >
                        {formatEur(calculateAnnualCost(car, annualMileageKm))}/yr
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Cost per km
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestCostKm.has(car.id),
                      )}`}
                    >
                      {formatEurPerKm(car.costPerKm)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Annual Insurance
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestInsurance.has(car.id),
                      )}`}
                    >
                      {formatEur(car.insurancePerYear)}/yr
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Annual Vehicle Tax
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestTax.has(car.id),
                      )}`}
                    >
                      {formatEur(car.taxPerYear)}/yr
                    </td>
                  ))}
                </tr>

                {/* Specs */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Drivetrain &amp; Gearbox
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className="p-3 text-slate-700 border-r last:border-r-0 border-[#E2E8F0]"
                    >
                      {car.drivetrain} &middot; {car.transmission}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Body Style
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className="p-3 text-slate-700 border-r last:border-r-0 border-[#E2E8F0]"
                    >
                      {car.bodyStyle}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Horsepower
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestHp.has(car.id),
                      )}`}
                    >
                      {car.horsepower} HP
                    </td>
                  ))}
                </tr>

                {/* Sub-ratings & Indices */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Value for Money
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestValueStars.has(car.id),
                      )}`}
                    >
                      {formatStarScore(car.ratings.valueForMoney)} ★
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Running Costs Score
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestRunningStars.has(car.id),
                      )}`}
                    >
                      {formatStarScore(car.ratings.runningCosts)} ★
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Reliability (TÜV/ADAC)
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestReliability.has(car.id),
                      )}`}
                    >
                      {car.reliabilityIndex}/100 ({formatStarScore(car.ratings.reliability)} ★)
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Value Retention
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestRetention.has(car.id),
                      )}`}
                    >
                      {car.valueRetentionIndex}/100 ({formatStarScore(car.ratings.valueRetention)} ★)
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Comfort &amp; Equipment
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestComfort.has(car.id),
                      )}`}
                    >
                      {car.comfortIndex} / 100
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 border-r border-[#E2E8F0]"
                  >
                    Practicality &amp; Space
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className={`p-3 tabular-nums border-r last:border-r-0 border-[#E2E8F0] ${cellHighlight(
                        bestPracticality.has(car.id),
                      )}`}
                    >
                      {car.practicalityIndex} / 100
                    </td>
                  ))}
                </tr>

                {/* Buyer Notes */}
                <tr>
                  <th
                    scope="row"
                    className="p-3 text-left text-xs font-medium text-slate-600 align-top border-r border-[#E2E8F0]"
                  >
                    Buyer Notes
                  </th>
                  {cars.map((car) => (
                    <td
                      key={car.id}
                      className="p-3 text-xs text-slate-600 align-top leading-relaxed whitespace-pre-wrap border-r last:border-r-0 border-[#E2E8F0]"
                    >
                      {car.notes || <span className="text-slate-400">No notes</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </NativeModal>
  );
}
