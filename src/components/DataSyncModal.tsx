import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Database,
  Download,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { AppStoragePayload, CarRecord } from '../types/car';
import { decodeStateFromBase64, encodeStateToBase64 } from '../utils/codec';
import { formatNumber } from '../utils/format';
import { buildResearchPrompt } from '../utils/prompt';
import { parseCarsJson } from '../utils/validation';
import { NativeModal } from './NativeModal';

interface DataSyncModalProps {
  open: boolean;
  payload: AppStoragePayload;
  onImportCars: (cars: CarRecord[], mode: 'merge' | 'replace') => void;
  onRestoreBackup: (payload: AppStoragePayload, mode: 'replace' | 'merge') => void;
  onRequestResetAll: () => void;
  onNotify: (message: string) => void;
  onClose: () => void;
}

type SyncTab = 'ai-json' | 'backup';

export function DataSyncModal({
  open,
  payload,
  onImportCars,
  onRestoreBackup,
  onRequestResetAll,
  onNotify,
  onClose,
}: DataSyncModalProps) {
  const [activeTab, setActiveTab] = useState<SyncTab>('ai-json');
  const [modelQuery, setModelQuery] = useState('');
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const defaultPrompt = useMemo(() => buildResearchPrompt(modelQuery), [modelQuery]);
  const activePrompt = customPrompt ?? defaultPrompt;

  const [jsonInput, setJsonInput] = useState('');
  const [jsonMode, setJsonMode] = useState<'merge' | 'replace'>('merge');
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);

  const [copiedBackup, setCopiedBackup] = useState(false);
  const [base64Input, setBase64Input] = useState('');
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const currentBase64 = useMemo(() => encodeStateToBase64(payload), [payload]);

  const copyText = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyPrompt = async () => {
    const ok = await copyText(activePrompt);
    if (ok) {
      setCopiedPrompt(true);
      onNotify('AI research prompt copied to clipboard.');
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      onNotify('Clipboard access blocked — copy the prompt preview manually.');
    }
  };

  const handleImportJson = () => {
    const result = parseCarsJson(jsonInput);
    if (!result.ok) {
      setJsonErrors(result.errors);
      return;
    }
    setJsonErrors([]);
    onImportCars(result.data, jsonMode);
    setJsonInput('');
    onNotify(
      `Imported ${result.data.length} ${result.data.length === 1 ? 'vehicle' : 'vehicles'} successfully.`,
    );
    onClose();
  };

  const handleCopyBackup = async () => {
    const ok = await copyText(currentBase64);
    if (ok) {
      setCopiedBackup(true);
      onNotify('Base64 backup copied to clipboard.');
      setTimeout(() => setCopiedBackup(false), 2000);
    } else {
      onNotify('Clipboard access blocked — copy the Base64 string from the preview.');
    }
  };

  const handleRestoreBase64 = () => {
    const decoded = decodeStateFromBase64(base64Input);
    if (!decoded.ok) {
      setRestoreError(decoded.error);
      return;
    }
    setRestoreError(null);
    onRestoreBackup(decoded.payload, restoreMode);
    setBase64Input('');
    onNotify(
      `Restored ${decoded.payload.cars.length} ${
        decoded.payload.cars.length === 1 ? 'vehicle' : 'vehicles'
      } (${restoreMode}).`,
    );
    onClose();
  };

  return (
    <NativeModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="data-sync-modal-title"
      zIndexClass="z-50"
      panelClassName="w-full max-w-3xl"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 id="data-sync-modal-title" className="text-lg font-semibold text-[#0F172A]">
              Data &amp; AI Agent Import
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate German-market research prompts, import JSON, or sync via Base64.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close data management dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="px-6 pt-3 border-b border-[#E2E8F0] flex gap-1 shrink-0">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ai-json'}
            onClick={() => setActiveTab('ai-json')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ai-json'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            AI Agent &amp; JSON Import
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'backup'}
            onClick={() => setActiveTab('backup')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            <Database className="w-4 h-4" aria-hidden="true" />
            Base64 Backup &amp; Reset
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'ai-json' ? (
            <>
              {/* AI Prompt Generator */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    1. Copy Research Prompt for External AI
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter a car model to generate a structured prompt that asks an AI assistant for
                    German market prices, €/km, Typklassen insurance, TÜV reliability, and strict
                    JSON output.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={modelQuery}
                    onChange={(e) => {
                      setModelQuery(e.target.value);
                      if (customPrompt !== null) setCustomPrompt(null);
                    }}
                    placeholder="e.g. Toyota Corolla Touring Sports 2.0 Hybrid, ~2021"
                    aria-label="Vehicle model to research"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E40AF]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#1E40AF] hover:bg-[#1E3A8A] text-white transition-colors cursor-pointer shrink-0"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" />
                        Copied Prompt
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        Copy Research Prompt
                      </>
                    )}
                  </button>
                </div>

                <details className="text-xs">
                  <summary className="text-slate-600 hover:text-[#1E40AF] font-medium cursor-pointer select-none flex items-center justify-between">
                    <span>
                      Preview &amp; edit prompt
                      {customPrompt !== null && (
                        <span className="ml-1.5 text-[11px] font-semibold text-[#1E40AF]">
                          (customized)
                        </span>
                      )}
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={10}
                      value={activePrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      aria-label="Editable AI research prompt"
                      className="w-full p-3 font-mono text-[11px] leading-relaxed bg-white border border-[#E2E8F0] rounded-lg text-slate-700 focus:outline-none focus:border-[#1E40AF]"
                    />
                    {customPrompt !== null && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCustomPrompt(null)}
                          className="text-xs font-medium text-[#1E40AF] hover:text-[#1E3A8A] cursor-pointer"
                        >
                          Reset to default prompt
                        </button>
                      </div>
                    )}
                  </div>
                </details>
              </div>

              {/* JSON Paste & Validation */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0F172A]">
                      2. Paste &amp; Import JSON Output
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accepts a single car object or an array of cars (supports{' '}
                      <code className="text-[11px] bg-slate-100 px-1 rounded">images: []</code> and
                      legacy <code className="text-[11px] bg-slate-100 px-1 rounded">imageUrl</code>
                      ).
                    </p>
                  </div>

                  <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setJsonMode('merge')}
                      className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                        jsonMode === 'merge' ? 'bg-white text-[#0F172A] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Merge
                    </button>
                    <button
                      type="button"
                      onClick={() => setJsonMode('replace')}
                      className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                        jsonMode === 'replace'
                          ? 'bg-white text-[#0F172A] shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Replace all
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    if (jsonErrors.length) setJsonErrors([]);
                  }}
                  placeholder='Paste JSON object or array here, e.g. { "brandModel": "...", "year": "2021", ... }'
                  aria-label="JSON car data input"
                  className="w-full p-3 font-mono text-xs bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1E40AF]"
                />

                {jsonErrors.length > 0 && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      Validation failed ({jsonErrors.length}{' '}
                      {jsonErrors.length === 1 ? 'issue' : 'issues'})
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {jsonErrors.slice(0, 8).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {jsonErrors.length > 8 && (
                        <li>...and {jsonErrors.length - 8} more validation errors.</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportJson}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#1E40AF] hover:bg-[#1E3A8A] text-white transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    Validate &amp; Import JSON
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Copy Base64 Backup */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0F172A]">
                      Export LocalStorage as Base64
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      UTF-8 safe snapshot of {payload.cars.length}{' '}
                      {payload.cars.length === 1 ? 'vehicle' : 'vehicles'}, favorites, and
                      settings ({formatNumber(currentBase64.length)} chars).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBackup}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-[#1E40AF] hover:bg-[#1E3A8A] text-white transition-colors cursor-pointer"
                  >
                    {copiedBackup ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" />
                        Copied Backup
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Copy Base64 Backup
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={3}
                  value={currentBase64}
                  aria-label="Current Base64 backup string"
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full p-2.5 font-mono text-[11px] bg-white border border-[#E2E8F0] rounded-lg text-slate-600"
                />
              </div>

              {/* Restore Base64 Backup */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0F172A]">
                      Restore Base64 Backup
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paste a previously exported Base64 string to replace or merge into this
                      browser.
                    </p>
                  </div>

                  <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F8F9FA] p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setRestoreMode('replace')}
                      className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                        restoreMode === 'replace'
                          ? 'bg-white text-[#0F172A] shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestoreMode('merge')}
                      className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                        restoreMode === 'merge'
                          ? 'bg-white text-[#0F172A] shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Merge
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={base64Input}
                  onChange={(e) => {
                    setBase64Input(e.target.value);
                    if (restoreError) setRestoreError(null);
                  }}
                  placeholder="Paste Base64 backup string here..."
                  aria-label="Base64 backup string to restore"
                  className="w-full p-3 font-mono text-xs bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1E40AF]"
                />

                {restoreError && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{restoreError}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRestoreBase64}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#0F172A] hover:bg-slate-800 text-white transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    Restore Base64 Backup
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-red-700">Reset All Data</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permanently clear all saved vehicles, favorites, and settings from local
                    storage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRequestResetAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Reset All Data
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </NativeModal>
  );
}
