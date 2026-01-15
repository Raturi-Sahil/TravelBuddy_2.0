import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * Custom confirmation dialog to replace browser's native confirm()
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.variant - "danger" | "warning" | "info" (default: "danger")
 * @param {function} props.onConfirm - Callback when user confirms
 * @param {function} props.onCancel - Callback when user cancels
 * @param {boolean} props.loading - Show loading state on confirm button
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel?.();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus confirm button when opened
      confirmBtnRef.current?.focus();
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  // Close when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onCancel?.();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      confirmBtn: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      confirmBtn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${styles.icon}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-500 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-5 py-2.5 text-white rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${styles.confirmBtn}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
