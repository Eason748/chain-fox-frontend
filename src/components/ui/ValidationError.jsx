import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * ValidationError - A component for displaying frontend validation errors
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {Function} props.onClose - Optional function to call when close button is clicked
 * @returns {JSX.Element} ValidationError component
 */
const ValidationError = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-6 p-4 bg-purple-900/50 border border-purple-700/70 text-purple-200 rounded-lg shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            {/* fronted validation error */}
            <span>{message}</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-purple-300 hover:text-purple-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

ValidationError.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func
};

export default ValidationError;
