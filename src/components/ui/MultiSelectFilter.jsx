import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * MultiSelectFilter - A styled dropdown component with checkboxes for filtering
 *
 * @param {Object} props - Component props
 * @param {Array} props.selectedValues - Array of currently selected values
 * @param {Function} props.onChange - Function called when selection changes
 * @param {Array} props.options - Array of option objects with value and label properties
 * @param {string} props.label - Label to display on the dropdown button
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Whether the select is disabled
 */
const MultiSelectFilter = ({
  selectedValues,
  onChange,
  options,
  label,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle checkbox toggle
  const handleToggle = (value) => {
    if (selectedValues.includes(value)) {
      // 允许取消选中所有选项
      const newValues = selectedValues.filter(v => v !== value);
      onChange(newValues);
    } else {
      // 添加选项
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div
      ref={selectRef}
      className={`relative ${className}`}
    >
      {/* Select button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-gray-300
          backdrop-blur-sm flex items-center justify-between
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-500/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30'}
          transition-all duration-200`}
        disabled={disabled}
      >
        <span className="truncate">
          {label}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu with checkboxes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 rounded-lg shadow-lg bg-black/90 backdrop-blur-lg border border-white/10 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className="px-4 py-2 cursor-pointer flex items-center text-gray-300 hover:bg-white/5 transition-colors duration-150"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggle(option.value)} // 直接在复选框上处理变更
                      className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()} // 防止事件冒泡，避免触发父div的onClick
                    />
                    <span className="ml-2">
                      {option.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

MultiSelectFilter.propTypes = {
  selectedValues: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired
    })
  ).isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default MultiSelectFilter;
