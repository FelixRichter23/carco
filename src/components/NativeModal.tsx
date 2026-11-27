import { useEffect, useRef, type ReactNode } from 'react';

interface NativeModalProps {
  open: boolean;
  onClose: () => void;
  ariaLabelledBy: string;
  closeOnBackdrop?: boolean;
  zIndexClass?: string;
  panelClassName?: string;
  children: ReactNode;
}

/**
 * Accessible native <dialog> wrapper using showModal() so overlays sit in the
 * browser top layer, enforce strict stacking above Viewing Mode, trap focus,
 * and restore focus to the invoker upon close.
 */
export function NativeModal({
  open,
  onClose,
  ariaLabelledBy,
  closeOnBackdrop = true,
  zIndexClass = 'z-50',
  panelClassName = 'w-full max-w-2xl',
  children,
}: NativeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      onCloseRef.current();
    };

    dialog.addEventListener('close', handleClose);

    // Fallback for browsers without native <dialog closedby="any"> support (e.g. Safari)
    let cleanupBackdropFallback: (() => void) | undefined;
    if (closeOnBackdrop && !('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e) && dialog.open) {
          dialog.close();
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupBackdropFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      cleanupBackdropFallback?.();
    };
  }, [closeOnBackdrop]);

  const dialogExtraProps = {
    closedby: closeOnBackdrop ? 'any' : 'closerequest',
  } as Record<string, string>;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={ariaLabelledBy}
      {...dialogExtraProps}
      className={`${zIndexClass} ${panelClassName}`}
    >
      {open ? children : null}
    </dialog>
  );
}
