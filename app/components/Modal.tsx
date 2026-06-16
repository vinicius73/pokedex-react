import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement | null>;
  subtitle?: string;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export function Modal({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  triggerRef,
  subtitle,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = getFocusableElements(dialogRef.current);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      const returnTarget = triggerRef?.current ?? previouslyFocused;

      if (returnTarget && document.contains(returnTarget)) {
        returnTarget.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="pokdex-backdrop-animate absolute inset-0 bg-ink/55 backdrop-blur-[3px] dark:bg-black/65"
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pokdex-modal-panel pokdex-modal-animate max-h-[92vh] cursor-default sm:max-h-[90vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pokdex-modal-header flex items-start justify-between gap-4">
          <div className="min-w-0 pt-1">
            {subtitle ? (
              <p className="pokdex-mono mb-1 text-xs font-medium tracking-wide text-gold">
                {subtitle}
              </p>
            ) : null}
            <h2
              id={titleId}
              className="pokdex-display truncate text-2xl leading-tight font-semibold text-ink dark:text-ink-dark"
            >
              {title}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="pokdex-modal-close"
            aria-label="Close dialog"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
