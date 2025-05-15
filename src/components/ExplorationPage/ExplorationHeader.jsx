import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * ExplorationHeader - Header component for the Exploration page
 * Displays the page title and description with animation effects
 */
const ExplorationHeader = ({ title, description }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-4xl leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

ExplorationHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default ExplorationHeader;
