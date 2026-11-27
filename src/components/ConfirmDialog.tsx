import { AlertTriangle } from 'lucide-react';
import { NativeModal } from './NativeModal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <NativeModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="confirm-dialog-title"
      zIndexClass="z-[60]"
      panelClassName="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 id="confirm-dialog-title" className="text-base font-semibold text-[#0F172A]">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </NativeModal>
  );
}
