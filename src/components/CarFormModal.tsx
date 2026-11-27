import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import {
  BODY_STYLES,
  DRIVETRAINS,
  TRANSMISSIONS,
  type BodyStyle,
  type CarFormInput,
  type CarRecord,
  type Drivetrain,
  type Transmission,
} from '../types/car';
import { calculateCarRatings } from '../utils/scoring';
import { formatEur, formatStarScore } from '../utils/format';
import { CarImage } from './CarImage';
import { NativeModal } from './NativeModal';
import { RatingFormulaTooltip } from './RatingFormulaTooltip';
import { StarRating } from './StarRating';

interface CarFormModalProps {
  open: boolean;
  editingCar: CarRecord | null;
  onSave: (input: CarFormInput) => void;
  onClose: () => void;
}

interface FormState {
  brandModel: string;
  year: string;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  transmission: Transmission;
  horsepower: string;
  images: string[];
  newImageUrl: string;
  estimatedPrice: string;
  costPerKm: string;
  insurancePerYear: string;
  taxPerYear: string;
  reliabilityIndex: number;
  valueRetentionIndex: number;
  comfortIndex: number;
  practicalityIndex: number;
  notes: string;
}

function buildInitialState(car: CarRecord | null): FormState {
  if (!car) {
    return {
      brandModel: '',
      year: '',
      bodyStyle: 'Hatchback',
      drivetrain: 'Petrol',
      transmission: 'Automatic',
      horsepower: '150',
      images: [],
      newImageUrl: '',
      estimatedPrice: '20000',
      costPerKm: '0.35',
      insurancePerYear: '650',
      taxPerYear: '110',
      reliabilityIndex: 75,
      valueRetentionIndex: 70,
      comfortIndex: 75,
      practicalityIndex: 75,
      notes: '',
    };
  }

  return {
    brandModel: car.brandModel,
    year: car.year,
    bodyStyle: car.bodyStyle,
    drivetrain: car.drivetrain,
    transmission: car.transmission,
    horsepower: String(car.horsepower),
    images: [...car.images],
    newImageUrl: '',
    estimatedPrice: String(car.estimatedPrice),
    costPerKm: String(car.costPerKm),
    insurancePerYear: String(car.insurancePerYear),
    taxPerYear: String(car.taxPerYear),
    reliabilityIndex: car.reliabilityIndex,
    valueRetentionIndex: car.valueRetentionIndex,
    comfortIndex: car.comfortIndex,
    practicalityIndex: car.practicalityIndex,
    notes: car.notes,
  };
}

export function CarFormModal({ open, editingCar, onSave, onClose }: CarFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(editingCar));
  const [submittedOnce, setSubmittedOnce] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(editingCar));
      setSubmittedOnce(false);
    }
  }, [open, editingCar]);

  const liveRatings = useMemo(() => {
    return calculateCarRatings({
      estimatedPrice: Math.max(0, Number(form.estimatedPrice) || 0),
      costPerKm: Math.max(0, Number(form.costPerKm) || 0),
      insurancePerYear: Math.max(0, Number(form.insurancePerYear) || 0),
      taxPerYear: Math.max(0, Number(form.taxPerYear) || 0),
      reliabilityIndex: form.reliabilityIndex,
      valueRetentionIndex: form.valueRetentionIndex,
      comfortIndex: form.comfortIndex,
      practicalityIndex: form.practicalityIndex,
    });
  }, [form]);

  const handleAddImageUrl = () => {
    const trimmed = form.newImageUrl.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      images: prev.images.includes(trimmed) ? prev.images : [...prev.images, trimmed],
      newImageUrl: '',
    }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;
    setForm((prev) => {
      const copy = [...prev.images];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return { ...prev, images: copy };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedOnce(true);

    const formEl = event.currentTarget;
    if (!formEl.checkValidity()) {
      const firstInvalid = formEl.querySelector<HTMLElement>(':invalid');
      firstInvalid?.focus();
      return;
    }

    const pendingUrl = form.newImageUrl.trim();
    const finalImages =
      pendingUrl && !form.images.includes(pendingUrl)
        ? [...form.images, pendingUrl]
        : form.images;

    onSave({
      id: editingCar?.id,
      isFavorite: editingCar?.isFavorite,
      brandModel: form.brandModel.trim(),
      year: form.year.trim(),
      bodyStyle: form.bodyStyle,
      drivetrain: form.drivetrain,
      transmission: form.transmission,
      horsepower: Number(form.horsepower),
      images: finalImages,
      estimatedPrice: Number(form.estimatedPrice),
      costPerKm: Number(form.costPerKm),
      insurancePerYear: Number(form.insurancePerYear),
      taxPerYear: Number(form.taxPerYear),
      reliabilityIndex: form.reliabilityIndex,
      valueRetentionIndex: form.valueRetentionIndex,
      comfortIndex: form.comfortIndex,
      practicalityIndex: form.practicalityIndex,
      notes: form.notes.trim(),
    });
  };

  const invalidClass = submittedOnce ? 'user-invalid-fallback' : '';

  return (
    <NativeModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="car-form-modal-title"
      closeOnBackdrop={false}
      zIndexClass="z-50"
      panelClassName="w-full max-w-3xl"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 id="car-form-modal-title" className="text-lg font-semibold text-[#0F172A]">
              {editingCar ? 'Edit Vehicle' : 'Add Vehicle'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter German market figures and quality scores — star ratings update live.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vehicle form"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live Star Preview Banner */}
        <div className="px-6 py-3 bg-[#F8F9FA] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live Score
            </span>
            <StarRating value={liveRatings.overall} size="md" label="Live overall score" />
            <RatingFormulaTooltip compact />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums">
            <span>
              Value <strong className="text-[#0F172A]">{formatStarScore(liveRatings.valueForMoney)}★</strong>
            </span>
            <span>
              Reliability{' '}
              <strong className="text-[#0F172A]">{formatStarScore(liveRatings.reliability)}★</strong>
            </span>
            <span>
              Retention{' '}
              <strong className="text-[#0F172A]">
                {formatStarScore(liveRatings.valueRetention)}★
              </strong>
            </span>
            <span>
              Running Costs{' '}
              <strong className="text-[#0F172A]">
                {formatStarScore(liveRatings.runningCosts)}★
              </strong>{' '}
              <span className="text-slate-400">({formatEur(liveRatings.annualCostAt15k)}/yr)</span>
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Section 1: Basic Info */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF]">
              1. Basic Vehicle Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="car-brand-model" className="block text-xs font-medium text-slate-700 mb-1">
                  Brand &amp; Model <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-brand-model"
                  type="text"
                  required
                  autoFocus
                  value={form.brandModel}
                  onChange={(e) => setForm({ ...form, brandModel: e.target.value })}
                  placeholder="e.g. Mazda 3 Skyactiv-G"
                  aria-invalid={submittedOnce && !form.brandModel.trim() ? 'true' : 'false'}
                  className={`field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/15 ${
                    !form.brandModel.trim() ? invalidClass : ''
                  }`}
                />
                <p className="field-error mt-1 text-xs text-red-600 items-center gap-1">
                  Enter a brand and model name.
                </p>
              </div>

              <div>
                <label htmlFor="car-year" className="block text-xs font-medium text-slate-700 mb-1">
                  Year / Generation <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-year"
                  type="text"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="e.g. 2021 (BP)"
                  aria-invalid={submittedOnce && !form.year.trim() ? 'true' : 'false'}
                  className={`field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/15 ${
                    !form.year.trim() ? invalidClass : ''
                  }`}
                />
                <p className="field-error mt-1 text-xs text-red-600 items-center gap-1">
                  Enter a model year or generation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="car-body-style" className="block text-xs font-medium text-slate-700 mb-1">
                  Body Style
                </label>
                <select
                  id="car-body-style"
                  value={form.bodyStyle}
                  onChange={(e) => setForm({ ...form, bodyStyle: e.target.value as BodyStyle })}
                  className="w-full px-2.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF]"
                >
                  {BODY_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="car-drivetrain" className="block text-xs font-medium text-slate-700 mb-1">
                  Drivetrain
                </label>
                <select
                  id="car-drivetrain"
                  value={form.drivetrain}
                  onChange={(e) => setForm({ ...form, drivetrain: e.target.value as Drivetrain })}
                  className="w-full px-2.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF]"
                >
                  {DRIVETRAINS.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="car-transmission" className="block text-xs font-medium text-slate-700 mb-1">
                  Transmission
                </label>
                <select
                  id="car-transmission"
                  value={form.transmission}
                  onChange={(e) =>
                    setForm({ ...form, transmission: e.target.value as Transmission })
                  }
                  className="w-full px-2.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF]"
                >
                  {TRANSMISSIONS.map((tr) => (
                    <option key={tr} value={tr}>
                      {tr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="car-hp" className="block text-xs font-medium text-slate-700 mb-1">
                  Power (HP) <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-hp"
                  type="number"
                  required
                  min={1}
                  max={2500}
                  value={form.horsepower}
                  onChange={(e) => setForm({ ...form, horsepower: e.target.value })}
                  className={`field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg tabular-nums focus:outline-none focus:border-[#1E40AF] ${
                    Number(form.horsepower) < 1 ? invalidClass : ''
                  }`}
                />
                <p className="field-error mt-1 text-xs text-red-600">1–2500 HP.</p>
              </div>
            </div>
          </fieldset>

          {/* Section 2: German Market & Costs */}
          <fieldset className="space-y-4 pt-2 border-t border-[#E2E8F0]">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF] pt-2">
              2. German Market &amp; Running Costs
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="car-price" className="block text-xs font-medium text-slate-700 mb-1">
                  Used Price (€) <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-price"
                  type="number"
                  required
                  min={0}
                  step={100}
                  value={form.estimatedPrice}
                  onChange={(e) => setForm({ ...form, estimatedPrice: e.target.value })}
                  className="field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg tabular-nums focus:outline-none focus:border-[#1E40AF]"
                />
                <p className="field-error mt-1 text-xs text-red-600">Enter a valid EUR price.</p>
              </div>

              <div>
                <label htmlFor="car-cost-km" className="block text-xs font-medium text-slate-700 mb-1">
                  Cost / km (€/km) <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-cost-km"
                  type="number"
                  required
                  min={0}
                  max={20}
                  step={0.01}
                  value={form.costPerKm}
                  onChange={(e) => setForm({ ...form, costPerKm: e.target.value })}
                  className="field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg tabular-nums focus:outline-none focus:border-[#1E40AF]"
                />
                <p className="field-error mt-1 text-xs text-red-600">Enter 0.00–20.00.</p>
              </div>

              <div>
                <label htmlFor="car-insurance" className="block text-xs font-medium text-slate-700 mb-1">
                  Insurance (€/yr) <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-insurance"
                  type="number"
                  required
                  min={0}
                  step={10}
                  value={form.insurancePerYear}
                  onChange={(e) => setForm({ ...form, insurancePerYear: e.target.value })}
                  className="field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg tabular-nums focus:outline-none focus:border-[#1E40AF]"
                />
                <p className="field-error mt-1 text-xs text-red-600">Enter annual insurance.</p>
              </div>

              <div>
                <label htmlFor="car-tax" className="block text-xs font-medium text-slate-700 mb-1">
                  Vehicle Tax (€/yr) <span className="text-red-600">*</span>
                </label>
                <input
                  id="car-tax"
                  type="number"
                  required
                  min={0}
                  step={2}
                  value={form.taxPerYear}
                  onChange={(e) => setForm({ ...form, taxPerYear: e.target.value })}
                  className="field-input w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg tabular-nums focus:outline-none focus:border-[#1E40AF]"
                />
                <p className="field-error mt-1 text-xs text-red-600">Enter Kfz-Steuer (€).</p>
              </div>
            </div>
          </fieldset>

          {/* Section 3: Quality & Market Metrics */}
          <fieldset className="space-y-4 pt-2 border-t border-[#E2E8F0]">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF] pt-2">
              3. Quality &amp; Market Metrics (0–100)
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  {
                    key: 'reliabilityIndex',
                    label: 'Reliability Index (TÜV / ADAC)',
                  },
                  {
                    key: 'valueRetentionIndex',
                    label: 'Value Retention Index',
                  },
                  {
                    key: 'comfortIndex',
                    label: 'Comfort & Equipment',
                  },
                  {
                    key: 'practicalityIndex',
                    label: 'Practicality & Space',
                  },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label htmlFor={`metric-${key}`} className="text-xs font-medium text-slate-700">
                      {label}
                    </label>
                    <input
                      id={`metric-${key}`}
                      type="number"
                      min={0}
                      max={100}
                      value={form[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                        })
                      }
                      className="w-16 px-2 py-1 text-xs font-semibold text-right bg-white border border-[#E2E8F0] rounded-md tabular-nums"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form[key]}
                    aria-label={label}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    className="w-full accent-[#1E40AF] cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Section 4: Multiple Images */}
          <fieldset className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF] pt-2">
              4. Vehicle Photos (Multiple URLs)
            </legend>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.newImageUrl}
                onChange={(e) => setForm({ ...form, newImageUrl: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                placeholder="https://... (exterior, interior, trunk photo URL)"
                aria-label="Add image URL"
                className="flex-1 px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-[#0F172A] transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add Photo
              </button>
            </div>

            {form.images.length > 0 ? (
              <ul className="space-y-2">
                {form.images.map((url, idx) => (
                  <li
                    key={`${url}-${idx}`}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0]"
                  >
                    <div className="w-16 h-11 rounded-md overflow-hidden border border-[#E2E8F0] shrink-0 bg-slate-100">
                      <CarImage
                        src={url}
                        alt={`Vehicle photo ${idx + 1}`}
                        compact
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1E40AF]/10 text-[#1E40AF]">
                            Cover
                          </span>
                        )}
                        <span className="text-xs text-slate-600 truncate block">{url}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Move photo up"
                        className="p-1.5 rounded text-slate-500 hover:bg-white hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 1)}
                        disabled={idx === form.images.length - 1}
                        aria-label="Move photo down"
                        className="p-1.5 rounded text-slate-500 hover:bg-white hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        aria-label="Remove photo"
                        className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                No photo URLs added yet. A clean placeholder graphic will be displayed until you add
                one.
              </p>
            )}
          </fieldset>

          {/* Section 5: Notes */}
          <fieldset className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF] pt-2">
              5. Buyer Notes &amp; Inspection Checklist
            </legend>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Known weak spots, recommended engine/trim, service book items to verify..."
              aria-label="Buyer notes"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/15"
            />
          </fieldset>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1E3A8A] transition-colors cursor-pointer"
            >
              {editingCar ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </NativeModal>
  );
}
