import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * ConfirmDialog - A custom confirmation dialog component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onConfirm - Function to call when action is confirmed
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @returns {JSX.Element} Confirm dialog component
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 w-full max-w-md p-6 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-300">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-colors"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string
};

export default ConfirmDialog;
