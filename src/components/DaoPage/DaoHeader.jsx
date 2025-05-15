import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * DaoHeader - Component for displaying the DAO page header with title and description
 */
const DaoHeader = ({ title, description }) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12 md:mb-16"
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
        {description}
      </p>
    </motion.header>
  );
};

DaoHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default DaoHeader;
