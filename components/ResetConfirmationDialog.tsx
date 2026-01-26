/**
 * Reset Confirmation Dialog Component
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Modal dialog to confirm reset to AI-generated version
 * Prevents accidental data loss from user edits
 */

'use client';

interface ResetConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
}: ResetConfirmationDialogProps) {
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Handle Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fade-in">
        <div className="flex items-start gap-4 mb-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              id="reset-dialog-title"
              className="text-xl font-bold text-gray-900 mb-2"
            >
              Reset to AI Version?
            </h3>
            <p className="text-gray-700 leading-relaxed">
              This will discard all your edits and restore the original
              AI-generated resume. <strong>This action cannot be undone.</strong>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            autoFocus
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset to AI Version
          </button>
        </div>
      </div>
    </div>
  );
}
